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

  // Create layer based on imagery Geotiff file
  const layer = new mapnik.Layer('imagery');
  layer.datasource = new mapnik.Datasource({
    type: 'gdal',
    band: 3,
    file: path
  });
  
  const [minx, miny, maxx, maxy]  = layer.datasource.extent()
  const lat = (miny + maxy)/2
  const lon = (minx + maxx)/2
  res.locals.center = [lat, lon]

  layer.styles = ['imagery'];

  map.add_layer(layer);

  next();
};
