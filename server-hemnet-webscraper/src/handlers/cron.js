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
const directionMatrixApiEndpoint = process.env.DIRECTION_MATRIX_API_ENDPOINT;

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
              // console.log('item', item);
              return axios.get(directionMatrixApiEndpoint.replace('{address}', encodeURI(item.title[0])))
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

function parseDirection(directions) {
  return new Promise((resolve, reject) => {
    return resolve({
      distance: directions.data.rows[0].elements[0].distance.text,
      duration: directions.data.rows[0].elements[0].duration.text,
    });
  });
}
