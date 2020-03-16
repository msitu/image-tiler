import app from '../server';
import supertest from 'supertest';
import fs from 'fs';

jest.setTimeout(60000);

const request = supertest(app);
const fixture = fs.readFileSync;
const base = 'custom';
const custom = '1451b496-f7be-4799-8c28-fcb0f8f39d5f';

describe('custom routes', () => {
  test('should return a vector tile', async done => {
    const res = await request.get(`/${base}/${custom}/14/2680/6344.mvt`).responseType('arraybuffer');

    expect(res.body.equals(fixture('test/fixtures/custom-vector-tile.mvt'))).toBeTruthy();

    done();
  });

  afterAll(app.close);
});
