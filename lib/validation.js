import validator from 'validator'

// Validate tile parameters
export const validateTile = (req, res, next) => {
  if (validator.isInt(req.params.x) &&
    validator.isInt(req.params.y) &&
    validator.isInt(req.params.z)) {
    return next()
  }

  return res.status(422).send(`Bad format: XYZ = ${req.params.x}, ${req.params.y}, ${req.params.z}`)
}

// Validate UUID parameter
export const validateUUID = (req, res, next) => {
  if (validator.isUUID(req.params.uuid)) {
    return next()
  }

  return res.status(422).send(`Bad format: UUID = ${req.params.uuid}`)
}

// Validate Size query
export const validateSize = (req, res, next) => {
  if (!req.query.size || validator.isInt(req.query.size)) {
    return next()
  }

  return res.status(422).send(`Bad format: Size = ${req.query.size}`)
}

// Validate Buffer query
export const validateBuffer = (req, res, next) => {
  if (!req.query.buffer || validator.isFloat(req.query.buffer, { min: 0, max: 1 })) {
    return next()
  }

  return res.status(422).send(`Bad format: Buffer = ${req.query.buffer}`)
}
