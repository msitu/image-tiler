import express from 'express'
import mapnik from 'mapnik'
import fs from 'fs'

import { zoomBox, autocropImage, downloadTiff } from '../middlewares/tools'
import { rasterLayer, respond } from '../middlewares/layers'
import { validateTile, validateUUID, validateSize } from '../middlewares/validators'

const router = express.Router()

// Load Mapnik datasource
mapnik.registerDatasource(`${mapnik.settings.paths.input_plugins}/gdal.input`)

// Read stylesheet file
const style = fs.readFileSync('styles/imagery.xml', 'utf8')

// Create Mapnik map
const createMap = (req, res, next) => {
  const { size = 256 } = req.query

  const map = new mapnik.Map(size, size, '+init=epsg:3857')
  map.fromStringSync(style)

  // Create layer based on imagery Geotiff file
  const layer = new mapnik.Layer('imagery')
  layer.datasource = new mapnik.Datasource({
    type: 'gdal',
    file: res.locals.path
  })
  layer.styles = ['imagery']

  map.add_layer(layer)

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
    createMap,
    zoomBox,
    rasterLayer,
    respond
  )
  .get('/:uuid.png',
    validateUUID,
    validateSize,
    downloadTiff,
    createMap,
    rasterLayer,
    autocropImage,
    respond
  )

export default router
