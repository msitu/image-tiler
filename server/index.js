'use strict';

const fs = require('fs');
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const mapnik = require('mapnik');
const SphericalMercator = require('@mapbox/sphericalmercator');
const Handlebars = require('handlebars');

// Load config from .env file
require('dotenv').config();

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

// Add CORS
app.use(cors({ origin: true }));

// Add logger
app.use(morgan(':date[iso] :remote-addr :url :status :response-time ms'));

// Generate PNG and respond the request with it
const generateImage = function(map, res, next) {
  // Create image object from map config
  const image = new mapnik.Image(map.width, map.height);

  // Render and return PNG
  map.render(image, function(err, tile) {
    if (err) return next(err);

    tile.encode('png', function(err, png) {
      if (err) return next(err);

      res.writeHead(200, { 'Content-Type': 'image/png' });
      res.end(png);
    });
  });
};

// Generate tile base on config
const generateTile = function(req, res, next, config) {
  // Create Mapnik object
  const map = new mapnik.Map(256, 256);

  // Read map config
  map.fromString(config, function(err, map) {
    if (err) return next(err);

    // Convert XYZ to BoundingBox and set the Map extent
    map.zoomToBox(mercator.bbox(req.params.x, req.params.y, req.params.z, false, '900913'));

    generateImage(map, res, next);
  });
};

// Ceres imagery tiles
app.get('/imagery/:uuid/:z/:x/:y.png', function(req, res, next) {
  generateTile(req, res, next, imagery({ uuid: req.params.uuid}));
});

// GSSURGO (Soil) tiles
app.get('/soil/:z/:x/:y.png', function(req, res, next) {
  generateTile(req, res, next, gssurgo);
});

// Ceres imagery untiled image
app.get('/imagery/:uuid.png', function(req, res, next) {
  // Get size from query params
  const width = req.query.width || 1024;
  const height = req.query.height || 1024;

  // Create Mapnik object
  const map = new mapnik.Map(width, height);

  // Read map config
  map.fromString(imagery({ uuid: req.params.uuid}), function(err, map) {
    if (err) return next(err);

    // Zoom to image extent
    map.zoomAll();

    generateImage(map, res, next);
  });
});

// VRA Generator
app.get('/vra/:uuid', function(req, res, next) {
  // const raster = gdal.open(`/vsicurl/https://s3-us-west-2.amazonaws.com/ceres-geotiff-data/${req.params.uuid}.tif`);
  const raster = gdal.open(`./${req.params.uuid}.tif`);

  const temp = gdal.open('temp', 'w', 'Memory');

  const layer = temp.layers.create('temp', null, gdal.Polygon);
  layer.fields.add(new gdal.FieldDefn('val', gdal.OFTInteger));

  gdal.polygonize({
    src: raster.bands.get(1),
    dst: layer,
    pixValField: 0,
    connectedness: 8
  });

  const features = layer.features.map(function(f) {
    return {
      properties: f.fields.toObject(),
      geometry: f.getGeometry().toObject()
    };
  });

  res.json({
    type: 'FeatureCollection',
    features: features
  });
});

// Server status check
app.get('/status', function(req, res, next) {
  res.sendStatus(200);
});

// Start Server
app.listen(process.env.PORT, process.env.HOST);
console.log(`Running on http://${process.env.HOST}:${process.env.PORT}`);
