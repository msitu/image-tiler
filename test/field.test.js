import app from '../server'
import supertest from 'supertest'
import fs from 'fs'

jest.setTimeout(60000)

const request = supertest(app)
const fixture = fs.readFileSync
const base = 'field'
const imagery = '92b9b844-adf4-48a8-a750-9135d9a01c0b'

describe('field routes', () => {

  test('should return a vector tile', async done => {
    const res = await request.get(`/${base}/${imagery}/17/21458/50472.mvt`).responseType('arraybuffer')

    expect(res.body.equals(fixture('test/fixtures/field-vector-tile.mvt'))).toBeTruthy()

    done()
  })

  afterAll(app.close)

})
