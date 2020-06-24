FROM maurimiranda/node-mapnik-gdal:latest

WORKDIR /srv/tiler

# Install Node packages
COPY package.json package-lock.json ./
RUN npm install

# Copy code
COPY . .

# Run server
CMD [ "npm", "run", "start" ]
