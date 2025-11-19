const mongoose = require('mongoose');

const propertySchema = new mongoose.Schema({
    title: { 
        type: String, 
        required: [true, 'Title is required'],
        trim: true
    },
    description: { 
        type: String, 
        default: '',
        trim: true
    },
    price: { 
        type: Number, 
        required: [true, 'Price is required'],
        min: [0, 'Price cannot be negative']
    },
    address: { 
        type: String, 
        required: [true, 'Address is required'],
        trim: true
    },
    city: { 
        type: String, 
        required: [true, 'City is required'],
        trim: true
    },
    // Add latitude and longitude fields
    latitude: {
        type: Number,
        required: false // Make optional for existing data
    },
    longitude: {
        type: Number,
        required: false // Make optional for existing data
    },
    bedroom: { 
        type: Number, 
        required: [true, 'Bedroom count is required'],
        min: [1, 'Must have at least 1 bedroom']
    },
    bathroom: { 
        type: Number, 
        required: [true, 'Bathroom count is required'],
        min: [1, 'Must have at least 1 bathroom']
    },
    type: { 
        type: String, 
        enum: {
            values: ['buy', 'rent'],
            message: 'Type must be either "buy" or "rent"'
        }, 
        required: true 
    },
    propertyType: { 
        type: String, 
        enum: {
            values: ['apartment', 'house', 'condo', 'land'],
            message: 'Property type must be one of: apartment, house, condo, land'
        }, 
        required: true 
    },
    images: [{ 
        type: String,
        validate: {
            validator: function(array) {
                return array.length > 0;
            },
            message: 'At least one image is required'
        }
    }],
    userId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        required: true 
    },
    createdAt: { 
        type: Date, 
        default: Date.now 
    },
}, {
    timestamps: true
});

propertySchema.index({ userId: 1 });
propertySchema.index({ type: 1 });
propertySchema.index({ propertyType: 1 });
propertySchema.index({ city: 1 });
propertySchema.index({ latitude: 1, longitude: 1 }); // Geospatial index

const Property = mongoose.model('Property', propertySchema);
module.exports = Property;