import app from '../server'
import supertest from 'supertest'
import fs from 'fs'

jest.setTimeout(60000)

const request = supertest(app)
const fixture = fs.readFileSync
const base = 'imagery'
const uuid = '7326e81d-40b0-4053-8f33-bd22f9a53df9'

describe('imagery routes', () => {

  test('should return a raster tile', async done => {
    const res = await request.get(`/${base}/${uuid}/17/21455/50471.png`)

    expect(res.body.equals(fixture('test/fixtures/imagery-raster-tile.png'))).toBeTruthy()

    done()
  })

  test('should return a single image', async done => {
    const res = await request.get(`/${base}/${uuid}.png`)

    expect(res.body.equals(fixture('test/fixtures/imagery-image.png'))).toBeTruthy()

    done()
  })

  test('should return a single image with specific size', async done => {
    const res = await request.get(`/${base}/${uuid}.png?size=512`)

    expect(res.body.equals(fixture('test/fixtures/imagery-image-size.png'))).toBeTruthy()

    done()
  })

})
