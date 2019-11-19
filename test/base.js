import app from '../server'
import supertest from 'supertest'
import fs from 'fs'

jest.setTimeout(60000)

export const request = supertest(app)
export const fixture = fs.readFileSync