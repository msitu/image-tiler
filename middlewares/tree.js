import mapnik from 'mapnik';

// Load Mapnik datasource
mapnik.registerDatasource(`${mapnik.settings.paths.input_plugins}/postgis.input`);

const buildQuery = (field) => {
  return `(
    SELECT
      s.id::text spot_id,
      t.id::text tree_id,
      df.id::text AS field_id,
      s.geometry AS geom,
      t.plant_date,
      v.id::text varietal_id,
      v.name varietal
    FROM spots s
    LEFT JOIN spot_trees st ON st.spot_id = s.id
    LEFT JOIN trees t ON t.id = st.tree_id
    LEFT JOIN customers_cropvarietal v ON v.id = t.varietal_id
    JOIN published_imagery_displayfield df ON df.source_field_id = s.field_id
    WHERE df.id = '${field}'
  ) AS trees`;
};

const buildDataSource = (field) => {
  return new mapnik.Datasource({
    type: 'postgis',
    host: process.env.CORE_DB_HOST,
    port: process.env.CORE_DB_PORT,
    user: process.env.CORE_DB_USER,
    password: process.env.CORE_DB_PASS,
    dbname: process.env.CORE_DB_NAME,
    table: buildQuery(field),
    extent_from_subquery: true,
    geometry_field: 'geom',
    srid: 4326,
    max_size: 10,
    connect_timeout: 30
  });
};

export const treeLayer = (req, res, next) => {
  const { field } = req.params;
  const { map } = res.locals;

  const layer = new mapnik.Layer('trees');

  layer.datasource = buildDataSource(field);

  map.add_layer(layer);

  next();
};
