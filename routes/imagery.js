import express from 'express';

import { zoomBox, autocropImage, downloadTiff } from '../middlewares/tools';
import { createMap, rasterResponse, respond } from '../middlewares/map';
import { validateTile, validateImagery, validateSize } from '../middlewares/validators';
import { imageryLayer } from '../middlewares/imagery';

const router = express.Router();

router
  .get('/:imagery/:z/:x/:y.png',
    validateTile,
    validateImagery,
    downloadTiff,
    createMap,
    imageryLayer,
    zoomBox,
    rasterResponse,
    respond
  )
  .get('/:imagery.png',
    validateImagery,
    validateSize,
    downloadTiff,
    createMap,
    imageryLayer,
    rasterResponse,
    autocropImage,
    respond
  );

export default router;
