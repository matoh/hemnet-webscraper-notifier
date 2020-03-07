const express = require('express');
const axios = require('axios');
const xml2js = require('xml2js');

const app = express();
const port = process.env.PORT || 3000;
const rssHemnetUrl = process.env.RSS_HEMNET_URL;

app.get('/', (req, res) => {
    axios.get(rssHemnetUrl)
        // Parse XML to Javascript object
        .then(response => xml2js.parseStringPromise(response.data))
        // Fetch only array of the apartments
        .then((parsedResponse) => parsedResponse.rss.channel[0].item)
        .then(items => {
            res.send(JSON.stringify(items));
        })
        .catch((error) => res.send('There was an error: ', error));
});

app.listen(port, () => {
    console.log(`App is listening on port ${port}, \nAccess app: http://localhost:${port}`)
});