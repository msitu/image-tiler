import express from 'express'
import cors from 'cors'
import morgan from 'morgan'

import gssurgo from './routes/gssurgo'
import imagery from './routes/imagery'
import combo from './routes/combo'
import field from './routes/field'

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
app.use('/field', field)

// Redirect root to status
app.get('/', (req, res) => {
  res.redirect('/status')
})

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
