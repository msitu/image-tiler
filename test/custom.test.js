import app from '../server';
import supertest from 'supertest';
import fs from 'fs';

jest.setTimeout(60000);

const request = supertest(app);
const fixture = fs.readFileSync;
const base = 'custom';
const custom = '0e220754-e251-41c2-ab8b-0f05962ab7e9';

describe('custom routes', () => {
  test('should return a vector tile', async done => {
    const res = await request.get(`/${base}/${custom}/14/2680/6344.mvt`).responseType('arraybuffer');

    expect(res.body.equals(fixture('test/fixtures/custom-vector-tile.mvt'))).toBeTruthy();

    done();
  });

  afterAll(app.close);
});
