import express from 'express';

import { createMap, vectorResponse } from '../middlewares/mapnik';
import { validateTile, validateSize, validateField } from '../middlewares/validators';
import { treeLayer } from '../middlewares/tree';
import { respond } from '../middlewares/tools';

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
