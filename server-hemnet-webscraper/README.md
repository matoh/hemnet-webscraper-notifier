# Hemnet webscraper notifier
Node app scraping Hemnet data and sending notifications after matching saved searches.

## Prerequisites
* Register at [Hemnet](https://www.hemnet.se/)
* Search for an accommodation, set filters etc..
* Enter "[saved searched](https://www.hemnet.se/mitt_hemnet/sparade_sokningar)"
* Copy RSS source for scraping data - RSS_HEMNET_URL
* Verify from and to email addresses in AWS SES

## How to configure local environment
Rename file `.env.example` to `.env` and replace configuration values.

## How to start node server in local environment
Start service with all mandatory environment variables:
```sh
nodemon -r dotenv/config
```
## How to trigger lambda "function" locally
Use Serverless invoke local command described: [cli-reference](https://serverless.com/framework/docs/providers/aws/cli-reference/invoke-local)

Run:
```sh
serverless invoke local -f webscrape 
```

## How to trigger AWS lambda function locally
Run:
```sh
serverless invoke -f webscrape 
```


## How to deploy on AWS
Run:
```sh
serverless deploy
```
