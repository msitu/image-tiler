import express from 'express';

import { createMap, vectorResponse, rasterResponse } from '../middlewares/mapnik';
import { validateTile, validateSize, validateImagery, validateFlight } from '../middlewares/validators';
import { zoomBox, respond } from '../middlewares/tools';
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
