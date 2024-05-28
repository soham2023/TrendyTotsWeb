const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const JWT = require('jsonwebtoken');
require('dotenv').config();

const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
    },
    password: {
        type: String,
        required: true,
        minlength: [5, 'Minimum length of password is 5'],
    },
    role: {
        type: String,
        enum: ['admin', 'user'],
        default: 'user',
    },
    resetPasswordOTP: {
        type: String,
        default: undefined,
    },
    resetPasswordOTPExpires: {
        type: Date,
        default: undefined,
    }
}, {
    timestamps: true
});

// Hash the password before saving the user model
userSchema.pre('save', async function(next) {
    if (!this.isModified('password')) {
        return next();
    }
    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (err) {
        return next(err);
    }
});

// Instance method to generate JWT token
userSchema.methods.generateJWT = function() {
    try {
        return JWT.sign(
            { id: this._id, email: this.email, role: this.role },
            process.env.SECRET,
            { expiresIn: '24h' }
        );
    } catch (error) {
        console.error('Error generating JWT token', error);
        throw new Error('Error generating token');
    }
};

// Static method to login a user
userSchema.statics.login = async function(email, password) {
    const user = await this.findOne({ email });
    if (!user) {
        throw new Error('User not found');
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
        throw new Error('Invalid password');
    }
    return user;
};

const User = mongoose.model('User', userSchema);

module.exports = User;
