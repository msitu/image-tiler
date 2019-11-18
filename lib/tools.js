import mapnik from 'mapnik'
import SphericalMercator from '@mapbox/sphericalmercator'
import Jimp from 'jimp'

const mercator = new SphericalMercator()

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

// Respond request
export const respond = (data, contentType, res) => {
  // Set cache age to 90 days
  res.set('Cache-Control', 'max-age=7776000')
  res.writeHead(200, { 'Content-Type': contentType })
  res.end(data)

  // Call Garbage Collector to avoid memory issues
  global.gc()
}

export const respondImage = (data, res) => {
  respond(data, 'image/png', res)
}

export const respondVector = (data, res) => {
  respond(data, 'application/x-protobuf', res)
}

// Generate PNG
export const generateImage = (map) => {
  return new Promise((resolve, reject) => {
    map.render(
      new mapnik.Image(map.width, map.height),
      (renderError, tile) => {
        if (renderError) return reject(renderError)

        resolve(tile.encodeSync('png'))
      }
    )
  })
}

// Generate Vector Tile
export const generateVector = (map, x, y, z) => {
  return new Promise((resolve, reject) => {
    map.render(
      new mapnik.VectorTile(parseInt(z), parseInt(x), parseInt(y)),
      (renderError, tile) => {
        if (renderError) return reject(renderError)

        resolve(tile.getDataSync())
      }
    )
  })
}

// Convert tile XYZ to BBOX
export const bbox = (x, y, z) => {
  return mercator.bbox(x, y, z, false, '900913')
}
