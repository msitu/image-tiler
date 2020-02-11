FROM maurimiranda/node-mapnik-gdal:latest

# Install Node packages
WORKDIR /srv/tiler
COPY . .
RUN npm install

# Run server
CMD [ "npm", "run", "start" ]
