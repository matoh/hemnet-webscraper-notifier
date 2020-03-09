# Hemnet webscraper notifier
Node app scraping Hemnet data and sending notifications

## Prerequisites
* Register at [Hemnet](https://www.hemnet.se/)
* Search for an accomodation, set filters etc..
* Enter "[saved searched](https://www.hemnet.se/mitt_hemnet/sparade_sokningar)"
* Copy RSS source for scraping data - RSS_HEMNET_URL

## How to start on local environment
```sh
RSS_HEMNET_URL=https://www.hemnet.se/mitt_hemnet/sparade_sokningar/xxxxxxxxx.xml npm run start
```

## How to start on remote environment
Rename file `secrets.yml.example` to `secrets.yml` and replace secret values.