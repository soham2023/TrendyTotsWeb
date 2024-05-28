const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
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
    },
    collection: {
        type: String,
        required: true,
        validate: {
            validator: function(value) {
                return /^(summer-set|winter-set)$/.test(value); // Validate if the collection name is 'summer-set' or 'winter-set'
            },
            message: props => `${props.value} is not a valid collection name`
        }
    }
}, {
    timestamps: true,
    suppressReservedKeysWarning: true // Suppress the warning for using the 'collection' field
});

// Middleware to set the collection name based on the product name
productSchema.pre('save', function(next) {
    if (this.name === 'summer-set') {
        this.collection = 'summer-set';
    } else if (this.name === 'winter-set') {
        this.collection = 'winter-set';
    }
    next();
});

module.exports = mongoose.model('Product', productSchema);
