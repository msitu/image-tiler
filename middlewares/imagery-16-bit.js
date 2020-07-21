import mapnik from 'mapnik';
import fs from 'fs';

// Load Mapnik datasource
mapnik.registerDatasource(`${mapnik.settings.paths.input_plugins}/gdal.input`);
// Read stylesheet file
const style = fs.readFileSync('styles/imagery-16-bit.xml', 'utf8');

// Add imagery raster layer to map
export const imageryLayer16Bit = (req, res, next) => {
  const { map, path } = res.locals;

  map.fromStringSync(style);

  // TODO: investigate what valid values for `band` are
  // Create layer based on imagery Geotiff file
  const layer = new mapnik.Layer('imagery');
  const datasource = new mapnik.Datasource({
    type: 'gdal',
    band: 3,
    file: path
  });
  layer.datasource = datasource
  layer.styles = ['imagery'];

  map.add_layer(layer);

  res.locals.center = calculateCenter(datasource)

  next();
};

// Calculate the center point from a GeoTiff Mapnik datasource
const calculateCenter = (datasource) => {
  const [minx, miny, maxx, maxy]  = datasource.extent()
  const lat = (miny + maxy)/2
  const lon = (minx + maxx)/2
  return [lat, lon]
}

export const setCenter = (req, res, next) => {
  const {center} = res.locals
  res.locals.data = center
  next()
}