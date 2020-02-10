import express from 'express';

import { createMap, vectorResponse, rasterResponse, respond } from '../middlewares/map';
import { validateTile, validateSize, validateImagery, validateFlight } from '../middlewares/validators';
import { zoomBox } from '../middlewares/tools';
import { markerLayer } from '../middlewares/marker';

const router = express.Router();

router
  .get('/:imagery/:flight/:z/:x/:y.mvt',
    validateTile,
    validateSize,
    validateImagery,
    validateFlight,
    createMap,
    markerLayer,
    vectorResponse,
    respond
  )
  .get('/:imagery/:flight/:z/:x/:y.png',
    validateTile,
    validateSize,
    validateImagery,
    validateFlight,
    createMap,
    markerLayer,
    zoomBox,
    rasterResponse,
    respond
  );

export default router;
