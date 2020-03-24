import app from '../server';
import supertest from 'supertest';
import fs from 'fs';

jest.setTimeout(60000);

const request = supertest(app);
const fixture = fs.readFileSync;
const base = 'fieldgeo';
const farm = 'a91d395b-79ae-44f7-981e-0f8dea1f1074';
const field = 'fbd0968a-912b-47f0-924c-ef40ed350e72';

describe('fieldgeo routes', () => {
  test('should return a vector tile filter by farm', async done => {
    const res = await request.get(`/${base}/${farm}/13/1299/3139.mvt`).responseType('arraybuffer');

    expect(res.body.equals(fixture('test/fixtures/field-farm-vector-tile.mvt'))).toBeTruthy();

    done();
  });

  test('should return a vector tile filter by field', async done => {
    const res = await request.get(`/${base}/${farm}/${field}/17/20789/50226.mvt`).responseType('arraybuffer');

    expect(res.body.equals(fixture('test/fixtures/field-field-vector-tile.mvt'))).toBeTruthy();

    done();
  });

  afterAll(app.close);
});
