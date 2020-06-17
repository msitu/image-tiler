import validator from 'validator';

// Validate tile parameters
export const validateTile = (req, res, next) => {
  if (validator.isInt(req.params.x) &&
    validator.isInt(req.params.y) &&
    validator.isInt(req.params.z)) {
    req.params.x = parseInt(req.params.x);
    req.params.y = parseInt(req.params.y);
    req.params.z = parseInt(req.params.z);

    return next();
  }

  return res.status(422).send(`Bad format: XYZ = ${req.params.x}, ${req.params.y}, ${req.params.z}`);
};

// Validate Imagery imagery parameter
export const validateImagery = (req, res, next) => {
  if (validator.isUUID(req.params.imagery)) {
    return next();
  }

  return res.status(422).send(`Bad format: Imagery imagery = ${req.params.imagery}`);
};

// Validate Flight imagery parameter
export const validateFlight = (req, res, next) => {
  if (validator.isUUID(req.params.flight)) {
    return next();
  }

  return res.status(422).send(`Bad format: Flight imagery = ${req.params.flight}`);
};

// Validate Field parameter
export const validateField = (req, res, next) => {
  if (validator.isUUID(req.params.field)) {
    return next();
  }

  return res.status(422).send(`Bad format: Field ID = ${req.params.field}`);
};

// Validate Farm parameter
export const validateFarm = (req, res, next) => {
  if (validator.isUUID(req.params.farm)) {
    return next();
  }

  return res.status(422).send(`Bad format: Farm ID = ${req.params.farm}`);
};

// Validate Custom Layer parameter
export const validateCustom = (req, res, next) => {
  if (validator.isUUID(req.params.custom)) {
    return next();
  }

  return res.status(422).send(`Bad format: Custom Layer ID = ${req.params.custom}`);
};

// Validate Size and Ratio query
export const validateSize = (req, res, next) => {
  if (!req.query.size || validator.isInt(req.query.size)) {
    req.query.size = parseInt(req.query.size || 256);
  } else {
    return res.status(422).send(`Bad format: Size = ${req.query.size}`);
  }

  if (!req.query.ratio || validator.isFloat(req.query.ratio)) {
    req.query.ratio = parseFloat(req.query.ratio || 1);
    return next();
  }

  return res.status(422).send(`Bad format: Ratio = ${req.query.ratio}`);
};

// Validate Buffer query
export const validateBuffer = (req, res, next) => {
  if (!req.query.buffer || validator.isFloat(req.query.buffer, { min: 0, max: 1 })) {
    req.query.buffer = parseFloat(req.query.buffer || 0.25);
    return next();
  }

  return res.status(422).send(`Bad format: Buffer = ${req.query.buffer}`);
};
