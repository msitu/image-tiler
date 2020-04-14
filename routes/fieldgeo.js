import express from 'express';

import { createMap, vectorResponse, respond } from '../middlewares/mapnik';
import { validateTile, validateFarm, validateField, validateSize } from '../middlewares/validators';
import { fieldLayer } from '../middlewares/fieldgeo';

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
