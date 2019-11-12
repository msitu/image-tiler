#!/bin/bash

TILER_URL=${1:-http://tiler:$PORT}
TIMEFORMAT=%Rs

RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m'

test()
{
    # $1: Test title
    # $2: Resource path
    # $3: Fixture path

    echo -e "${BLUE}$1: ${NC}$TILER_URL/$2${RED}"
    time curl -s "$TILER_URL/$2" | cmp test/fixtures/$3 && echo -e "${GREEN}OK"
    echo -e "=================\n${NC}"
}

test "Imagery Single Image" \
    imagery/7326e81d-40b0-4053-8f33-bd22f9a53df9.png \
    imagery-image.png

test "Imagery Raster Tile" \
    imagery/7326e81d-40b0-4053-8f33-bd22f9a53df9/17/21455/50471.png \
    imagery-raster-tile.png

test "Combo Image" \
    combo/7326e81d-40b0-4053-8f33-bd22f9a53df9.png \
    combo-image.png

test "Soil Raster Tile" \
    soil/14/3364/6683.png \
    soil-image-tile.png

test "Soil Vector Tile" \
    soil/14/3364/6683.mvt \
    soil-vector-tile.mvt

test "Field Vector Tile" \
    field/92b9b844-adf4-48a8-a750-9135d9a01c0b/17/21458/50472.mvt \
    field-vector-tile.mvt
