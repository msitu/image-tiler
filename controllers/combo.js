import express from 'express'
import mapnik from 'mapnik'
import fs from 'fs'

import { bbox, generateImage, checkTileParams, checkImageryParams } from '../lib/tools'
import download from '../lib/download'

const router = express.Router()

// Load Mapnik datasource
mapnik.registerDatasource(`${mapnik.settings.paths.input_plugins}/gdal.input`)

// Read stylesheet files
const imageryStyle = fs.readFileSync('styles/imagery.xml', 'utf8')
const satelliteStyle = fs.readFileSync('styles/satellite.xml', 'utf8')

const createMap = (path, width = 256, height = 256) => {
  const map = new mapnik.Map(width, height)
  map.fromStringSync(imageryStyle)
  map.fromStringSync(satelliteStyle)

  // Define a buffer of 25%
  map.bufferSize = width * 0.25

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

  // Zoom to imagery bounds + buffer, to add some satellite context
  map.zoomToBox(map.bufferedExtent)

  // Create satellite layer
  const satelliteLayer = new mapnik.Layer('satellite', '+init=epsg:3857')
  satelliteLayer.datasource = new mapnik.Datasource({
    type: 'gdal',
    file: 'config/satellite.xml'
  })
  satelliteLayer.styles = ['satellite']

  map.add_layer(satelliteLayer)

  return map
}

// Tile request handler
router.get('/:uuid/:z/:x/:y.png', (req, res, next) => {
  checkTileParams(req, res)
  checkImageryParams(req, res)

  const { x, y, z, uuid } = req.params

  download(uuid)
    .then((path) => {
      const map = createMap(path)
      // Zoom to tile bounds
      map.zoomToBox(bbox(x, y, z))
      generateImage(map, res, next)
    })
    .catch(next)
})

// Single PNG handler
router.get('/:uuid.png', (req, res, next) => {
  checkImageryParams(req, res)

  const width = req.query.width || 1024
  const height = req.query.height || 1024
  const uuid = req.params.uuid

  download(uuid)
    .then((path) => {
      const map = createMap(path, width, height)
      generateImage(map, res, next)
    })
    .catch(next)
})

export default router
