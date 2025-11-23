const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    email: { 
        type: String, 
        unique: true, 
        required: true,
        trim: true,
        lowercase: true
    },
    username: { 
        type: String, 
        unique: true, 
        required: true,
        trim: true
    },
    password: { 
        type: String, 
        required: true 
    },
    avatar: { 
        type: String,
        default: "/noavatarr.jpg"
    },
    resetPasswordToken: String,
    resetPasswordExpires: Date,
    createdAt: { 
        type: Date, 
        default: Date.now 
    },
   
}, {
    timestamps: true
});



const User = mongoose.model('User', UserSchema);
module.exports = User;