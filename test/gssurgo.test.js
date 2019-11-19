import { request, fixture } from './base'

const base = 'soil'

test('should return a raster tile', async done => {
  const res = await request.get(`/${base}/14/3364/6683.png`)

  expect(res.body).toEqual(fixture('test/fixtures/soil-raster-tile.png'))

  done()
})

test('should return a vector tile', async done => {
  const res = await request.get(`/${base}/14/3364/6683.mvt`).responseType('arraybuffer')

  expect(res.body).toEqual(fixture('test/fixtures/soil-vector-tile.mvt'))

  done()
})
