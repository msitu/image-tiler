import express from 'express';

import { createMap, vectorResponse, respond } from '../middlewares/mapnik';
import { validateTile, validateSize, validateField } from '../middlewares/validators';
import { treeLayer } from '../middlewares/tree';

const router = express.Router();

router
  .get('/:field/:z/:x/:y.mvt',
    validateTile,
    validateSize,
    validateField,
    createMap,
    treeLayer,
    vectorResponse,
    respond
  );

export default router;
