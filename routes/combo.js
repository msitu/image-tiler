import express from 'express'

import { zoomBox, downloadTiff } from '../middlewares/tools'
import { createMap, rasterResponse, respond } from '../middlewares/map'
import { validateTile, validateImagery, validateSize, validateBuffer } from '../middlewares/validators'
import { satelliteLayer } from '../middlewares/satellite'
import { imageryLayer } from '../middlewares/imagery'

const router = express.Router()

router
  .get('/:imagery/:z/:x/:y.png',
    validateTile,
    validateImagery,
    downloadTiff,
    createMap,
    imageryLayer,
    satelliteLayer,
    zoomBox,
    rasterResponse,
    respond
  )
  .get('/:imagery.png',
    validateImagery,
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
