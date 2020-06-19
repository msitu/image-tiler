import express from 'express';

import { zoomBox, downloadTiff, setDefaultSize, setDefaultRatio, setDefaultBuffer, setDefaultUser } from '../middlewares/tools';
import { createMap, rasterResponse, respond, setExtent } from '../middlewares/mapnik';
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
    setDefaultBuffer(0.1, 100),
    validateImagery,
    validateSize,
    validateBuffer,
    downloadTiff,
    createMap,
    imageryLayer,
    setExtent,
    satelliteLayer,
    rasterResponse,
    respond
  )
  .get('/:imagery/:flight.png',
    setDefaultSize(1024),
    setDefaultBuffer(0.1, 100),
    validateImagery,
    validateFlight,
    validateSize,
    validateBuffer,
    downloadTiff,
    createMap,
    imageryLayer,
    setExtent,
    satelliteLayer,
    markerLayer,
    rasterResponse,
    respond
  )
  .get('/issues/:imagery/:flight.png',
    setDefaultSize(256),
    setDefaultRatio(0.5),
    setDefaultBuffer(0, 50),
    setDefaultUser(process.env.SUPPORT_USER),
    validateImagery,
    validateFlight,
    validateSize,
    validateBuffer,
    downloadTiff,
    createMap,
    markerLayer,
    setExtent,
    imageryLayer,
    satelliteLayer,
    rasterResponse,
    respond
  );

export default router;
