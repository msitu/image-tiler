import fs from 'fs'

import request from './base'

const base = 'imagery'
const uuid = '7326e81d-40b0-4053-8f33-bd22f9a53df9'

test('should return a raster tile', async done => {
  const res = await request.get(`/${base}/${uuid}/17/21455/50471.png`)

  const fixture = fs.readFileSync('test/fixtures/imagery-raster-tile.png')
  expect(fixture.equals(res.body)).toBeTruthy()

  done()
})

test('should return a single image', async done => {
  const res = await request.get(`/${base}/${uuid}.png`)

  const fixture = fs.readFileSync('test/fixtures/imagery-image.png')
  expect(fixture.equals(res.body)).toBeTruthy()

  done()
})

test('should return a single image with specific size', async done => {
  const res = await request.get(`/${base}/${uuid}.png?size=512`)

  const fixture = fs.readFileSync('test/fixtures/imagery-image-size.png')
  expect(fixture.equals(res.body)).toBeTruthy()

  done()
})

test('should return an error if size format is wrong', async done => {
  let res = await request.get(`/${base}/${uuid}.png?size=AAA`)
  expect(res.status).toBe(422)

  res = await request.get(`/${base}/${uuid}.png?size=1.5`)
  expect(res.status).toBe(422)

  done()
})

test('should return an error if XYZ format is wrong', async done => {
  let res = await request.get(`/${base}/${uuid}/AA/21455/50471.png`)
  expect(res.status).toBe(422)

  res = await request.get(`/${base}/${uuid}/17/AA/50471.png`)
  expect(res.status).toBe(422)

  res = await request.get(`/${base}/${uuid}/17/21455/AA.png`)
  expect(res.status).toBe(422)

  done()
})

test('should return an error if UUID format is wrong', async done => {
  const res = await request.get(`/${base}/AA-7326e81d-40b0-4053-8f33-bd22f9a53df9/17/21455/50471.png`)
  expect(res.status).toBe(422)

  done()
})
