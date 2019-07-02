# Ceres Imaging Tile Server

## How to make it work locally

1. Generate your config file: `cp server/.env.example server/.env`

2. Setup and run container: `docker-compose up`

3. Use it!

    1. Ceres Imagery URL: http://0.0.0.0:8888/imagery/{geotiff_uuid}/{z}/{x}/{-y}.png
    2. GSSURGO (Soil) URL: http://0.0.0.0:8888/soil/{z}/{x}/{-y}.png
