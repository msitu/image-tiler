import express from 'express'

import { zoomBox, autocropImage, downloadTiff } from '../middlewares/tools'
import { createMap, rasterResponse, respond } from '../middlewares/map'
import { validateTile, validateUUID, validateSize } from '../middlewares/validators'
import { imageryLayer } from '../middlewares/imagery'

const router = express.Router()

router
  .get('/:uuid/:z/:x/:y.png',
    validateTile,
    validateUUID,
    downloadTiff,
    createMap,
    imageryLayer,
    zoomBox,
    rasterResponse,
    respond
  )
  .get('/:uuid.png',
    validateUUID,
    validateSize,
    downloadTiff,
    createMap,
    imageryLayer,
    rasterResponse,
    autocropImage,
    respond
  )

export default router
