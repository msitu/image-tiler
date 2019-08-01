const fs = require('fs');
const http = require('http');

// Download GeoTiff from S3 to the local cache
module.exports = function(uuid) {
  const path = `${process.env.CACHE_PATH}/${uuid}.tiff`;
  const tmpPath = `${path}.tmp`;

  return new Promise((resolve, reject) => {
    const id = Date.now();

    if (fs.existsSync(path)) {
      // If file already exists, return
      console.log(id, 'Exists!');
      resolve(path);
    } else if (fs.existsSync(tmpPath) &&
      (Date.now() - fs.statSync(tmpPath).birthtimeMs) < 30000) {
        // If file is being downloaded, wait for it
      console.log(id, 'Wait!');
      const interval = setInterval(function () {
        if (fs.existsSync(path)) {
          console.log(id, 'Found!');
          clearInterval(interval);
          resolve(path);
        }
      }, 10);
    } else {
      // Else, download file
      console.log(id, 'Download!');
      const file = fs.createWriteStream(`${path}.tmp`)
        .on('error', reject)
        .on('finish', function() {
          file.close(function() {
            console.log(id, 'Finish!');
            fs.renameSync(tmpPath, path);
            resolve(path);
          });
        });

      http.get(`http://s3-us-west-2.amazonaws.com/ceres-geotiff-data/${uuid}.tif`, function(response) {
        response.pipe(file);
      }).on('error', (error) => {
        fs.unlinkSync(tmpPath);
        reject(error);
      });
    }
  })
}