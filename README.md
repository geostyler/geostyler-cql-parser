[![Greenkeeper badge](https://badges.greenkeeper.io/terrestris/geostyler-cql-parser.svg)](https://greenkeeper.io/)
[![Build Status](https://travis-ci.com/terrestris/geostyler-cql-parser.svg?branch=master)](https://travis-ci.com/terrestris/geostyler-cql-parser)
[![Coverage Status](https://coveralls.io/repos/github/terrestris/geostyler-cql-parser/badge.svg?branch=master)](https://coveralls.io/github/terrestris/geostyler-cql-parser?branch=master)

# geostyler-cql-parser
[GeoStyler](https://github.com/terrestris/geostyler/) Translates CQL Filter and Geostyler Style Filters

This is almost a 1on1 transformation from the [OpenLayers v2 CQL Parser](https://github.com/openlayers/ol2/blob/master/lib/OpenLayers/Format/CQL.js)
to TypeScript. Except that it writes Filters in the [GeoStyler Style](https://github.com/terrestris/geostyler-style) format instead of ol styles.

But you can easily transform the GeoStyler Styles to OL3 with the [GeoStyler OpenLayers Parser](https://github.com/terrestris/geostyler-openlayers-parser).
So its just two steps from CQL Filter to OL3 Styles.

### Issues
Please provide related issues here https://github.com/terrestris/geostyler/issues
