import mapnik from 'mapnik'
import fs from 'fs'
import json2xml from 'json2xml'

// Load Mapnik datasource
mapnik.registerDatasource(`${mapnik.settings.paths.input_plugins}/gdal.input`)

// Read stylesheet files
const satelliteStyle = fs.readFileSync('styles/satellite.xml', 'utf8')

const baseConfig = {
  GDAL_WMS: {
    attr: { name: 'WMS' },
    Service: {
      ServerUrl: `${process.env.PROXY_BASE_URL}/wms`,
      Layers: 'satellite',
      CRS: 'EPSG:3857',
      Version: '1.3.0',
      ImageFormat: 'image/png'
    },
    DataWindow: {
      UpperLeftX: null,
      UpperLeftY: null,
      LowerRightX: null,
      LowerRightY: null,
      TileLevel: 20,
      TileCountX: 1,
      TileCountY: 1
    },
    BandsCount: 3,
    Cache: {
      Path: process.env.CACHE_PATH
    }
  }
}

export const satelliteLayer = (req, res, next) => {
  const { buffer = 0.25 } = req.query
  const { map } = res.locals

  map.fromStringSync(satelliteStyle)

  map.bufferSize = map.width * buffer

  // Write config file
  const filePath = `${process.env.CACHE_PATH}/${map.bufferedExtent.join('_')}.xml`

  if (!fs.existsSync(filePath)) {
    // Define specific satellite extent using imagery bounds + buffer
    // This adds some area context to the image
    const config = { ...baseConfig }
    config.GDAL_WMS.DataWindow.UpperLeftX = map.bufferedExtent[0]
    config.GDAL_WMS.DataWindow.UpperLeftY = map.bufferedExtent[1]
    config.GDAL_WMS.DataWindow.LowerRightX = map.bufferedExtent[2]
    config.GDAL_WMS.DataWindow.LowerRightY = map.bufferedExtent[3]

    fs.writeFileSync(filePath, json2xml(config, { attributes_key: 'attr' }))
  }

  // Create satellite layer
  const satelliteLayer = new mapnik.Layer('satellite', '+init=epsg:3857')
  satelliteLayer.datasource = new mapnik.Datasource({
    type: 'gdal',
    file: filePath
  })
  satelliteLayer.styles = ['satellite']

  map.add_layer(satelliteLayer)

  // Zoom to GeoTiff + Buffer
  map.zoomAll()

  next()
}