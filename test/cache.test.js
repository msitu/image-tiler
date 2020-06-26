import app from '../server';
import supertest from 'supertest';
import { createImagery, createCustom, createFiles, wipeCache } from './helpers';

jest.setTimeout(60000);

const request = supertest(app);
const base = 'cache';
const imagery = '7326e81d-40b0-4053-8f33-cd22f9a53df9';
const custom = '0e220754-e251-41c2-ab8b-1f05962ab7e9';

describe('cache', () => {
  beforeEach(() => {
    wipeCache();
  });

  test('should remove an imagery cached file', async done => {
    createImagery(imagery);

    const res = await request.get(`/${base}/imagery/${imagery}`);

    expect(res.text.startsWith('1')).toBeTruthy();

    done();
  });

  test('should remove a custom layer cached file', async done => {
    createCustom(custom);

    const res = await request.get(`/${base}/custom/${custom}`);

    expect(res.text.startsWith('1')).toBeTruthy();

    done();
  });

  test('should remove all files older than age', async done => {
    createFiles(2);
    createFiles(2, 3);
    createFiles(2, 5);

    const res = await request.get(`/${base}?age=3`);

    expect(res.text.startsWith('4')).toBeTruthy();

    done();
  });

  test('should flush all cache', async done => {
    createFiles(10);

    const res = await request.get(`/${base}?age=0`);

    expect(res.text.startsWith('10')).toBeTruthy();

    done();
  });

  afterAll(app.close);
});
