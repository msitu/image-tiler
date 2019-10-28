import express from 'express'
import mapnik from 'mapnik'
import fs from 'fs'

import { bbox, generateImage, checkTileParams, checkImageryParams } from '../lib/tools'
import download from '../lib/download'

const router = express.Router()

// Load Mapnik datasource
mapnik.registerDatasource(`${mapnik.settings.paths.input_plugins}/gdal.input`)

// Read stylesheet file
const style = fs.readFileSync('styles/imagery.xml', 'utf8')

// Create Mapnik map
const createMap = (path, width = 256, height = 256) => {
  const map = new mapnik.Map(width, height)
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

  const width = parseInt(req.query.width) || 1024
  const height = parseInt(req.query.height) || 1024
  const uuid = req.params.uuid

  download(uuid)
    .then((path) => {
      const map = createMap(path, width, height)
      // Zoom to GeoTiff bounds
      map.zoomAll()
      generateImage(map, res, next)
    })
    .catch(next)
})

export default router
