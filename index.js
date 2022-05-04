const express = require('express');
const app = express();
const morgan = require('morgan');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path')

app.use(express.static(path.join(__dirname +  '/public')))

/**
 * Authentication
 */
 const authJwt = require('./helpers/jwt');
 const errorHandler = require('./helpers/error-handler');

/**
 * Routes files 
 */
const userRouter = require('./routers/user');
const poolRouter = require('./routers/pool');
const authRouter = require('./routers/auth');


/**
 * access to .env file 
 */
require('dotenv/config')

/**
 * middleware
 */
app.use(express.json())
app.use(cors());
app.options('*', cors())

/**
 * route kontrol
 * eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2MjZjZjg1NmNlN2Q5NTQ3OWYwOGUzZjciLCJpYXQiOjE2NTE0MTUwNTUsImV4cCI6MTY1MTUwMTQ1NX0.szvN0C0WluxaklCV91Y98EO-5dtmSLky-oRmUB2Z0wQ
 */
app.use(authJwt());
app.use(errorHandler);

/**
 * database connection to mongodb
 */
mongoose.connect(process.env.CONNECTION_STRING, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})


/**
 * routes
 */

app.use('/api/users',userRouter);
app.use('/api/pools',poolRouter);
app.use('/api/auth', authRouter);

/**
 * listen to port
 */

const PORT = process.env.PORT || 5000

app.listen(PORT,() => {
  console.log('Server started on port 3333');
})


