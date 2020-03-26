'use strict';

const moment = require('moment');
const {fetchItemsFromHemnet} = require('../services/searchService');
const {ItemHemnet, parsePubDate} = require('../models/itemHemnet');
const {dynamoDb, ses} = require('../clients/awsHemnet');
const axios = require('axios');

const rssHemnetUrl = process.env.RSS_HEMNET_URL;
const sourceEmail = process.env.SOURCE_EMAIL;
const toEmails = [process.env.TO_EMAILS];
const ignoreItemsBeforeHours = process.env.IGNORE_ITEMS_BEFORE_HOURS || 10;

module.exports = (event, context, callback) => {
  fetchItemsFromHemnet(rssHemnetUrl)
      .then((items) => {
        return Promise.all(
            items.filter((item) => {
              // Format published date from date format: Sat, 07 Mar 2020 12:15:52 +0100
              const itemPubDate = parsePubDate(item.pubDate[0]);
              // Ignore items older than {IGNORE_ITEMS_BEFORE_HOURS} hours
              if (moment().diff(itemPubDate, 'hours') > ignoreItemsBeforeHours) {
                console.log(`Ignore items older than ${ignoreItemsBeforeHours} hours`);
                return false;
              }
              return true;
            }).map((item) => {
              return axios.get(replaceDirectionMatrixPlaceholders(item))
                  .then(parseDirection)
                  .then((directionMatrix) => new ItemHemnet(item, directionMatrix));
            }),
        );
      })
      .then((itemsHemnet) => {
        for (const itemHemnet of itemsHemnet) {
          dynamoDb.putItem(itemHemnet)
              .then((data) => {
                return ses.sendEmail(toEmails, itemHemnet, sourceEmail)
                    .then((data) => {
                      console.log('Email was sent:', data);
                    })
                    .catch((err) => {
                      console.log('Email not sent. Error details:', err);
                    });
              })
              .catch((err) => {
                if (err.code === 'ConditionalCheckFailedException') {
                  console.log('Item with ID ' + itemHemnet.id + ' already exist.');
                } else {
                  console.log('Error during put DynamoDB event. Error details:', err);
                }
              });
        }
      })
      .catch((error) => {
        console.log('Cannot fetch items. Error details: ', error);
      });

  callback(null);
};

/**
 * Parse response from the Google Matrix Direction API
 * @param {object} directions
 * @return {Promise<unknown>}
 */
function parseDirection(directions) {
  return new Promise((resolve, reject) => {
    return resolve({
      distance: directions.data.rows[0].elements[0].distance.text,
      duration: directions.data.rows[0].elements[0].duration.text,
    });
  });
}

/**
 * Replace placeholders
 * @param {string} item
 * @return {string}
 */
function replaceDirectionMatrixPlaceholders(item) {
  return process.env.DIRECTION_MATRIX_API_ENDPOINT
      .replace(/\{address\}/g, encodeURI(item.title[0]))
      .replace(/\{google_api_key\}/g, encodeURI(process.env.GOOGLE_API_KEY))
      .replace(/\{from_address\}/g, encodeURI(process.env.FROM_ADDRESS))
      .replace(/\{city\}/g, encodeURI(process.env.CITY))
      .replace(/\{country_code\}/g, encodeURI(process.env.COUNTRY_CODE));
}
