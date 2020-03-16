import express from 'express';

import { downloadShape } from '../middlewares/tools';
import { createMap, vectorResponse, respond } from '../middlewares/map';
import { validateTile, validateSize, validateCustom } from '../middlewares/validators';
import { customLayer } from '../middlewares/custom';

const router = express.Router();

router
  .get('/:custom/:z/:x/:y.mvt',
    validateTile,
    validateSize,
    validateCustom,
    downloadShape,
    createMap,
    customLayer,
    vectorResponse,
    respond
  );

export default router;
