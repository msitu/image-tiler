FROM maurimiranda/node-mapnik-gdal:latest

EXPOSE 8888

# TODO: conditionally set env vars based on prod/dev mode
ARG ENV="production"
ARG HOST
ARG PORT
ARG ROOTPATH
ENV HOST=$HOST
ENV PORT=$PORT
ENV ROOTPATH=$ROOTPATH

WORKDIR /srv/tiler
# Install Node packages
COPY package.json package-lock.json ./
RUN npm install

# Copy code
COPY . .

# Run server
CMD [ "npm", "run", "start" ]
