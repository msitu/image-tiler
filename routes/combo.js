import express from 'express'

import { zoomBox, downloadTiff } from '../middlewares/tools'
import { createMap, rasterResponse, respond } from '../middlewares/map'
import { validateTile, validateUUID, validateSize, validateBuffer } from '../middlewares/validators'
import { satelliteLayer } from '../middlewares/satellite'
import { imageryLayer } from '../middlewares/imagery'

const router = express.Router()

router
  .get('/:uuid/:z/:x/:y.png',
    validateTile,
    validateUUID,
    downloadTiff,
    createMap,
    imageryLayer,
    satelliteLayer,
    zoomBox,
    rasterResponse,
    respond
  )
  .get('/:uuid.png',
    validateUUID,
    validateSize,
    validateBuffer,
    downloadTiff,
    createMap,
    imageryLayer,
    satelliteLayer,
    rasterResponse,
    respond
  )

export default router
