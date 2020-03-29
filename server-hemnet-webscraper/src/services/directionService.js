'use strict';

const axios = require('axios');

/**
 * Get direction matrix from Google API
 * @param {string} item
 * @return {Promise<AxiosResponse<T>>}
 */
function getDirectionMatrix(item) {
  return axios.get(replaceDirectionMatrixPlaceholders(item))
      .then(parseDirection);
}


/**
 * Replace placeholders for Google Direction Matrix API Call
 * @param {string} item
 * @return {string}
 */
function replaceDirectionMatrixPlaceholders(item) {
  return process.env.DIRECTION_MATRIX_API_ENDPOINT
      .replace(/\{address\}/g, encodeURI(item.title[0]))
      .replace(/\{google_api_key\}/g, encodeURI(process.env.GOOGLE_API_KEY))
      .replace(/\{from_address\}/g, encodeURI(process.env.FROM_ADDRESS))
      .replace(/\{city\}/g, encodeURI(process.env.CITY))
      .replace(/\{country_code\}/g, encodeURI(process.env.COUNTRY_CODE));
}

/**
 * Parse response from the Google Matrix Direction API
 * @param {object} directions
 * @return {Promise<unknown>}
 */
function parseDirection(directions) {
  return new Promise((resolve, reject) => {
    return resolve({
      distance: directions.data.rows[0].elements[0].distance.text,
      duration: directions.data.rows[0].elements[0].duration.text,
    });
  });
}

module.exports = {
  getDirectionMatrix,
};
