import express from 'express';

import { zoomBox, downloadTiff, setDefaultSize } from '../middlewares/tools';
import { createMap, rasterResponse, respond } from '../middlewares/mapnik';
import { validateTile, validateImagery, validateSize, validateBuffer, validateFlight } from '../middlewares/validators';
import { satelliteLayer } from '../middlewares/satellite';
import { imageryLayer } from '../middlewares/imagery';
import { markerLayer } from '../middlewares/marker';

const router = express.Router();

router
  .get('/:imagery/:z/:x/:y.png',
    validateTile,
    validateSize,
    validateImagery,
    downloadTiff,
    createMap,
    imageryLayer,
    satelliteLayer,
    zoomBox,
    rasterResponse,
    respond
  )
  .get('/:imagery.png',
    setDefaultSize(1024),
    validateImagery,
    validateSize,
    validateBuffer,
    downloadTiff,
    createMap,
    imageryLayer,
    satelliteLayer,
    rasterResponse,
    respond
  )
  .get('/:imagery/:flight.png',
    setDefaultSize(1024),
    validateImagery,
    validateFlight,
    validateSize,
    validateBuffer,
    downloadTiff,
    createMap,
    imageryLayer,
    satelliteLayer,
    markerLayer,
    rasterResponse,
    respond
  );

export default router;
