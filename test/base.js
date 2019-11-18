import app from '../server'
import supertest from 'supertest'

jest.setTimeout(60000)

export default supertest(app)