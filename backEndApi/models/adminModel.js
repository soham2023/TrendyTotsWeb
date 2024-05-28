const mongoose = require('mongoose');
const JWT = require('jsonwebtoken');
require('dotenv').config();

const adminSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
    },
    password: {
        type: String,
        minLength: [5, 'Minimum length of password is 5'],
    },
    role: {
        type: String,
        enum: ['admin', 'user'],
        default: 'user',
    },
    googleId: {
        type: String,
        unique: true,
        sparse: true,
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

adminSchema.methods = {
    jwtToken() {
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
    }
};

const Admin = mongoose.model('Admin', adminSchema);

module.exports = Admin;
