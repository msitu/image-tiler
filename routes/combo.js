import express from 'express'
import mapnik from 'mapnik'
import fs from 'fs'
import json2xml from 'json2xml'

import { bbox, downloadTiff } from '../lib/tools'
import { generateImage, respond } from '../lib/handlers'
import { validateTile, validateUUID, validateSize, validateBuffer } from '../lib/validators'

const router = express.Router()

// Load Mapnik datasource
mapnik.registerDatasource(`${mapnik.settings.paths.input_plugins}/gdal.input`)

// Read stylesheet files
const imageryStyle = fs.readFileSync('styles/imagery.xml', 'utf8')
const satelliteStyle = fs.readFileSync('styles/satellite.xml', 'utf8')

const baseConfig = {
  GDAL_WMS: {
    attr: { name: 'WMS' },
    Service: {
      ServerUrl: `${process.env.PROXY_BASE_URL}/wms`,
      Layers: 'satellite',
      CRS: 'EPSG:3857',
      Version: '1.3.0',
      ImageFormat: 'image/png'
    },
    DataWindow: {
      UpperLeftX: null,
      UpperLeftY: null,
      LowerRightX: null,
      LowerRightY: null,
      TileLevel: 20,
      TileCountX: 1,
      TileCountY: 1
    },
    BandsCount: 3,
    Cache: {
      Path: process.env.CACHE_PATH
    }
  }
}

const createMap = (path, width = 256, height = 256, buffer = 0.25) => {
  const map = new mapnik.Map(width, height, '+init=epsg:3857')
  map.fromStringSync(imageryStyle)
  map.fromStringSync(satelliteStyle)

  // Define a buffer (Default: 25%)
  map.bufferSize = width * buffer

  // Create imagery layer
  const imageryLayer = new mapnik.Layer('imagery')
  imageryLayer.datasource = new mapnik.Datasource({
    type: 'gdal',
    file: path
  })
  imageryLayer.styles = ['imagery']

  map.add_layer(imageryLayer)

  // Zoom to imagery bounds
  map.zoomAll()

  // Write config file
  const filePath = `${process.env.CACHE_PATH}/${map.bufferedExtent.join('_')}.xml`

  if (!fs.existsSync(filePath)) {
    // Define specific satellite extent using imagery bounds + buffer
    // This adds some area context to the image
    const config = { ...baseConfig }
    config.GDAL_WMS.DataWindow.UpperLeftX = map.bufferedExtent[0]
    config.GDAL_WMS.DataWindow.UpperLeftY = map.bufferedExtent[1]
    config.GDAL_WMS.DataWindow.LowerRightX = map.bufferedExtent[2]
    config.GDAL_WMS.DataWindow.LowerRightY = map.bufferedExtent[3]

    fs.writeFileSync(filePath, json2xml(config, { attributes_key: 'attr' }))
  }

  // Create satellite layer
  const satelliteLayer = new mapnik.Layer('satellite', '+init=epsg:3857')
  satelliteLayer.datasource = new mapnik.Datasource({
    type: 'gdal',
    file: filePath
  })
  satelliteLayer.styles = ['satellite']

  map.add_layer(satelliteLayer)

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
  let buffer = parseFloat(req.query.buffer)

  if (isNaN(buffer)) {
    buffer = 0.25
  }

  const map = createMap(res.locals.path, size, size, buffer)

  // Zoom to GeoTiff + Buffer
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
    validateBuffer,
    downloadTiff,
    imageLayer,
    generateImage,
    respond
  )

export default router
