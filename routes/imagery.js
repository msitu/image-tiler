import express from 'express'
import mapnik from 'mapnik'
import fs from 'fs'

import { bbox, autocropImage, downloadTiff } from '../lib/tools'
import { generateImage, respond } from '../lib/handlers'
import { validateTile, validateUUID, validateSize } from '../lib/validators'

const router = express.Router()

// Load Mapnik datasource
mapnik.registerDatasource(`${mapnik.settings.paths.input_plugins}/gdal.input`)

// Read stylesheet file
const style = fs.readFileSync('styles/imagery.xml', 'utf8')

// Create Mapnik map
const createMap = (path, width = 256, height = 256) => {
  const map = new mapnik.Map(width, height, '+init=epsg:3857')
  map.fromStringSync(style)

  // Create layer based on imagery Geotiff file
  const layer = new mapnik.Layer('imagery')
  layer.datasource = new mapnik.Datasource({
    type: 'gdal',
    file: path
  })
  layer.styles = ['imagery']

  map.add_layer(layer)

  return map
}

// Tile request handler
const rasterLayer = (req, res, next) => {
  const { x, y, z } = req.params

  const map = createMap(res.locals.path)

  // Zoom to tile bounds
  map.zoomToBox(bbox(x, y, z))

  res.locals.map = map

  next()
}

// Single PNG handler
const imageLayer = (req, res, next) => {
  const size = parseInt(req.query.size) || 1024

  const map = createMap(res.locals.path, size, size)

  // Zoom to GeoTiff bounds
  map.zoomAll()

  res.locals.map = map

  next()
}

router
  .get('/:uuid/:z/:x/:y.png',
    validateTile,
    validateUUID,
    downloadTiff,
    rasterLayer,
    generateImage,
    respond
  )
  .get('/:uuid.png',
    validateUUID,
    validateSize,
    downloadTiff,
    imageLayer,
    generateImage,
    autocropImage,
    respond
  )

export default router
