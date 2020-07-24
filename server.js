import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import path from 'path';

import ceresFlights from './routes/ceres_flights'

// Create Express App
const app = express();

// Add CORS
app.use(cors({ origin: true }));

// Add logger
if (process.env.NODE_ENV !== 'test') {
  morgan.token('error', (req) => {
    if (req.error) {
      console.error(req.error);
    }
    return req.error;
  });

  app.use(morgan(':date[iso] :remote-addr :url :status :response-time :error'));
}

// Debugging for tests
if (process.env.NODE_ENV === 'test') {
  app.use((req, res, next) => {
    console.debug(req.url);
    next();
  });
}

app.use('/ceresflights', ceresFlights)

// Redirect to barebones tile client
app.get('/', (req, res) => {
  res.sendFile(path.join(process.cwd(), 'index.html'))
});

// Server status check
app.get('/status', (req, res) => {
  res.status(200).send(process.env.npm_package_version);
});

// Default handler
app.use((error, req, res, next) => {
  if (error) {
    req.error = error;
    res.status(error.code || 500);
    res.send(error.message);
  } else {
    res.sendStatus(404);
  }
});

// Start Server
export default app.listen(process.env.PORT, process.env.HOST, () => {
  console.info(`Running on http://${process.env.HOST}:${process.env.PORT}`);
});
