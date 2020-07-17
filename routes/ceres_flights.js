import express from 'express';

import { zoomBox, autocropImage, setDefaultSize, respond } from '../middlewares/tools';
import { createMap, rasterResponse, setExtent } from '../middlewares/mapnik';
import { validateTile, validateImagery, validateSize, validateBucket } from '../middlewares/validators';
import { imageryLayer16Bit } from '../middlewares/imagery-16-bit';
import { downloadTiff } from '../middlewares/download';

const router = express.Router();

const setLocalPath = (req, res, next) => {
  res.locals.path = `imagery/${req.params.imagery}.tif`
  next()
}

const setS3Path = (req, res, next) => {
  // res.locals.path = `imagery/${req.params.imagery}.tif`
  next()
}

router
  .get('/tiles/:imagery/:z/:x/:y',
    validateSize,
    setLocalPath,
    createMap,
    imageryLayer16Bit,
    zoomBox,
    rasterResponse,
    respond
  )
  .get('/png/:imagery',
    setDefaultSize(1024),
    validateSize,
    setLocalPath,
    createMap,
    imageryLayer16Bit,
    setExtent,
    rasterResponse,
    autocropImage,
    respond
  );

export default router;
