import express from 'express'
import mapnik from 'mapnik'
import fs from 'fs'
import dotenv from 'dotenv'

import { bbox, generateImage, checkTileParams } from '../lib/tools'

dotenv.config()

const router = express.Router()

mapnik.registerDatasource(`${mapnik.settings.paths.input_plugins}/postgis.input`)
mapnik.register_default_fonts()

const style = fs.readFileSync('styles/gssurgo.xml', 'utf8')

const layer = new mapnik.Layer('gssurgo')
layer.datasource = new mapnik.Datasource({
  type: 'postgis',
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  dbname: process.env.DB_NAME,
  table: process.env.DB_TABLE,
  extent: '-192.39,17.47,-58.53,72.12',
  geometry_field: 'geom',
  key_field: 'id',
  srid: 4326,
  max_size: 10,
  connect_timeout: 30
})
layer.styles = ['gssurgo-line', 'gssurgo-label']

router.get('/:z/:x/:y.png', (req, res, next) => {
  checkTileParams(req, res)

  const { x, y, z } = req.params

  const map = new mapnik.Map(256, 256)

  map.fromStringSync(style)
  map.add_layer(layer)
  map.zoomToBox(bbox(x, y, z))

  generateImage(map, res, next)
})

export default router
