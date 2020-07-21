FROM maurimiranda/node-mapnik-gdal:latest

EXPOSE 8888

ARG HOST
ARG PORT
ENV HOST=$HOST
ENV PORT=$PORT

WORKDIR /srv/tiler
# Install Node packages
COPY package.json package-lock.json ./
RUN npm install

# Copy code
COPY . .

# Run server
CMD [ "npm", "run", "start" ]
