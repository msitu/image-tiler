import app from '../server';
import supertest from 'supertest';
import fs from 'fs';

jest.setTimeout(60000);

const request = supertest(app);
const fixture = fs.readFileSync;
const base = 'marker';
const imagery = 'c1923c08-5c61-420e-b569-5e00baf0c114';
const flight = 'ebe0d55b-e957-44ab-8240-7202150a3789';

describe('marker routes', () => {
  test('should return a raster tile', async done => {
    const res = await request.get(`/${base}/${imagery}/${flight}/18/42782/101024.png`);

    expect(res.body.equals(fixture('test/fixtures/marker-raster-tile.png'))).toBeTruthy();

    done();
  });

  test('should return a vector tile', async done => {
    const res = await request.get(`/${base}/${imagery}/${flight}/18/42782/101024.mvt`).responseType('arraybuffer');

    expect(res.body.equals(fixture('test/fixtures/marker-vector-tile.mvt'))).toBeTruthy();

    done();
  });

  afterAll(app.close);
});
