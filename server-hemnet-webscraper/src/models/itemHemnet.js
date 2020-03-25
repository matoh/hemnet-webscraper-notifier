'use strict';

const moment = require('moment');

/**
 * Hemnet item model
 */
class ItemHemnet {
  constructor(item, directionMatrix) {
    // Match ID of the item - 16659410 - "https://www.hemnet.se/...sjomilsgatan-4-16659410"
    this.id = parseInt(item.link[0].match(/-(\d+$)/)[1]);
    this.pubDate = parsePubDate(item.pubDate[0]).format('YYYY-MM-DD[T]HH:mm:ss'); // 2020-03-08T22:31:00
    this.title = item.title[0];
    this.description = item.description[0];
    this.link = item.link[0];
    this.distance = directionMatrix.distance;
    this.duration = directionMatrix.duration;
  }
}

/**
 * Parse published date of Hemnet item by Moment
 * From format: Sat, 07 Mar 2020 12:15:52 +0100
 *
 * @param {string} pubDate
 * @return {*|moment.Moment}
 */
function parsePubDate(pubDate) {
  return moment(pubDate, 'DD MMM YYYY HH:mm:ss');
}

module.exports = {
  ItemHemnet,
  parsePubDate,
};
