import app from '../server';
import supertest from 'supertest';
import fs from 'fs';

jest.setTimeout(60000);

const request = supertest(app);
const fixture = fs.readFileSync;
const base = 'soil';

describe('soil routes', () => {
  test('should return a raster tile', async done => {
    const res = await request.get(`/${base}/17/22151/51660.png`);

    expect(res.body.equals(fixture('test/fixtures/soil-raster-tile.png'))).toBeTruthy();

    done();
  });

  test('should return a vector tile', async done => {
    const res = await request.get(`/${base}/14/3364/6683.mvt`).responseType('arraybuffer');

    expect(res.body.equals(fixture('test/fixtures/soil-vector-tile.mvt'))).toBeTruthy();

    done();
  });

  afterAll(app.close);
});
