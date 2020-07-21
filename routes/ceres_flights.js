import express from 'express';

import { zoomBox, autocropImage, setDefaultSize, respond } from '../middlewares/tools';
import { createMap, rasterResponse, setExtent } from '../middlewares/mapnik';
import { validateTile, validateImagery, validateSize, validateBucket } from '../middlewares/validators';
import { imageryLayer16Bit, setCenter } from '../middlewares/imagery-16-bit';
import { downloadTiff } from '../middlewares/download';

const router = express.Router();

const setLocalPath = (req, res, next) => {
  // TODO: add validators for path to ensure they're of the right form
  // and/or that they exist
  res.locals.path = `${process.env.ROOTPATH}/${req.params[0]}.tif`
  next()
}

// The tif file path needs to point to an S3-like path.
router
  .get('/tiles/:z/:x/:y/*.tif',
    validateSize,
    setLocalPath,
    createMap,
    imageryLayer16Bit,
    zoomBox,
    rasterResponse,
    respond
  )
  .get('/png/*.tif',
    setDefaultSize(1024),
    validateSize,
    setLocalPath,
    createMap,
    imageryLayer16Bit,
    setExtent,
    rasterResponse,
    autocropImage,
    respond
  )
  .get('/center/*.tif',
    validateSize,
    setLocalPath,
    createMap,
    imageryLayer16Bit,
    setCenter,
    respond
  );

export default router;
