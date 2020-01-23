import app from '../server'
import supertest from 'supertest'
import fs from 'fs'

jest.setTimeout(60000)

const request = supertest(app)
const fixture = fs.readFileSync
const base = 'combo'
const imagery = '7326e81d-40b0-4053-8f33-bd22f9a53df9'

describe('combo routes', () => {

  test('should return a raster tile', async done => {
    const res = await request.get(`/${base}/${imagery}/17/21455/50471.png`)

    expect(res.body.equals(fixture('test/fixtures/combo-raster-tile.png'))).toBeTruthy()

    done()
  })

  test('should return a single image', async done => {
    const res = await request.get(`/${base}/${imagery}.png`)

    expect(res.body.equals(fixture('test/fixtures/combo-image.png'))).toBeTruthy()

    done()
  })

  test('should return a single image with specific size', async done => {
    const res = await request.get(`/${base}/${imagery}.png?size=512`)

    expect(res.body.equals(fixture('test/fixtures/combo-image-size.png'))).toBeTruthy()

    done()
  })

  test('should return a single image with specific buffer', async done => {
    const res = await request.get(`/${base}/${imagery}.png?buffer=0.1`)

    expect(res.body.equals(fixture('test/fixtures/combo-image-buffer.png'))).toBeTruthy()

    done()
  })

  test('should return a single image with markers', async done => {
    const imagery = 'c1923c08-5c61-420e-b569-5e00baf0c114'
    const flight = 'ebe0d55b-e957-44ab-8240-7202150a3789'

    const res = await request.get(`/${base}/${imagery}/${flight}.png`)

    expect(res.body.equals(fixture('test/fixtures/combo-marker.png'))).toBeTruthy()

    done()
  })

  afterAll(app.close)

})
