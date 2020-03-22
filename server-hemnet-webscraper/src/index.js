'use strict';

const express = require('express');
const serverless = require('serverless-http');
const cronHandler = require('./handlers/cron');
const {dynamoDb} = require('./clients/awsHemnet');
const {fetchItemsFromHemnet} = require('./services/searchService');

const app = express();
const port = process.env.PORT || 3000;
const rssHemnetUrl = process.env.RSS_HEMNET_URL;

app.get('/', (req, res) => {
  res.send('It works!');
  // cronHandler({}, {}, () => {});
});

app.get('/api/scrapeItems', (req, res) => {
  fetchItemsFromHemnet(rssHemnetUrl)
      .then((items) => {
        res.send(items);
      })
      .catch((err) => {
        console.log('Cannot scrape items. Error details: ', err);
        res.status(500).send('There was an error, cannot scrape items');
      });
});

app.get('/api/getStoredItems', (req, res) => {
  dynamoDb.listItems()
      .then((items) => {
        res.send(items);
      })
      .catch((err) => {
        console.log('Cannot get stored items. Error details: ', err);
        res.status(500).send('Something went wrong, cannot fetch stored items');
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
