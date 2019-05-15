'use strict';

const fs = require('fs');
const express = require('express');
const morgan = require('morgan');
const mapnik = require('mapnik');
const SphericalMercator = require('@mapbox/sphericalmercator');
const Handlebars = require('handlebars');

// Load config for non-production environments
if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}

// Register fonts and datasource plugins
mapnik.register_default_fonts();
mapnik.register_default_input_plugins();

const mercator = new SphericalMercator();

// Setup imagery config template
const imagery = Handlebars.compile(fs.readFileSync('imagery.xml', 'utf8'));

// Setup gssurgo config
const gssurgo = Handlebars.compile(fs.readFileSync('gssurgo.xml', 'utf8'))({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  dbname: process.env.DB_NAME,
  table: process.env.DB_TABLE
});

// Create Express App
const app = express();

// Add logger
app.use(morgan('dev'));

const generateTile = function(req, res, next, config) {
  // Create Mapnik object
  const map = new mapnik.Map(256, 256);

  // Convert XYZ to BoundingBox and set the Map extent
  map.zoomToBox(mercator.bbox(req.params.x, req.params.y, req.params.z, false, '900913'));

  // Read map config
  map.fromString(config, function(err, map) {
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
}

// Ceres imagery tiles
app.get('/imagery/:uuid/:z/:x/:y.png', function(req, res, next) {
  generateTile(req, res, next, imagery({ uuid: req.params.uuid}));
});

// GSSURGO (Soil) tiles
app.get('/soil/:z/:x/:y.png', function(req, res, next) {
  generateTile(req, res, next, gssurgo);
});

// Start Server
app.listen(process.env.PORT, process.env.HOST);
console.log(`Running on http://${process.env.HOST}:${process.env.PORT}`);
