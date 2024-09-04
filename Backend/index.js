require('dotenv').config()
const express = require('express');
const bodyParser = require('body-parser');
const auth = require("./Routes/authroute.js")
const connectDB = require('./db')
const cors = require('cors')

connectDB()

const app = express();
app.use(cors())
app.use(bodyParser.json());
app.use('/api/auth', auth)



const port = 4000;
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}/`)
})


