'use strict';

const axios = require('axios');
const xml2js = require('xml2js');

/**
 * Fetch content from 'Saved searches' and return parsed items
 * @param {string} rssHemnetUrl
 * @return {Promise<AxiosResponse<T>>}
 */
function fetchItemsFromHemnet(rssHemnetUrl) {
  return axios.get(rssHemnetUrl)
      // Parse XML to Javascript object
      .then((response) => xml2js.parseStringPromise(response.data))
      // Fetch only array of the apartments
      .then((parsedResponse) => parsedResponse.rss.channel[0].item)
      .then((items) => items);
}

module.exports = {
  fetchItemsFromHemnet,
};
