'use strict';

const fs = require('fs');
const express = require('express');
const morgan = require('morgan');
const mapnik = require('mapnik');
const SphericalMercator = require('@mapbox/sphericalmercator');

// Constants
const PORT = 8888;
const HOST = '0.0.0.0';

// Register fonts and datasource plugins
mapnik.register_default_fonts();
mapnik.register_default_input_plugins();

const mercator = new SphericalMercator();

// Create Express App
const app = express();

// Add logger
app.use(morgan('dev'));

app.get('/:uuid/:z/:x/:y.png', function(req, res, next) {
  // Get config and replace GeoTiff UUID
  const xml = fs.readFileSync('imagery.xml', 'utf8').replace('{{uuid}}', req.params.uuid);

  // Create Mapnik object
  const map = new mapnik.Map(256, 256);

  // Convert XYZ to BoundingBox and set the Map extent
  map.zoomToBox(mercator.bbox(req.params.x, req.params.y, req.params.z, false, '900913'));

  // Read map config from modified XML
  map.fromString(xml, function(err, map) {
    if (err) return next(err);

    // Create image object from map config
    var im = new mapnik.Image(map.width, map.height);

    // Render and return PNG
    map.render(im, function(err,im) {
      if (err) return next(err);

      res.writeHead(200, {
        'Content-Type': 'image/png'
      });
      res.end(im.encodeSync('png'));
    });
  });
});

// Start Server
app.listen(PORT, HOST);
console.log(`Running on http://${HOST}:${PORT}`);
