import mapnik from 'mapnik';

// Load Mapnik datasource
mapnik.registerDatasource(`${mapnik.settings.paths.input_plugins}/shape.input`);

// Add custom layer to map
export const customLayer = (req, res, next) => {
  const { map, path, filename } = res.locals;

  // Create layer based on Shapefile
  const layer = new mapnik.Layer('custom');
  layer.datasource = new mapnik.Datasource({
    type: 'shape',
    file: `${path}/${filename}`
  });

  map.add_layer(layer);

  next();
};
