import fs from 'fs';
import http from 'http';

import SphericalMercator from '@mapbox/sphericalmercator';
import Jimp from 'jimp';
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
  const now = Date.now();

  fs.readdirSync(process.env.CACHE_PATH).forEach((file) => {
    const path = `${process.env.CACHE_PATH}/${file}`;
    const age = now - fs.statSync(path).atimeMs;
    if (age > 3600000) {
      fs.unlinkSync(path);
    }
  });

  fs.unlinkSync(tmpPath);
};

// Download file from S3 to the local cache
const downloadFile = (req, res, next) => {
  const { filename, bucket, region, zipped = false } = res.locals;

  const dir = `${process.env.CACHE_PATH}/${region}/${bucket}`;
  const path = `${dir}/${filename}`;
  const tmpPath = `${path}.tmp`;
  const url = `http://s3-${region}.amazonaws.com/${bucket}/${filename}`;

  const download = async () => {
    // If file already exists, set path and call next middleware
    if (fs.existsSync(path)) {
      res.locals.path = path;
      return next();
    }

    const lock = await redlock.lock(filename, 10000);

    const fail = () => {
      fs.unlinkSync(tmpPath);
      lock.unlock().catch(next);
      res.status(404).send('Error downloading source data file, please check params');
    };

    const retry = () => {
      lock.unlock().catch((e) => {});
      download();
    };

    if (fs.existsSync(path)) {
      return retry();
    }

    const onError = (error) => {
      // If file not found, trigger error!
      if (error.code === 'ENOTFOUND') {
        return fail();
      }

      // If cache dir is full, clear it and retry
      if (error.code === 'ENOSPC') {
        clearCache(tmpPath);
      }

      retry();
    };

    const file = fs.createWriteStream(tmpPath)
      .on('error', onError)
      .on('finish', () => {
        if (zipped) {
          fs.createReadStream(tmpPath)
            .pipe(unzipper.Extract({ path: `${tmpPath}.zip` }))
            .on('close', () => {
              fs.rename(`${tmpPath}.zip`, path, retry);
              fs.unlinkSync(tmpPath);
            });
        } else {
          fs.rename(tmpPath, path, retry);
        }
      });

    http.get(url, (response) => {
      if (response.statusCode !== 200) {
        fail();
      } else {
        response.pipe(file);
      }
    }).on('error', onError);
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
