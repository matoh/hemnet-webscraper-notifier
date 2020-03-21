'use strict';

const serverless = require('serverless-http');
const express = require('express');
const aws = require('aws-sdk');
const moment = require('moment');
const cronHandler = require('./handlers/cron');
const {fetchItemsFromHemnet} = require('./services/searchService');

const dynamoDb = new aws.DynamoDB.DocumentClient();
const app = express();
const port = process.env.PORT || 3000;
const rssHemnetUrl = process.env.RSS_HEMNET_URL;

const sourceEmail = process.env.SOURCE_EMAIL;
const toEmails = [process.env.TO_EMAILS];

app.get('/', (req, res) => {
  fetchItemsFromHemnet(rssHemnetUrl).then((items) => {
    for (const item of items) {
      // Format from date format: Sat, 07 Mar 2020 12:15:52 +0100
      const itemPubDate = moment(item.pubDate[0], 'DD MMM YYYY HH:mm:ss');
      // Ignore items older than 2 hours
      // TODO: Make hours configurable
      if (moment().diff(itemPubDate, 'hours') > 10) {
        console.log('Ignore items older than 2 hours');
        continue;
      }

      const itemObject = {
        // Match ID of the item - 16659410 - "https://www.hemnet.se/...sjomilsgatan-4-16659410"
        id: parseInt(item.link[0].match(/-(\d+$)/)[1]),
        pubDate: itemPubDate.format(), // 2020-03-08T22:31:00+01:00
        title: item.title[0],
        description: item.description[0],
        link: item.link[0],
      };

      const itemInsert = {
        TableName: 'dev-hemnet-webscraper-notifier-search-resultx',
        Item: itemObject,
        ConditionExpression: '#id <> :id', // Prevent overwriting existing records

        ExpressionAttributeNames: {
          '#id': 'id',
        },
        ExpressionAttributeValues: {
          ':id': itemObject.id,
        },
      };

      dynamoDb.put(itemInsert, function(err, data) {
        if (err === null) {
          console.log('Found a new apartment, sending an email');
          const emailParams = {
            Destination: {
              ToAddresses: toEmails,
            },
            Message: {
              Body: {
                Html: {
                  Data: '<h1>Enjoy New Webscraper</h1>' +
                      'Link: <a class="ulink" href="' + itemObject.link +
                      '" target="_blank">New Appartment</a>.' +
                      '<h3>Description: ' + itemObject.description +
                      '</h3>' +
                      '<h2>Apartment was posted: ' + item.pubDate[0] +
                      '</h2>',
                },
              },
              Subject: {
                Data: 'Check new appartment - ' + itemObject.title,
              },
            },
            Source: sourceEmail,
          };

          console.log('Email: ', emailParams);

          const ses = new aws.SES();
          // ses.sendEmail(emailParams, function (err, data) {
          //     if (err) { // // an error occurred
          //         console.log(err, err.stack);
          //     } else { // successful response
          //         console.log(data);
          //     }
          // });

          ses.sendEmail(emailParams).promise().then((data) => {
            console.log('Email was sent');
          }).catch((err) => {
            console.log('There was an error');
            // console.log(err, err.stack);
          });
        } else if (err.code === 'ConditionalCheckFailedException') {
          console.log('Item with ID ' + itemObject.id + ' already exist.');
        } else {
          console.log('Something went wrong: ', err);
        }
      });
    }

    res.send(JSON.stringify(items));
  }).catch((error) => {
    res.send('There was an error: ', error);
  });
});

app.listen(port, () => {
  console.log(
      `App is listening on port ${port}, \nAccess app: http://localhost:${port}`);
});

module.exports = {
  api: serverless(app),
  cron: cronHandler,
};
