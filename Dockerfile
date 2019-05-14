FROM node:10

RUN apt update -y

# Install system dependencies
RUN apt install -y python zlib1g-dev clang make pkg-config curl git \
  libgdal-dev libpng-dev libproj-dev libboost-regex-dev scons \
  libboost-filesystem-dev libboost-system-dev libharfbuzz-dev \
  libboost-program-options-dev libcurl4-gnutls-dev

# Clone and build Mapnik
RUN git clone https://github.com/mapnik/mapnik.git
WORKDIR /mapnik
RUN git submodule update --init
RUN ./configure
RUN JOBS=8 make
RUN make install

# Clone and build Mapnik binding for Node
WORKDIR /
RUN git clone https://github.com/mapnik/node-mapnik.git
WORKDIR /node-mapnik
RUN make release_base
RUN scripts/postinstall.sh
RUN npm link

# Install Node packages
COPY package.json /
WORKDIR /
RUN npm install
RUN npm link mapnik
