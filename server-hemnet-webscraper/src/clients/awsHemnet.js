'use strict';

const aws = require('aws-sdk');

const dynamoDbClient = new aws.DynamoDB.DocumentClient();

/**
 * Put item into DynamoDB
 * @param {object} itemHemnet
 * @return {Promise<PromiseResult<DocumentClient.PutItemOutput, AWSError>>}
 */
function putItem(itemHemnet) {
  const tableSearchResult = process.env.TABLE_SEARCH_RESULT;
  const itemInsert = {
    TableName: tableSearchResult,
    Item: itemHemnet,
    ConditionExpression: '#id <> :id', // Prevent overwriting existing records
    ExpressionAttributeNames: {
      '#id': 'id',
    },
    ExpressionAttributeValues: {
      ':id': itemHemnet.id,
    },
  };

  return dynamoDbClient.put(itemInsert)
      .promise();
}

/**
 * Return all items from DB
 * @return {Promise<PromiseResult<DocumentClient.ScanOutput, AWSError>>}
 */
function listItems() {
  const tableSearchResult = process.env.TABLE_SEARCH_RESULT;
  const params = {
    TableName: tableSearchResult,
  };
  return dynamoDbClient.scan(params)
      .promise();
}

/**
 * Send notification email by AWS SNS
 * @param {array} toEmails
 * @param {object} itemHemnet
 * @param {string} sourceEmail
 * @return {Promise<PromiseResult<SES.SendEmailResponse, AWSError>>}
 */
function sendEmail(toEmails, itemHemnet, sourceEmail) {
  const emailParams = {
    Destination: {
      ToAddresses: toEmails,
    },
    Message: {
      Body: {
        Html: {
          Data: `<h1>Enjoy New Webscraper Service</h1>
              <h3>Link: <a class="ulink" href="${itemHemnet.link}" target="_blank">New Appartment</a></h3>
              <h3>Description</h3><p>${itemHemnet.description}</p>
              <h4>Distance from work: ${itemHemnet.distance}</h4>
              <h4>Travel time from work: ${itemHemnet.duration}</h4>
              <h3>Apartment was posted: ${itemHemnet.pubDate}</h3>`,
        },
      },
      Subject: {
        Data: 'Check new apartment - ' + itemHemnet.title,
      },
    },
    Source: sourceEmail,
  };

  console.log('Email: ', emailParams);

  const sesClient = new aws.SES();
  return sesClient.sendEmail(emailParams)
      .promise();
}

module.exports = {
  dynamoDb: {
    putItem,
    listItems,
  },
  ses: {
    sendEmail,
  },
};
