import express from 'express'
import mapnik from 'mapnik'

import { createMap, vectorResponse, respond } from '../middlewares/map'
import { validateTile, validateUUID } from '../middlewares/validators'
import { fieldLayer } from '../middlewares/field'

const router = express.Router()

router
  .get('/:uuid/:z/:x/:y.mvt',
    validateTile,
    validateUUID,
    createMap,
    fieldLayer,
    vectorResponse,
    respond
  )

export default router
