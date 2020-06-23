import SphericalMercator from '@mapbox/sphericalmercator';
import Jimp from 'jimp';
import fs from 'fs';
import http from 'http';
import unzipper from 'unzipper';
import Redis from 'ioredis';
import Redlock from 'redlock';

const mercator = new SphericalMercator();
const redis = new Redis({ host: process.env.REDIS_HOST });
const redlock = new Redlock([redis], {
  retryCount: -1
});

// Autocrop image
export const autocropImage = (req, res, next) => {
  Jimp.read(res.locals.data)
    .then(jimpImage => {
      jimpImage
        .autocrop({
          cropOnlyFrames: false,
          cropSymmetric: false
        })
        .getBufferAsync(Jimp.MIME_PNG)
        .then(result => {
          res.locals.data = result;
          next();
        });
    })
    .catch(next);
};

// Convert tile XYZ to BBOX
export const zoomBox = (req, res, next) => {
  const { x, y, z } = req.params;

  res.locals.map.zoomToBox(
    mercator.bbox(x, y, z, false, '900913')
  );

  next();
};

// Delete files with access time older than 1 hour
const clearCache = (tmpPath) => {
  return new Promise((resolve, reject) => {
    const now = Date.now();

    fs.readdir(process.env.CACHE_PATH, (error, files) => {
      if (error) return reject(error);

      files.forEach((file) => {
        const path = `${process.env.CACHE_PATH}/${file}`;
        const age = now - fs.statSync(path).atimeMs;
        if (age > 3600000) {
          fs.unlinkSync(path);
        }
      });

      fs.unlink(tmpPath, resolve);
    });
  });
};

// Download file from S3 to the local cache
const downloadFile = (req, res, next) => {
  const { filename, bucket, region, zipped = false, style = false } = res.locals;

  const dir = `${process.env.CACHE_PATH}/${region}/${bucket}`;
  const path = `${dir}/${filename}`;
  const tmpPath = `${path}.tmp`;
  const url = `http://s3-${region}.amazonaws.com/${bucket}/${filename}`;

  const fail = () => {
    res.status(404).send('Error downloading source data file, please check params');
    fs.unlinkSync(tmpPath);
  };

  const download = () => {
    if (fs.existsSync(path)) {
      // If file already exists, call next middleware
      if (style) {
        res.locals.stylePath = path;
      } else {
        res.locals.path = path;
      }
      return next();
    }

    redlock.lock(filename, 1000000).then((lock) => {
      if (fs.existsSync(path)) {
        lock.unlock();
        return download();
      }

      const file = fs.createWriteStream(tmpPath)
        .on('error', (error) => {
          lock.unlock();
          if (error.code === 'ENOSPC') {
            // If cache dir is full, clear it!
            clearCache(tmpPath).then(download).catch(download);
          } else {
            download();
          }
        })
        .on('finish', () => {
          if (zipped) {
            fs.createReadStream(tmpPath)
              .pipe(unzipper.Extract({ path: `${tmpPath}.zip` }))
              .on('close', () => {
                fs.renameSync(`${tmpPath}.zip`, path);
                fs.unlinkSync(tmpPath);
                lock.unlock();
                download();
              });
          } else {
            fs.renameSync(tmpPath, path);
            lock.unlock();
            download();
          }
        });

      http.get(url, (response) => {
        if (response.statusCode !== 200) {
          lock.unlock();
          fail();
        } else {
          response.pipe(file);
        }
      }).on('error', (error) => {
        lock.unlock();
        if (error.code === 'ENOTFOUND') {
          fail();
        } else {
          download();
        }
      });
    });
  };

  // Create directory and trigger download
  fs.mkdirSync(dir, { recursive: true });
  download();
};

// Download GeoTiff
export const downloadTiff = (req, res, next) => {
  res.locals.filename = `${req.params.imagery}.tif`;
  res.locals.bucket = req.query.bucket || process.env.IMAGERY_BUCKET;
  res.locals.region = req.query.region || process.env.IMAGERY_REGION;

  downloadFile(req, res, next);
};

// Download Shapefile
export const downloadShape = (req, res, next) => {
  res.locals.filename = `${req.params.custom}`;
  res.locals.bucket = req.query.bucket || process.env.CUSTOM_LAYERS_BUCKET;
  res.locals.region = req.query.region || process.env.CUSTOM_LAYERS_REGION;
  res.locals.zipped = true;

  downloadFile(req, res, next);
};

// Set image size
export const setDefaultSize = (size) => {
  return (req, res, next) => {
    req.query.size = req.query.size || `${size}`;
    next();
  };
};

// Set image aspect ratio
export const setDefaultRatio = (ratio) => {
  return (req, res, next) => {
    req.query.ratio = req.query.ratio || `${ratio}`;
    next();
  };
};

// Set buffer
export const setDefaultBuffer = (buffer, minBuffer) => {
  return (req, res, next) => {
    req.query.buffer = req.query.buffer || `${buffer}`;
    req.query.minBuffer = req.query.minBuffer || `${minBuffer}`;
    next();
  };
};

// Set user
export const setDefaultUser = (user) => {
  return (req, res, next) => {
    req.query.user = req.query.user || `${user}`;
    next();
  };
};
