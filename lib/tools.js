import mapnik from 'mapnik'
import SphericalMercator from '@mapbox/sphericalmercator'

const mercator = new SphericalMercator()

const uuidPattern = /^[0-9A-F]{8}-[0-9A-F]{4}-[0-9A-F]{4}-[0-9A-F]{4}-[0-9A-F]{12}$/i

// Generate PNG and respond the request with it
export const generateImage = (map, res, next) => {
  // Create image object from map config
  const image = new mapnik.Image(map.width, map.height)

  // Render and return PNG
  map.render(image, (renderError, tile) => {
    if (renderError) return next(renderError)

    tile.encode('png', (encodeError, png) => {
      if (encodeError) return next(encodeError)

      // Set cache age to 90 days
      res.set('Cache-Control', 'max-age=7776000')

      res.writeHead(200, { 'Content-Type': 'image/png' })
      res.end(png)

      // Call Garbage Collector to avoid memory issues
      global.gc()
    })
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
