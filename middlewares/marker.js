import mapnik from 'mapnik'
import fs from 'fs'

// Load fonts (This layer has labels)
mapnik.register_default_fonts()

// Read stylesheet file
const style = fs.readFileSync('styles/marker.xml', 'utf8')

// Load Mapnik datasource
mapnik.registerDatasource(`${mapnik.settings.paths.input_plugins}/postgis.input`)

const buildQuery = (flight) => {
  return `(
    SELECT dwf.id AS id,
      ptf.feature AS geom,
      dwf.marker_category AS category,
      dwf.marker_type AS type,
      ROW_NUMBER() OVER () AS number
    FROM published_imagery_drawingfeature dwf
    JOIN published_imagery_pointfeature ptf
      ON ptf.drawingfeature_ptr_id = dwf.id
    WHERE dwf.flight_id = '${flight}'
      AND dwf.type = 'Point'
    ORDER BY dwf.date_created
  ) AS markers`
}

const buildDataSource = (flight) => {
  return new mapnik.Datasource({
    type: 'postgis',
    host: process.env.CORE_DB_HOST,
    port: process.env.CORE_DB_PORT,
    user: process.env.CORE_DB_USER,
    password: process.env.CORE_DB_PASS,
    dbname: process.env.CORE_DB_NAME,
    table: buildQuery(flight),
    extent_from_subquery: true,
    geometry_field: 'geom',
    srid: 4326,
    max_size: 10,
    connect_timeout: 30
  })
}

export const markerLayer = (req, res, next) => {
  const { flight } = req.params
  const { map } = res.locals

  map.fromStringSync(style)
  const layer = new mapnik.Layer('markers')

  layer.datasource = buildDataSource(flight)
  layer.styles = ['marker-icon', 'marker-label']

  map.add_layer(layer)

  next()
}
