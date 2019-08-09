const fs = require('fs')
const http = require('http')

// Download GeoTiff from S3 to the local cache
module.exports = (uuid) => {
  const path = `${process.env.CACHE_PATH}/${uuid}.tiff`
  const tmpPath = `${path}.tmp`

  return new Promise((resolve, reject) => {
    const download = () => {
      if (fs.existsSync(path)) {
        // If file already exists, return
        resolve(path)
      } else if (fs.existsSync(tmpPath)) {
        // If file is being downloaded, wait for it
        setTimeout(download, 50)
      } else {
        // Else, download file
        fs.closeSync(fs.openSync(tmpPath, 'w'))

        const file = fs.createWriteStream(tmpPath)
          .on('error', download)
          .on('finish', () => {
            fs.rename(tmpPath, path, download)
          })

        http.get(`http://s3-us-west-2.amazonaws.com/ceres-geotiff-data/${uuid}.tif`, (response) => {
          response.pipe(file)
        }).on('error', download)
      }
    }

    download()
  })
}
