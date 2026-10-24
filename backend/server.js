const express = require('express');
const connectDB = require('./configs/db_connection');
const dns = require('dns');
const redis = require('./configs/redis_connection');
const authRouter = require('./routes/auth.routes');
const cookie_parser = require('cookie-parser');

dns.setServers(["8.8.8.8","1.1.1.1"]);


require('dotenv').config();

const app = express();
app.use(express.json());
app.use(cookie_parser());
app.use('/api/v1',authRouter);


const PORT = process.env.PORT || 4000

app.listen(PORT,()=>{
    console.log(`Server started at port ${PORT}`)
})

connectDB();