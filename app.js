const express = require('express')
const bodyParser = require('body-parser')
const mongoConnect = require('./util/database').mongoConnect

const app = express()

let port = process.env.PORT || 3000;

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

mongoConnect(() => app.listen(port, function () {
    console.log(`listening on port ${port}!`)
}))

// mongoConnect(() => app.listen(3001, '172.31.0.89'))