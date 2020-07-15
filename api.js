const express = require('express')
const bodyParser = require('body-parser')
const mongoConnect = require('./util/database').mongoConnect

const app = express()

// routers
const apiRoutes = require('./routes/api')

// helpers
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({
    extended: false
}))

// api router
console.log('API IS RUNNING')

app.use('/api', apiRoutes)

mongoConnect(() => app.listen(3000))

// mongoConnect(() => app.listen(3001, '172.31.0.89'))