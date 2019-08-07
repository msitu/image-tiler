const fs = require('fs')
const express = require('express')
const cors = require('cors')
const morgan = require('morgan')
const mapnik = require('mapnik')
const SphericalMercator = require('@mapbox/sphericalmercator')
const Handlebars = require('handlebars')

const download = require('./download')

// Load config from .env file
require('dotenv').config()

// Register fonts and datasource plugins
mapnik.register_default_fonts()
mapnik.register_default_input_plugins()

const mercator = new SphericalMercator()

const uuidPattern = /^[0-9A-F]{8}-[0-9A-F]{4}-[0-9A-F]{4}-[0-9A-F]{4}-[0-9A-F]{12}$/i

// Setup imagery config template
const imagery = Handlebars.compile(fs.readFileSync('imagery.xml', 'utf8'))

// Setup gssurgo config
const gssurgo = Handlebars.compile(fs.readFileSync('gssurgo.xml', 'utf8'))({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  dbname: process.env.DB_NAME,
  table: process.env.DB_TABLE
})

// Create Express App
const app = express()

// Add CORS
app.use(cors({ origin: true }))

// Add logger
app.use(morgan(':date[iso] :remote-addr :url :status :response-time ms'))

// Generate PNG and respond the request with it
const generateImage = function (map, res, next) {
  // Create image object from map config
  const image = new mapnik.Image(map.width, map.height)

  // Render and return PNG
  map.render(image, (renderError, tile) => {
    if (renderError) return next(renderError)

    tile.encode('png', (encodeError, png) => {
      if (encodeError) return next(encodeError)

      // Set cache age to 90 days
      res.set('Cache-Control', 'max-age=7776000')

      res.writeHead(200, { 'Content-Type': 'image/png' })
      res.end(png)

      // Call Garbage Collector to avoid memory issues
      global.gc()
    })
  })
}

// Generate tile base on config
const generateTile = function (req, res, next, config) {
  // Check XYZ parameters
  if (isNaN(req.params.x) || isNaN(req.params.y) || isNaN(req.params.z)) {
    return res.status(422).send('Bad format: XYZ')
  }

  // Create Mapnik object
  const map = new mapnik.Map(256, 256)

  // Read map config
  map.fromString(config, (readError) => {
    if (readError) return next(readError)

    // Convert XYZ to BoundingBox and set the Map extent
    map.zoomToBox(mercator.bbox(req.params.x, req.params.y, req.params.z, false, '900913'))

    generateImage(map, res, next)
  })
}

// Ceres imagery tiles
app.get('/imagery/:uuid/:z/:x/:y.png', (req, res, next) => {
  // Check UUID parameter
  if (!uuidPattern.test(req.params.uuid)) {
    return res.status(422).send('Bad format: UUID')
  }

  download(req.params.uuid)
    .then((path) => {
      generateTile(req, res, next, imagery({ path }))
    })
    .catch(next)
})

// GSSURGO (Soil) tiles
app.get('/soil/:z/:x/:y.png', (req, res, next) => {
  generateTile(req, res, next, gssurgo)
})

// Ceres imagery untiled image
app.get('/imagery/:uuid.png', (req, res, next) => {
  // Get size from query params
  const width = req.query.width || 1024
  const height = req.query.height || 1024

  // Create Mapnik object
  const map = new mapnik.Map(width, height)

  download(req.params.uuid)
    .then((path) => {
      map.fromString(imagery({ path }), (readError) => {
        if (readError) return next(readError)

        // Zoom to image extent
        map.zoomAll()

        generateImage(map, res, next)
      })
    })
    .catch(next)
})

// Server status check
app.get('/status', (req, res) => {
  res.status(200).send(process.env.npm_package_version)
})

// Start Server
app.listen(process.env.PORT, process.env.HOST)
console.info(`Running on http://${process.env.HOST}:${process.env.PORT}`)
