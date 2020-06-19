import validator from 'validator';

class ValidationError extends Error {
  constructor (message, type) {
    super(`Bad param format: ${message}. ${type} expected.`);

    this.name = 'ValidationError';
    this.code = 400;
  }
}

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

  throw new ValidationError(`ZXY = ${req.params.z}/${req.params.x}/${req.params.y}`, 'Int/Int/Int');
};

// Validate Imagery imagery parameter
export const validateImagery = (req, res, next) => {
  if (validator.isUUID(req.params.imagery)) {
    return next();
  }

  throw new ValidationError(`Imagery ID: ${req.params.imagery}`, 'UUID');
};

// Validate Flight imagery parameter
export const validateFlight = (req, res, next) => {
  if (validator.isUUID(req.params.flight)) {
    return next();
  }

  throw new ValidationError(`Flight ID: ${req.params.flight}`, 'UUID');
};

// Validate Field parameter
export const validateField = (req, res, next) => {
  if (validator.isUUID(req.params.field)) {
    return next();
  }

  throw new ValidationError(`Field ID: ${req.params.field}`, 'UUID');
};

// Validate Farm parameter
export const validateFarm = (req, res, next) => {
  if (validator.isUUID(req.params.farm)) {
    return next();
  }

  throw new ValidationError(`Farm ID: ${req.params.farm}`, 'UUID');
};

// Validate Custom Layer parameter
export const validateCustom = (req, res, next) => {
  if (validator.isUUID(req.params.custom)) {
    return next();
  }

  throw new ValidationError(`Custom Layer ID: ${req.params.custom}`, 'UUID');
};

// Validate Size query
export const validateSize = (req, res, next) => {
  if (!req.query.size || validator.isInt(req.query.size)) {
    req.query.size = parseInt(req.query.size || 256);
    return next();
  }

  throw new ValidationError(`Size: ${req.query.size}`, 'Int');
};

// Validate Buffer query
export const validateBuffer = (req, res, next) => {
  if (!req.query.buffer || validator.isFloat(req.query.buffer, { min: 0, max: 1 })) {
    req.query.buffer = parseFloat(req.query.buffer || 0.25);
    return next();
  }

  throw new ValidationError(`Buffer: ${req.query.buffer}`, 'Float (0-1)');
};
