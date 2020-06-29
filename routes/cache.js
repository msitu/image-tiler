import express from 'express';
import { validateAge, validateImagery, validateCustom, validateBucket } from '../middlewares/validators';
import { flush, respond, removeTiff, removeShape } from '../middlewares/cache';
import { setDefaultBucket } from '../middlewares/tools';

const router = express.Router();

router
  .get('/',
    validateAge,
    flush,
    respond
  )
  .get('/imagery/:imagery',
    validateBucket,
    validateImagery,
    removeTiff,
    respond
  )
  .get('/custom/:custom',
    setDefaultBucket(process.env.CUSTOM_LAYERS_REGION, process.env.CUSTOM_LAYERS_BUCKET),
    validateBucket,
    validateCustom,
    removeShape,
    respond
  );

export default router;
