import validator from 'validator'

// Validate tile parameters
export const validateTile = (req, res, next) => {
  if (validator.isInt(req.params.x) &&
    validator.isInt(req.params.y) &&
    validator.isInt(req.params.z)) {
    req.params.x = parseInt(req.params.x)
    req.params.y = parseInt(req.params.y)
    req.params.z = parseInt(req.params.z)

    return next()
  }

  return res.status(422).send(`Bad format: XYZ = ${req.params.x}, ${req.params.y}, ${req.params.z}`)
}

// Validate Imagery imagery parameter
export const validateImagery = (req, res, next) => {
  if (validator.isUUID(req.params.imagery)) {
    return next()
  }

  return res.status(422).send(`Bad format: Imagery imagery = ${req.params.imagery}`)
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
    req.query.size = parseInt(req.query.size || 1024)
    return next()
  }

  return res.status(422).send(`Bad format: Size = ${req.query.size}`)
}

// Validate Buffer query
export const validateBuffer = (req, res, next) => {
  if (!req.query.buffer || validator.isFloat(req.query.buffer, { min: 0, max: 1 })) {
    req.query.buffer = parseFloat(req.query.buffer || 0.25)
    return next()
  }

  return res.status(422).send(`Bad format: Buffer = ${req.query.buffer}`)
}
