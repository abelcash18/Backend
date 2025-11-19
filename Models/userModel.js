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
    // Remove the properties array completely
    // properties: [userPropertySchema]
}, {
    timestamps: true
});

UserSchema.index({ email: 1 });
UserSchema.index({ username: 1 });

const User = mongoose.model('User', UserSchema);
module.exports = User;