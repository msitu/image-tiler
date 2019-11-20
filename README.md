# Ceres Imaging Tile Server

## How to make it work locally

1. Configure variables: `cp .env.example .env`

2. Run Osiris (Tiler uses its DB)

3. Setup and run container: `docker-compose up`

4. Use it!

### Testing

`doco run --rm tiler npm run test`
