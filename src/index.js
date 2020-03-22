'use strict';

const express = require('express');
const serverless = require('serverless-http');
const cronHandler = require('./handlers/cron');

const app = express();
const port = process.env.PORT || 3000;

app.get('/', (req, res) => {
  res.send('It works!');
  // cronHandler({}, {}, () => {});
});

app.listen(port, () => {
  console.log(
      `App is listening on port ${port}, \nAccess app: http://localhost:${port}`);
});

module.exports = {
  api: serverless(app),
  cron: cronHandler,
};
