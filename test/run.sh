#!/bin/bash

export HOST=0.0.0.0
export PORT=8888

echo "Imagery Single Image"
curl -s "http://$HOST:$PORT/imagery/7326e81d-40b0-4053-8f33-bd22f9a53df9.png" | cmp test/fixtures/imagery-image.png && echo "OK"

echo "Combo Image"
curl -s "http://$HOST:$PORT/combo/7326e81d-40b0-4053-8f33-bd22f9a53df9.png" | cmp test/fixtures/combo-image.png && echo "OK"

echo "Imagery Raster Tile"
curl -s "http://$HOST:$PORT/imagery/7326e81d-40b0-4053-8f33-bd22f9a53df9/17/21455/50471.png" | cmp test/fixtures/imagery-raster-tile.png && echo "OK"

echo "Soil Raster Tile"
curl -s "http://$HOST:$PORT/soil/14/3364/6683.png" | cmp test/fixtures/soil-image-tile.png && echo "OK"

echo "Soil Vector Tile"
curl -s "http://$HOST:$PORT/soil/14/3364/6683.mvt" | cmp test/fixtures/soil-vector-tile.mvt && echo "OK"
