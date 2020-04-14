import app from '../server';
import supertest from 'supertest';
import fs from 'fs';

jest.setTimeout(60000);

const request = supertest(app);
const fixture = fs.readFileSync;
const base = 'fieldgeo';
const farm = '7355293c-e23d-4aab-8ff0-e2f8f1b83f4e';
const field = 'e6437d6f-4637-4133-bb17-9da0eff0b963';

describe('fieldgeo routes', () => {
  test('should return a vector tile filter by farm', async done => {
    const res = await request.get(`/${base}/${farm}/14/3534/6442.mvt`).responseType('arraybuffer');

    expect(res.body.equals(fixture('test/fixtures/fieldgeo-farm-vector-tile.mvt'))).toBeTruthy();

    done();
  });

  test('should return a vector tile filter by field', async done => {
    const res = await request.get(`/${base}/${farm}/${field}/15/7068/12884.mvt`).responseType('arraybuffer');

    expect(res.body.equals(fixture('test/fixtures/fieldgeo-field-vector-tile.mvt'))).toBeTruthy();

    done();
  });

  afterAll(app.close);
});
