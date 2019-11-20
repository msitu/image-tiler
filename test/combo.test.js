import app from '../server'
import supertest from 'supertest'
import fs from 'fs'

jest.setTimeout(60000)

const request = supertest(app)
const fixture = fs.readFileSync
const base = 'combo'
const uuid = '7326e81d-40b0-4053-8f33-bd22f9a53df9'

describe('combo routes', () => {

  test('should return a raster tile', async done => {
    const res = await request.get(`/${base}/${uuid}/17/21455/50471.png`)

    expect(res.body.equals(fixture('test/fixtures/combo-raster-tile.png'))).toBeTruthy()

    done()
  })

  test('should return a single image', async done => {
    const res = await request.get(`/${base}/${uuid}.png`)

    expect(res.body.equals(fixture('test/fixtures/combo-image.png'))).toBeTruthy()

    done()
  })

  test('should return a single image with specific size', async done => {
    const res = await request.get(`/${base}/${uuid}.png?size=512`)

    expect(res.body.equals(fixture('test/fixtures/combo-image-size.png'))).toBeTruthy()

    done()
  })

  test('should return a single image with specific buffer', async done => {
    const res = await request.get(`/${base}/${uuid}.png?buffer=0.1`)

    expect(res.body.equals(fixture('test/fixtures/combo-image-buffer.png'))).toBeTruthy()

    done()
  })

  afterAll(app.close)

})
