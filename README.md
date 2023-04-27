[![Greenkeeper badge](https://badges.greenkeeper.io/geostyler/geostyler-cql-parser.svg)](https://greenkeeper.io/)
[![Build Status](https://travis-ci.com/geostyler/geostyler-cql-parser.svg?branch=master)](https://travis-ci.com/geostyler/geostyler-cql-parser)
[![Coverage Status](https://coveralls.io/repos/github/geostyler/geostyler-cql-parser/badge.svg?branch=master)](https://coveralls.io/github/geostyler/geostyler-cql-parser?branch=master)

# geostyler-cql-parser
[GeoStyler](https://github.com/geostyler/geostyler/) Translates CQL Filter and Geostyler Style Filters

This is almost a 1on1 transformation from the [OpenLayers v2 CQL Parser](https://github.com/openlayers/ol2/blob/master/lib/OpenLayers/Format/CQL.js)
to TypeScript. Except that it writes Filters in the [GeoStyler Style](https://github.com/geostyler/geostyler-style) format instead of ol styles.

But you can easily transform the GeoStyler Styles to OL3 with the [GeoStyler OpenLayers Parser](https://github.com/geostyler/geostyler-openlayers-parser).
So its just two steps from CQL Filter to OL3 Styles.

## Building the parser

Run `npm run generate` everytime the `cql-parser.js` needs to be updated.

**Important:** Make sure to remove the export of `main` in order to prevent errors that occur when using the parser in the browser. I.e.
following lines should be removed:

```js
exports.main = function commonjsMain (args) {};
if (typeof module !== 'undefined' && require.main === module) {
  exports.main(process.argv.slice(1));
}
```
