import fs from 'fs';

// Respond request
export const respond = (req, res, next) => {
  const { files = [] } = res.locals;

  res.status(200).send(`${files.length} files removed from cache.`);
};

// Flush the whole cache limit by file age
// Age is about the last time the file was accessed (not when it was created)
export const flush = (req, res, next) => {
  const { age } = req.query;
  const now = Date.now();
  const files = [];

  // Calculate limit age in milliseconds
  const limit = age * 86400000;

  const flushDir = (dir) => {
    fs.readdirSync(dir).forEach((file) => {
      const path = `${dir}/${file}`;
      const stats = fs.statSync(path);

      if (stats.isDirectory()) {
        flushDir(path);
      } else {
        if (limit < (now - stats.atimeMs)) {
          fs.unlinkSync(path);
          files.push(path);
        }
      }
    });
  };

  flushDir(`${process.env.CACHE_PATH}/imagery`);
  flushDir(`${process.env.CACHE_PATH}/custom`);

  res.locals.files = files;

  next();
};

// Remove single file from the cache
const removeFile = (req, res, next) => {
  const { bucket, region } = req.query;
  const { dir, filename } = res.locals;

  const path = `${process.env.CACHE_PATH}/${dir}/${region}/${bucket}/${filename}`;

  if (fs.existsSync(path)) {
    fs.unlinkSync(path);
    res.locals.files = [path];
  }

  next();
};

// Remove GeoTiff
export const removeTiff = (req, res, next) => {
  res.locals.filename = `${req.params.imagery}.tif`;
  res.locals.dir = 'imagery';
  removeFile(req, res, next);
};

// Remove Shapefile
export const removeShape = (req, res, next) => {
  res.locals.filename = `${req.params.custom}`;
  res.locals.dir = 'custom';
  removeFile(req, res, next);
};
