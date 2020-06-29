import express from 'express';
import { validateAge, validateImagery, validateCustom, validateBucket } from '../middlewares/validators';
import { flush, removeTiff, removeShape, cacheResponse } from '../middlewares/cache';
import { setDefaultBucket, respond, noCache } from '../middlewares/tools';

const router = express.Router();

router
  .get('/',
    validateAge,
    flush,
    noCache,
    cacheResponse,
    respond
  )
  .get('/imagery/:imagery',
    validateBucket,
    validateImagery,
    removeTiff,
    cacheResponse,
    noCache,
    respond
  )
  .get('/custom/:custom',
    setDefaultBucket(process.env.CUSTOM_LAYERS_REGION, process.env.CUSTOM_LAYERS_BUCKET),
    validateBucket,
    validateCustom,
    removeShape,
    cacheResponse,
    respond
  );

export default router;
