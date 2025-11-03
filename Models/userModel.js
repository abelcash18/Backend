const mongoose = require('mongoose');

const propertySchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String },
    price: { type: Number, required: true },
    location: { type: String },
    type: { type: String, enum: ['buy', 'rent'], required: true },
    propertyType: { type: String, enum: ['apartment', 'house', 'condo', 'land'], required: true },
    images: [{ type: String }],
    createdAt: { type: Date, default: Date.now },    
});


const UserSchema = mongoose.Schema({
    email: {type: String, unique: true},
    username: {type: String, unique: true},
    password: {type: String, required: true},
    avatar: {type:String},
    createdAt: {type: Date, default: Date.now},
    properties: [propertySchema]
});



const User = mongoose.model('User', UserSchema)
module.exports = User