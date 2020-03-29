'use strict';

const moment = require('moment');
const {fetchItemsFromHemnet} = require('../services/searchService');
const {getDirectionMatrix} = require('../services/directionService');
const {ItemHemnet, parsePubDate} = require('../models/itemHemnet');
const {dynamoDb, ses} = require('../clients/awsHemnet');

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
              return moment().diff(itemPubDate, 'hours') <= ignoreItemsBeforeHours;
            }).map((item) => {
              return getDirectionMatrix(item)
                  .then((directionMatrix) => new ItemHemnet(item, directionMatrix));
            }),
        );
      })
      .then((itemsHemnet) => {
        return Promise.all(
            itemsHemnet.map((itemHemnet) => {
              return dynamoDb.putItem(itemHemnet)
                  .then((data) => {
                    return ses.sendEmail(toEmails, itemHemnet, sourceEmail)
                        .then((data) => {
                          console.log('Email was sent:', data);
                          return data;
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
            }),
        );
      })
      .then((res) => {
        callback(null);
      })
      .catch((error) => {
        console.log('Cannot fetch items. Error details: ', error);
        callback(error);
      });
};
