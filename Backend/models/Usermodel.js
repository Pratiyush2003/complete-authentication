const mongoose = require('mongoose');
const {model} = mongoose;
const Joi = require("joi");

const UserSchema = new mongoose.Schema({
    name : {
        type : "string",
        require : true
    },
    password : {
        type : "string",
        require : true
    },
    email : {
        type : "string",
        require : true,
        unique : true
    },
    resetPasswordToken: String,
    resetPasswordExpires: Date
})

const User =  model('user', UserSchema);
User.createIndexes();
module.exports = User;