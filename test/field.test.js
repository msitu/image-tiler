import fs from 'fs'

import request from './base'

const base = 'field'
const uuid = '92b9b844-adf4-48a8-a750-9135d9a01c0b'

test('should return a vector tile', async done => {
  const res = await request.get(`/${base}/${uuid}/17/21458/50472.mvt`).responseType('arraybuffer')

  const fixture = fs.readFileSync('test/fixtures/field-vector-tile.mvt')
  expect(fixture.equals(res.body)).toBeTruthy()

  done()
})


test('should return an error if XYZ format is wrong', async done => {
  let res = await request.get(`/${base}/${uuid}/AA/21458/50472.mvt`)
  expect(res.status).toBe(422)

  res = await request.get(`/${base}/${uuid}/17/AA/50472.mvt`)
  expect(res.status).toBe(422)

  res = await request.get(`/${base}/${uuid}/17/21458/AA.mvt`)
  expect(res.status).toBe(422)

  done()
})


test('should return an error if UUID format is wrong', async done => {
  const res = await request.get(`/${base}/AA-7326e81d-40b0-4053-8f33-bd22f9a53df9/17/21455/50471.mvt`)
  expect(res.status).toBe(422)

  done()
})