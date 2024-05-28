const mongoose = require('mongoose');

const winterSetProductSchema = new mongoose.Schema({
    customId: { 
        type: String, 
        unique: true, 
        required: true 
    },
    images: [{ 
        type: String 
    }],
    name: {
        type: String,
        required: true,
        trim: true,
    },
    color: {
        type: String,
        required: true,
        trim: true,
    },
    variety: {
        type: String,
        required: true,
        trim: true,
    },
    price: {
        type: Number,
        required: true,
    },
    age: {
        type: String,
        required: false,
    },
    size: {
        type: String,
        required: false,
    },
    material: {
        type: String,
        required: true,
        trim: true,
    }
}, {
    timestamps: true,
    collection: 'winter-set' // Set the collection name
});

module.exports = mongoose.model('WinterSetProduct', winterSetProductSchema);
