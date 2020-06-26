import fs from 'fs';
import http from 'http';

import SphericalMercator from '@mapbox/sphericalmercator';
import unzipper from 'unzipper';
import Redis from 'ioredis';
import Redlock from 'redlock';
import sharp from 'sharp';

import { flush } from './cache';

const mercator = new SphericalMercator();

const redis = new Redis({ host: process.env.REDIS_HOST });
const redlock = new Redlock([redis], {
  retryCount: -1
});

// Autocrop image
export const autocropImage = (req, res, next) => {
  sharp(res.locals.data)
    .trim()
    .toBuffer()
    .then((data) => {
      res.locals.data = data;
      next();
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

// Download file from S3 to the local cache
const downloadFile = (req, res, next) => {
  const { dir, filename, zipped = false } = res.locals;
  const { bucket, region } = req.query;

  const dirPath = `${process.env.CACHE_PATH}/${dir}/${region}/${bucket}`;
  const path = `${dirPath}/${filename}`;
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

      // If cache dir is full, remove files older than 10 days and retry
      if (error.code === 'ENOSPC') {
        req.query.age = 10;
        return flush(req, res, () => {
          fs.unlinkSync(tmpPath);
          retry();
        });
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
  fs.mkdirSync(dirPath, { recursive: true });
  download();
};

// Download GeoTiff
export const downloadTiff = (req, res, next) => {
  res.locals.filename = `${req.params.imagery}.tif`;
  res.locals.dir = 'imagery';
  downloadFile(req, res, next);
};

// Download Shapefile
export const downloadShape = (req, res, next) => {
  res.locals.filename = `${req.params.custom}`;
  res.locals.zipped = true;
  res.locals.dir = 'custom';
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

// Set S3 region and bucket
export const setDefaultBucket = (region, bucket) => {
  return (req, res, next) => {
    req.query.region = req.query.region || `${region}`;
    req.query.bucket = req.query.bucket || `${bucket}`;
    next();
  };
};

// Set age limit in days
export const setDefaultAge = (age) => {
  return (req, res, next) => {
    req.query.age = req.query.age || `${age}`;
    next();
  };
};
