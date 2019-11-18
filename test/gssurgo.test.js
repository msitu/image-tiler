import fs from 'fs'

import request from './base'

const base = 'soil'

test('should return a raster tile', async done => {
  const res = await request.get(`/${base}/14/3364/6683.png`)

  const fixture = fs.readFileSync('test/fixtures/soil-raster-tile.png')
  expect(fixture.equals(res.body)).toBeTruthy()

  done()
})

test('should return a vector tile', async done => {
  const res = await request.get(`/${base}/14/3364/6683.mvt`).responseType('arraybuffer')

  const fixture = fs.readFileSync('test/fixtures/soil-vector-tile.mvt')
  expect(fixture.equals(res.body)).toBeTruthy()

  done()
})


test('should return an error if XYZ format is wrong', async done => {
  let res = await request.get(`/${base}/AA/3364/6683.png`)
  expect(res.status).toBe(422)

  res = await request.get(`/${base}/14/AA/6683.png`)
  expect(res.status).toBe(422)

  res = await request.get(`/${base}/14/3364/AA.png`)
  expect(res.status).toBe(422)

  done()
})
