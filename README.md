# Ceres Imaging Tile Server

[![CircleCI](https://circleci.com/gh/ceresimaging/image-tiler.svg?style=svg)](https://circleci.com/gh/ceresimaging/image-tiler)

## How to make it work locally

1. Configure variables: `cp .env.example .env`

2. Run Osiris (Tiler uses its DB)

3. Setup and run container: `docker-compose up`

4. Use it!

### Testing

`doco run --rm tiler npm run test`
