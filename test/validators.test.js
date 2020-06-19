import app from '../server';
import supertest from 'supertest';

const request = supertest(app);
const base = 'combo';
const imagery = '7326e81d-40b0-4053-8f33-bd22f9a53df9';

describe('validators', () => {
  test('should return an error if buffer format is wrong', async done => {
    let res = await request.get(`/${base}/${imagery}.png?buffer=AAA`);

    expect(res.status).toBe(400);

    res = await request.get(`/${base}/${imagery}.png?buffer=1.5`);

    expect(res.status).toBe(400);

    done();
  });

  test('should return an error if size format is wrong', async done => {
    let res = await request.get(`/${base}/${imagery}.png?size=AAA`);

    expect(res.status).toBe(400);

    res = await request.get(`/${base}/${imagery}.png?size=1.5`);

    expect(res.status).toBe(400);

    done();
  });

  test('should return an error if XYZ format is wrong', async done => {
    let res = await request.get(`/${base}/${imagery}/AA/21455/50471.png`);

    expect(res.status).toBe(400);

    res = await request.get(`/${base}/${imagery}/17/AA/50471.png`);

    expect(res.status).toBe(400);

    res = await request.get(`/${base}/${imagery}/17/21455/AA.png`);

    expect(res.status).toBe(400);

    done();
  });

  test('should return an error if imagery UUID format is wrong', async done => {
    const res = await request.get(`/${base}/AA-7326e81d-40b0-4053-8f33-bd22f9a53df9/17/21455/50471.png`);

    expect(res.status).toBe(400);

    done();
  });

  test('should return an error if flight UUID format is wrong', async done => {
    const res = await request.get(`/${base}/${imagery}/AA-7326e81d-40b0-4053-8f33-bd22f9a53df9.png`);

    expect(res.status).toBe(400);

    done();
  });

  afterAll(app.close);
});
