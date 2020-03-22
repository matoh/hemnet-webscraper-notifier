'use strict';

const express = require('express');
const serverless = require('serverless-http');
const moment = require('moment');
const cronHandler = require('./handlers/cron');
const {fetchItemsFromHemnet} = require('./services/searchService');
const {ItemHemnet, parsePubDate} = require('./models/itemHemnet');
const {dynamoDb, ses} = require('./clients/awsHemnet');

const app = express();
const port = process.env.PORT || 3000;
const ignoreItemsBeforeHours = process.env.IGNORE_ITEMS_BEFORE_HOURS || 10;
const rssHemnetUrl = process.env.RSS_HEMNET_URL;

const sourceEmail = process.env.SOURCE_EMAIL;
const toEmails = [process.env.TO_EMAILS];

app.get('/', (req, res) => {
  fetchItemsFromHemnet(rssHemnetUrl)
      .then((items) => {
        for (const item of items) {
          // Format published date from date format: Sat, 07 Mar 2020 12:15:52 +0100
          const itemPubDate = parsePubDate(item.pubDate[0]);
          // Ignore items older than {IGNORE_ITEMS_BEFORE_HOURS} hours
          if (moment().diff(itemPubDate, 'hours') > ignoreItemsBeforeHours) {
            console.log(`Ignore items older than ${ignoreItemsBeforeHours} hours`);
            continue;
          }

          const itemHemnet = new ItemHemnet(item);

          dynamoDb.putItem(itemHemnet)
              .then((data) => {
                ses.sendEmail(toEmails, itemHemnet, sourceEmail)
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

        res.send(JSON.stringify(items));
      })
      .catch((error) => {
        console.log('Cannot fetch items. Error details: ', error);
        res.send('Something went wrong');
      });
})
;

app.listen(port, () => {
  console.log(
      `App is listening on port ${port}, \nAccess app: http://localhost:${port}`);
});

module.exports = {
  api: serverless(app),
  cron: cronHandler,
};
