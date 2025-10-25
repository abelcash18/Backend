const mongoose = require('mongoose');

const propertySchema = mongoose.Schema({
    title: {type: String, required: true},
    description: {type: String},
    price: {type: Number, required: true},
    location: {type: String},
    images: [{type: String}],
    createdAt: {type: Date, default: Date.now}
})

const UserSchema = mongoose.Schema({
    email: {type: String, unique: true},
    username: {type: String, unique: true},
    password: {type: String, required: true},
    gender: {type: String},
    nationality: {type:String},
    city: {type:String},
    mobile: {type:String},
    avatar: {type:String},
    createdAt: {type: Date, default: Date.now},
    properties: [propertySchema]
})
const User = mongoose.model('User', UserSchema)
module.exports = User