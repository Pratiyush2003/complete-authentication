const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        const connect = await mongoose.connect('mongodb://localhost:27017/abasiclogin')
        if(connect){
            console.log("connected")
        }
    } catch (error) {
        console.log(error)
    } 
} 

module.exports = connectDB