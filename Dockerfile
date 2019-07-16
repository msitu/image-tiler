FROM node:10-slim

ARG NODE_ENV=development
ENV NODE_ENV=${NODE_ENV}

RUN apt update -y

# Install system dependencies
RUN apt install -y python zlib1g-dev clang make pkg-config curl git \
  libgdal-dev libpng-dev libproj-dev libboost-regex-dev scons \
  libboost-filesystem-dev libboost-system-dev libharfbuzz-dev \
  libboost-program-options-dev libcurl4-gnutls-dev \
  libcairo-dev libfreetype6-dev build-essential g++

# Clone and build Mapnik
WORKDIR /src
RUN git clone https://github.com/mapnik/mapnik.git
WORKDIR /src/mapnik
RUN git submodule update --init
RUN ./configure
RUN JOBS=8 make
RUN make install

# Clone and build Mapnik binding for Node
WORKDIR /src
RUN git clone https://github.com/mapnik/node-mapnik.git
WORKDIR /src/node-mapnik
RUN make release_base
RUN scripts/postinstall.sh
RUN npm link

# Install Node packages
WORKDIR /srv/tiler
COPY . .
RUN npm install
RUN npm link mapnik

# Run server
CMD [ "npm", "run", "start" ]
