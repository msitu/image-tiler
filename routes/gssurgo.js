import express from 'express'
import mapnik from 'mapnik'
import fs from 'fs'

import {
  bbox,
  checkTileParams,
  generateImage,
  generateVector,
  respondImage,
  respondVector
} from '../lib/tools'

const router = express.Router()

// Load Mapnik datasource
mapnik.registerDatasource(`${mapnik.settings.paths.input_plugins}/postgis.input`)

// Load fonts (This layer has labels)
mapnik.register_default_fonts()

// Read stylesheet file
const style = fs.readFileSync('styles/gssurgo.xml', 'utf8')

// Create layer (We use the same object for every request)
const layer = new mapnik.Layer('gssurgo')
layer.datasource = new mapnik.Datasource({
  type: 'postgis',
  host: process.env.EXTRA_DB_HOST,
  port: process.env.EXTRA_DB_PORT,
  user: process.env.EXTRA_DB_USER,
  password: process.env.EXTRA_DB_PASS,
  dbname: process.env.EXTRA_DB_NAME,
  table: process.env.EXTRA_DB_TABLE,
  extent: '-192.39,17.47,-58.53,72.12',
  geometry_field: 'geom',
  key_field: 'id',
  srid: 4326,
  max_size: 10,
  connect_timeout: 30
})
layer.styles = ['gssurgo-line', 'gssurgo-label']

// Tile request handler
router.get('/:z/:x/:y.png', (req, res, next) => {
  const { x, y, z } = checkTileParams(req, res)

  const map = new mapnik.Map(256, 256, '+init=epsg:3857')
  map.fromStringSync(style)
  map.add_layer(layer)

  // Zoom to tile bounds
  map.zoomToBox(bbox(x, y, z))

  generateImage(map)
    .then(image => respondImage(image, res))
    .catch(next)
})

// VectorTile request handler
router.get('/:z/:x/:y.mvt', (req, res, next) => {
  const { x, y, z } = checkTileParams(req, res)

  const map = new mapnik.Map(256, 256, '+init=epsg:3857')
  map.add_layer(layer)

  generateVector(map, x, y, z)
    .then(vector => respondVector(vector, res))
    .catch(next)
})

export default router
