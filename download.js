const fs = require('fs')
const http = require('http')

// Download GeoTiff from S3 to the local cache
module.exports = function (uuid) {
  const path = `${process.env.CACHE_PATH}/${uuid}.tiff`
  const tmpPath = `${path}.tmp`

  return new Promise((resolve, reject) => {
    if (fs.existsSync(path)) {
      // If file already exists, return
      resolve(path)
    } else if (fs.existsSync(tmpPath) &&
      (Date.now() - fs.statSync(tmpPath).birthtimeMs) < 30000) {
      // If file is being downloaded, wait for it
      const interval = setInterval(() => {
        if (fs.existsSync(path)) {
          clearInterval(interval)
          resolve(path)
        }
      }, 10)
    } else {
      // Else, download file
      const file = fs.createWriteStream(`${path}.tmp`)
        .on('error', reject)
        .on('finish', () => {
          file.close(() => {
            fs.renameSync(tmpPath, path)
            resolve(path)
          })
        })

      http.get(`http://s3-us-west-2.amazonaws.com/ceres-geotiff-data/${uuid}.tif`, (response) => {
        response.pipe(file)
      }).on('error', (error) => {
        fs.unlinkSync(tmpPath)
        reject(error)
      })
    }
  })
}
