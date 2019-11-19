import express from 'express'
import mapnik from 'mapnik'

import { generateVector, respond } from '../lib/handlers'
import { validateTile, validateUUID } from '../lib/validators'

const router = express.Router()

// Load Mapnik datasource
mapnik.registerDatasource(`${mapnik.settings.paths.input_plugins}/postgis.input`)

const buildQuery = (uuid) => {
  return `(
    SELECT piu.id AS id,
      SUM(auto_acres) AS acres,
      ST_Collect(geometry) AS geom
    FROM customers_geo cg
    JOIN published_imagery_userfield piu
      ON piu.source_field_id = cg.farm_id
    WHERE piu.id = '${uuid}'
    GROUP BY piu.id
  ) AS fields`
}

const buildDataSource = (uuid) => {
  return new mapnik.Datasource({
    type: 'postgis',
    host: process.env.CORE_DB_HOST,
    port: process.env.CORE_DB_PORT,
    user: process.env.CORE_DB_USER,
    password: process.env.CORE_DB_PASS,
    dbname: process.env.CORE_DB_NAME,
    table: buildQuery(uuid),
    extent_from_subquery: true,
    geometry_field: 'geom',
    srid: 4326,
    max_size: 10,
    connect_timeout: 30
  })
}

// VectorTile request handler
const vectorLayer = (req, res, next) => {
  const { uuid } = req.params

  const map = new mapnik.Map(256, 256, '+init=epsg:3857')
  const layer = new mapnik.Layer('fields')

  layer.datasource = buildDataSource(uuid)

  map.add_layer(layer)

  res.locals.map = map

  next()
}

router
  .get('/:uuid/:z/:x/:y.mvt',
    validateTile,
    validateUUID,
    vectorLayer,
    generateVector,
    respond
  )

export default router
