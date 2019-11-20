import express from 'express'
import mapnik from 'mapnik'
import fs from 'fs'
import json2xml from 'json2xml'

import { zoomBox, downloadTiff } from '../lib/tools'
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

const createMap = (req, res, next) => {
  let { size = 256, buffer = 0.25 } = req.query

  const map = new mapnik.Map(size, size, '+init=epsg:3857')
  map.fromStringSync(imageryStyle)
  map.fromStringSync(satelliteStyle)

  map.bufferSize = size * buffer

  // Create imagery layer
  const imageryLayer = new mapnik.Layer('imagery')
  imageryLayer.datasource = new mapnik.Datasource({
    type: 'gdal',
    file: res.locals.path
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
    createMap,
    zoomBox,
    generateImage,
    respond
  )
  .get('/:uuid.png',
    validateUUID,
    validateSize,
    validateBuffer,
    downloadTiff,
    createMap,
    generateImage,
    respond
  )

export default router
