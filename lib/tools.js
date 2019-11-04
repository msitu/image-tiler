import mapnik from 'mapnik'
import SphericalMercator from '@mapbox/sphericalmercator'
import Jimp from 'jimp'

const mercator = new SphericalMercator()

const uuidPattern = /^[0-9A-F]{8}-[0-9A-F]{4}-[0-9A-F]{4}-[0-9A-F]{4}-[0-9A-F]{12}$/i

// Process image
export const processImage = (image) => {
  return new Promise((resolve, reject) => {
    Jimp.read(image)
      .then(jimpImage => {
        jimpImage
          .autocrop({
            cropOnlyFrames: false,
            cropSymmetric: false
          })
          .getBufferAsync(Jimp.MIME_PNG)
          .then(resolve)
      })
      .catch(reject)
  })
}

export const respondImage = (image, res) => {
  // Set cache age to 90 days
  res.set('Cache-Control', 'max-age=7776000')
  res.writeHead(200, { 'Content-Type': 'image/png' })
  res.end(image)

  // Call Garbage Collector to avoid memory issues
  global.gc()
}

// Generate PNG and respond the request with it
export const generateImage = (map) => {
  return new Promise((resolve, reject) => {
    // Generate PNG from map
    map.render(
      new mapnik.Image(map.width, map.height),
      (renderError, tile) => {
        if (renderError) return reject(renderError)

        tile.encode('png', (encodeError, image) => {
          if (encodeError) return reject(encodeError)

          resolve(image)
        })
      }
    )
  })
}

// Convert tile XYZ to BBOX
export const bbox = (x, y, z) => {
  return mercator.bbox(x, y, z, false, '900913')
}

// Validate tile parameters
export const checkTileParams = (req, res) => {
  if (isNaN(req.params.x) || isNaN(req.params.y) || isNaN(req.params.z)) {
    return res.status(422).send('Bad format: XYZ')
  }
}

// Validate imagery parameters
export const checkImageryParams = (req, res) => {
  if (!uuidPattern.test(req.params.uuid)) {
    return res.status(422).send('Bad format: UUID')
  }
}
