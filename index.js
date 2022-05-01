const express = require('express');
const app = express();
const morgan = require('morgan');
const mongoose = require('mongoose');
const cors = require('cors');


const path = require('path')

app.use(express.static(path.join(__dirname +  '/public')))

/**
 * Routes files 
 */
const userRouter = require('./routers/user');
const poolRouter = require('./routers/pool');


/**
 * access to .env file 
 */
require('dotenv/config')

/**
 * middleware
 */
app.use(cors());
app.options('*', cors())


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

/**
 * listen to port
 */

const PORT = process.env.PORT || 5000

app.listen(PORT,() => {
  console.log('Server started on port 3333');
})


