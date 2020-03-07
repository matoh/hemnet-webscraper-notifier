const express = require('express');
const axios = require('axios');
const xml2js = require('xml2js');

const app = express();
const port = process.env.PORT || 3000;
const rssHemnetUrl = process.env.RSS_HEMNET_URL;

app.get('/', (req, res) => {
    axios.get(rssHemnetUrl)
        .then(response => xml2js.parseStringPromise(response.data))
        .then((parsedResponse) => {
           const jsonResponse = JSON.stringify(parsedResponse);
           res.send(jsonResponse)
        });
});

app.listen(port, () => {
    console.log(`App is listening on port ${port}, \nAccess app: http://localhost:${port}`)
});