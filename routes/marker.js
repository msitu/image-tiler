import express from 'express'

import { createMap, vectorResponse, rasterResponse, respond } from '../middlewares/map'
import { validateTile, validateFlight } from '../middlewares/validators'
import { zoomBox } from '../middlewares/tools'
import { markerLayer } from '../middlewares/marker'

const router = express.Router()

router
  .get('/:flight/:z/:x/:y.mvt',
    validateTile,
    validateFlight,
    createMap,
    markerLayer,
    vectorResponse,
    respond
  )
  .get('/:flight/:z/:x/:y.png',
    validateTile,
    validateFlight,
    createMap,
    markerLayer,
    zoomBox,
    rasterResponse,
    respond
  )

export default router
