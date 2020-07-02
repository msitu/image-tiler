import express from 'express';

import { createMap, vectorResponse } from '../middlewares/mapnik';
import { validateTile, validateFarm, validateField, validateSize } from '../middlewares/validators';
import { fieldLayer } from '../middlewares/fieldgeo';
import { respond } from '../middlewares/tools';

const router = express.Router();

router
  .get('/:farm/:z/:x/:y.mvt',
    validateTile,
    validateSize,
    validateFarm,
    createMap,
    fieldLayer,
    vectorResponse,
    respond
  )
  .get('/:farm/:field/:z/:x/:y.mvt',
    validateTile,
    validateSize,
    validateFarm,
    validateField,
    createMap,
    fieldLayer,
    vectorResponse,
    respond
  );

export default router;
