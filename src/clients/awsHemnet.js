'use strict';

const aws = require('aws-sdk');

const dynamoDbClient = new aws.DynamoDB.DocumentClient();

/**
 * Put item into DynamoDB
 * @param {object} itemHemnet
 * @return {Promise<PromiseResult<DocumentClient.PutItemOutput, AWSError>>}
 */
function putItem(itemHemnet) {
  const itemInsert = {
    TableName: 'dev-hemnet-webscraper-notifier-search-resultx',
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
  },
  ses: {
    sendEmail,
  },
};
