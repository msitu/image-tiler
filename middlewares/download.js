import fs from 'fs';
import http from 'http';

import unzipper from 'unzipper';
// import Redis from 'ioredis';
// import Redlock from 'redlock';

import { flush } from './cache';

// const redis = new Redis({ host: process.env.REDIS_HOST });
// const redlock = new Redlock([redis], {
//   retryCount: -1
// });

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

    // Get the lock to avoid multiple downloads for the same file
    const lock = await redlock.lock(filename, 10000);

    // If something fails, remove temporal file, unlock the queue and respond with error
    const fail = () => {
      fs.unlinkSync(tmpPath);
      lock.unlock().catch(next);
      res.status(404).send('Error downloading source data file, please check params');
    };

    // Before calling download recursively, we have to unlock the queue
    // If the unlock fails is because the lock was lost so we can ignore the error
    const retry = () => {
      lock.unlock().catch((e) => {});
      download();
    };

    // This is about milliseconds and it does not happen often
    // but sometimes the file gets downloaded just after the function gets the lock
    if (fs.existsSync(path)) {
      return retry();
    }

    // Download error handler
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

    // Create the file in the local cache, remove the temp file
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

    // Get the stream and pipe to file
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
