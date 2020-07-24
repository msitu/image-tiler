// import { app, request, fixture, downloadImagery } from './helpers';

// const base = 'imagery';
// const imagery = '7326e81d-40b0-4053-8f33-bd22f9a53df9';

// describe('imagery routes', () => {
//   beforeAll(() => {
//     return downloadImagery(imagery);
//   });

//   test('should return a raster tile', async done => {
//     const res = await request.get(`/${base}/${imagery}/17/21455/50471.png`);

//     expect(res.body).toEqual(fixture('imagery-raster-tile.png'));

//     done();
//   });

//   test('should return a single image', async done => {
//     const res = await request.get(`/${base}/${imagery}.png`);

//     expect(res.body).toEqual(fixture('imagery-image.png'));

//     done();
//   });

//   test('should return a single image with specific size', async done => {
//     const res = await request.get(`/${base}/${imagery}.png?size=512`);

//     expect(res.body).toEqual(fixture('imagery-image-size.png'));

//     done();
//   });

//   afterAll(app.close);
// });
