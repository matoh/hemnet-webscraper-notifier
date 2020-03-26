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
RSS_HEMNET_URL=https://www.hemnet.se/mitt_hemnet/sparade_sokningar/xxxxxxxxx.xml SOURCE_EMAIL=xxx@xxx.com TO_EMAILS=xxx@xxx.com TABLE_SEARCH_RESULT=dev-hemnet-webscraper-notifier-search-result npm run start
```
Trigger `handlers/cron.js` manually of from some route e.g: (call cronHandler({}, {}, () => {});)

## How to start on remote environment
Rename file `.env.example` to `.env` and replace secret values.
Run:
```sh
serverless deploy
```