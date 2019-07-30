FROM node:10-slim

ARG NODE_ENV=development
ENV NODE_ENV=${NODE_ENV}

# Install Node packages
WORKDIR /srv/tiler
COPY . .
RUN npm install

# Run server
CMD [ "npm", "run", "start" ]
