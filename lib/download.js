import fs from 'fs'
import http from 'http'
import dotenv from 'dotenv'

dotenv.config()

// Delete files with access time older than 1 hour
const clearCache = (tmpPath) => {
  return new Promise((resolve, reject) => {
    const now = Date.now()

    fs.readdir(process.env.CACHE_PATH, (error, files) => {
      if (error) return reject(error)

      files.forEach((file) => {
        const path = `${process.env.CACHE_PATH}/${file}`
        const age = now - fs.statSync(path).atimeMs
        if (age > 3600000) {
          fs.unlinkSync(path)
        }
      })

      fs.unlink(tmpPath, resolve)
    })
  })
}

// Download GeoTiff from S3 to the local cache
export default (uuid) => {
  const path = `${process.env.CACHE_PATH}/${uuid}.tiff`
  const tmpPath = `${path}.tmp`

  return new Promise((resolve) => {
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
          .on('error', (error) => {
            if (error.code === 'ENOSPC') {
              // If cache dir is full, clear it!
              clearCache(tmpPath).then(download).catch(download)
            } else {
              download()
            }
          })
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
