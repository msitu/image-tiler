import express from 'express';

import { zoomBox } from '../middlewares/tools';
import { createMap, rasterResponse, vectorResponse, respond } from '../middlewares/mapnik';
import { validateTile, validateSize } from '../middlewares/validators';
import { gssurgoLayer } from '../middlewares/gssurgo';

const router = express.Router();

router
  .get('/:z/:x/:y.png',
    validateTile,
    validateSize,
    createMap,
    gssurgoLayer,
    zoomBox,
    rasterResponse,
    respond
  )
  .get('/:z/:x/:y.mvt',
    validateTile,
    validateSize,
    createMap,
    gssurgoLayer,
    vectorResponse,
    respond
  );

export default router;
