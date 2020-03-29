'use strict';

const express = require('express');
const cors = require('cors');
const serverless = require('serverless-http');
const cronHandler = require('./handlers/cron');
const {dynamoDb} = require('./clients/awsHemnet');
const {fetchItemsFromHemnet} = require('./services/searchService');

const app = express();
app.use(cors());
const port = process.env.PORT || 3000;
const rssHemnetUrl = process.env.RSS_HEMNET_URL;

app.get('/', (req, res) => {
  res.send('It works!');
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

app.get('/api/static', (req, res) => {
  const staticSearchResults = require('../examples/FetchedAndParsedSearchResults');
  res.send(staticSearchResults);
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

// Start express listen only for local development. process.env.IS_LOCAL is set from Serverless framework
// process.env.AWS_EXECUTION_ENV is set by AWS Lambda and describes runtime identifier
if (!process.env.IS_LOCAL && !process.env.AWS_EXECUTION_ENV) {
  app.listen(port, () => {
    console.log(
        `App is listening on port ${port}, \nAccess app: http://localhost:${port}`);
  });
}

module.exports = {
  api: serverless(app),
  cron: cronHandler,
};
