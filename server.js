import express from 'express'
import cors from 'cors'
import morgan from 'morgan'

import gssurgo from './controllers/gssurgo'
import imagery from './controllers/imagery'
import combo from './controllers/combo'

// Create Express App
const app = express()

// Add CORS
app.use(cors())

// Add logger
app.use(morgan(':date[iso] :remote-addr :url :status :response-time ms'))

// Add layer controllers
app.use('/soil', gssurgo)
app.use('/imagery', imagery)
app.use('/combo', combo)

// Server status check
app.get('/status', (req, res) => {
  res.status(200).send(process.env.npm_package_version)
})

// Default handler
app.use((error, req, res, next) => {
  if (error) {
    console.error(error)
    res.status(500).send(error)
  } else {
    res.sendStatus(404)
  }
})

// Start Server
app.listen(process.env.PORT, process.env.HOST)
console.info(`Running on http://${process.env.HOST}:${process.env.PORT}`)
