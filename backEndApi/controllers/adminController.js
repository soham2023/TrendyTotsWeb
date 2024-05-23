const adminModel = require('../models/adminModel.js');
const emailValidator = require('email-validator');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { SECRET_KEY } = process.env;

if (!SECRET_KEY) {
    console.error('SECRET_KEY is not defined in environment variables');
    process.exit(1);
}

/*------------------------------------------------- SignUp --------------------------------------------------*/

const signUp = async (req, res) => {
    const { email, password, confirmPassword, role } = req.body;
    console.log(email, password, confirmPassword, role);
    
    // Check if all required fields are provided
    if (!email || !password || !confirmPassword) {
        return res.status(400).json({
            success: false,
            message: 'Please fill all the fields',
        });
    }

    // Validate email format
    const validEmail = emailValidator.validate(email);
    if (!validEmail) {
        return res.status(400).json({
            success: false,
            message: 'Please enter a valid email address',
        });
    }

    try {
        // Check if passwords match
        if (password !== confirmPassword) {
            return res.status(400).json({
                success: false,
                message: 'Passwords do not match',
            });
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Set default role to 'user' if not provided
        const userRole = role || 'user';

        // Create new admin/user
        const newAdmin = new adminModel({
            email,
            password: hashedPassword,
            role: userRole,
        });

        const result = await newAdmin.save();
        return res.status(200).json({
            success: true,
            data: result,
        });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({
                success: false,
                message: `Account already exists with provided email ${email}`,
            });
        }
        return res.status(500).json({
            success: false,
            message: 'Internal server error',
        });
    }
};

/*------------------------------------------------- SignIn --------------------------------------------------*/

const signIn = async (req, res) => {
    const { email, password } = req.body;
    console.log(email, password);

    if (!email || !password) {
        return res.status(400).json({
            success: false,
            message: 'Every field is mandatory',
        });
    }

    try {
        const admin = await adminModel.findOne({ email }).select('+password');

        if (!admin || !(await bcrypt.compare(password, admin.password))) {
            return res.status(400).json({
                success: false,
                message: 'Invalid credentials',
            });
        }

        const token = jwt.sign({ id: admin._id, role: admin.role }, SECRET_KEY, { expiresIn: '1d' });
        console.log(token);
        admin.password = undefined;

        const cookieOption = {
            maxAge: 24 * 60 * 60 * 1000,
            httpOnly: true,
        };
        res.cookie("token", token, cookieOption);
        return res.status(200).json({
            success: true,
            data: { admin, role: admin.role }
        });
    } catch (error) {
        console.error('Error during sign-in:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

/*------------------------------------------------- SignOut --------------------------------------------------*/

const signOut = (req, res) => {
    // Check if the token exists in the cookies
    const token = req.cookies.token;

    if (!token) {
        return res.status(400).json({
            success: false,
            message: 'No user is currently signed in',
        });
    }

    // Clear the token cookie to sign out the user
    res.cookie('token', '', { maxAge: 0, httpOnly: true });
    return res.status(200).json({
        success: true,
        message: 'Successfully signed out',
    });
};
/*------------------------------------------------- Exports --------------------------------------------------*/

module.exports = {
    signUp,
    signIn,
    signOut,
};
// bugs fixed