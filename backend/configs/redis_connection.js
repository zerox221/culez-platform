const Redis = require('ioredis');
require('dotenv').config();


const redis = new Redis({
    username : process.env.REDIS_USERNAME,
    password : process.env.REDIS_PASSWORD,
    host : process.env.REDIS_HOST,
    port : process.env.REDIS_PORT
})

redis.on('connect',()=>{
    console.log("redis connected");
})
redis.on('error',()=>{
    console.log("redis not connected");
})

module.exports = redis;