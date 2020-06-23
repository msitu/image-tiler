import express from 'express';

import { zoomBox, autocropImage, downloadTiff, setDefaultSize } from '../middlewares/tools';
import { createMap, rasterResponse, respond, setExtent } from '../middlewares/mapnik';
import { validateTile, validateImagery, validateSize } from '../middlewares/validators';
import { imageryLayer } from '../middlewares/imagery';

const router = express.Router();

router
  .get('/:imagery/:z/:x/:y.png',
    validateTile,
    validateImagery,
    validateSize,
    downloadTiff,
    createMap,
    imageryLayer,
    zoomBox,
    rasterResponse,
    respond
  )
  .get('/:imagery.png',
    setDefaultSize(1024),
    validateImagery,
    validateSize,
    downloadTiff,
    createMap,
    imageryLayer,
    setExtent,
    rasterResponse,
    autocropImage,
    respond
  );

export default router;
