const mongoose = require('mongoose');
require('dotenv').config();

const connectDB = async()=>{
    try {
        await mongoose.connect(process.env.DATABASE_URL);
        console.log("DB CONNECTED");
    } catch (error) {
        console.log("DB NOT CONNECTED");
        process.exit(1);
    }
}

module.exports = connectDB;