# Hemnet webscraper notifier
Node app scraping Hemnet data and sending notifications after matching saved searches.

## Prerequisites
* Register at [Hemnet](https://www.hemnet.se/)
* Search for an accommodation, set filters etc..
* Enter "[saved searched](https://www.hemnet.se/mitt_hemnet/sparade_sokningar)"
* Copy RSS source for scraping data - RSS_HEMNET_URL
* Verify from and to email addresses in AWS SES

## How to start on local environment
Start service with all mandatory environment variables:
```sh
nodemon -r dotenv/config
```
Trigger `handlers/cron.js` manually e.g: (call cronHandler({}, {}, () => {});)

## How to configure local DEV environment
Rename file `.env.example` to `.env` and replace configuration values.

## How to deploy on AWS
Run:
```sh
serverless deploy
```
