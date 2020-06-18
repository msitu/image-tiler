import mapnik from 'mapnik';

// Respond request
export const respond = (req, res, next) => {
  // Set cache age to 90 days
  res.set('Cache-Control', 'max-age=7776000');
  res.end(res.locals.data);

  // Call Garbage Collector to avoid memory issues
  global.gc();
};

// Generate PNG
export const rasterResponse = (req, res, next) => {
  const { map } = res.locals;

  map.render(
    new mapnik.Image(map.width, map.height),
    (renderError, tile) => {
      if (renderError) return next(renderError);

      tile.encode('png', (dataError, data) => {
        if (dataError) return next(dataError);

        res.locals.data = data;

        res.set('Content-Type', 'image/png');

        next();
      });
    }
  );
};

// Generate Vector Tile
export const vectorResponse = (req, res, next) => {
  const { map } = res.locals;
  const { x, y, z } = req.params;

  map.render(
    new mapnik.VectorTile(z, x, y),
    (renderError, tile) => {
      if (renderError) return next(renderError);

      tile.getData((dataError, data) => {
        if (dataError) return next(dataError);

        res.locals.data = data;

        res.set('Content-Type', 'application/x-protobuf');

        next();
      });
    }
  );
};

// Create Mapnik Map
export const createMap = (req, res, next) => {
  const { size, ratio } = req.query;

  const map = new mapnik.Map(size, size * ratio, '+init=epsg:3857');

  res.locals.map = map;

  next();
};

// Define map extent based on current layers and buffer
export const setExtent = (req, res, next) => {
  const { buffer } = req.query;
  const { map } = res.locals;

  // Zoom to current layers
  map.zoomAll();

  if (buffer > 0) {
    map.extent = [
      map.extent[0] - buffer,
      map.extent[1] - buffer,
      map.extent[2] + buffer,
      map.extent[3] + buffer
    ];
  }

  next();
};
