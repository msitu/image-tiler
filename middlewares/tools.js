import SphericalMercator from '@mapbox/sphericalmercator';
import Jimp from 'jimp';
import fs from 'fs';
import http from 'http';

const mercator = new SphericalMercator();

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

// Download GeoTiff from S3 to the local cache
export const downloadTiff = (req, res, next) => {
  const { imagery } = req.params;
  const {
    bucket = 'ceres-geotiff-data',
    region = 'us-west-2'
  } = req.query;

  const dir = `${process.env.CACHE_PATH}/${region}/${bucket}`;
  const path = `${dir}/${imagery}.tiff`;
  const tmpPath = `${path}.tmp`;
  const url = `http://s3-${region}.amazonaws.com/${bucket}/${imagery}.tif`;

  const fail = () => {
    res.status(404).send('Error downloading imagery, please check params');
    fs.unlinkSync(tmpPath);
  };

  const download = () => {
    if (fs.existsSync(path)) {
      // If file already exists, return
      res.locals.path = path;
      next();
    } else if (fs.existsSync(tmpPath)) {
      // If file is being downloaded, wait for it
      setTimeout(download, 50);
    } else {
      // Else, download file
      fs.closeSync(fs.openSync(tmpPath, 'w'));

      const file = fs.createWriteStream(tmpPath)
        .on('error', (error) => {
          if (error.code === 'ENOSPC') {
            // If cache dir is full, clear it!
            clearCache(tmpPath).then(download).catch(download);
          } else {
            download();
          }
        })
        .on('finish', () => {
          fs.rename(tmpPath, path, download);
        });

      http.get(url, (response) => {
        if (response.statusCode !== 200) {
          fail();
        } else {
          response.pipe(file);
        }
      }).on('error', (error) => {
        if (error.code === 'ENOTFOUND') {
          fail();
        } else {
          download();
        }
      });
    }
  };

  // Create directory and trigger download
  fs.mkdirSync(dir, { recursive: true });
  download();
};

export const setDefaultSize = (size) => {
  return (req, res, next) => {
    req.query.size = req.query.size || `${size}`;
    next();
  };
};
