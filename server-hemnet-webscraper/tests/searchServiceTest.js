require('dotenv').config();
const assert = require('assert');
const searchService = require('../src/services/searchService');
const {ItemHemnet} = require('../src/models/itemHemnet');

describe('Search Service Tests', function() {
  describe('fetchItemsFromHemnet()', function() {
    it('Should return Hemnet items', function() {
      return searchService.fetchItemsFromHemnet(process.env.RSS_HEMNET_URL)
          .then((items) => {
            assert.ok(items.length > 1);

            const item = items[0];
            assert.equal(typeof item.title[0], 'string');
            assert.equal(typeof item.description[0], 'string');
            assert.equal(typeof item.pubDate[0], 'string');
            assert.equal(typeof item.link[0], 'string');
            assert.equal(typeof item.guid[0], 'string');

            assert.ok(new ItemHemnet(item, {}));
          });
    });
  });
});
