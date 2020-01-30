import express from 'express';

import { zoomBox, downloadTiff } from '../middlewares/tools';
import { createMap, rasterResponse, respond } from '../middlewares/map';
import { validateTile, validateImagery, validateSize, validateBuffer, validateFlight } from '../middlewares/validators';
import { satelliteLayer } from '../middlewares/satellite';
import { imageryLayer } from '../middlewares/imagery';
import { markerLayer } from '../middlewares/marker';

const router = express.Router();

router
  .get('/:imagery/:z/:x/:y.png',
    validateTile,
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
