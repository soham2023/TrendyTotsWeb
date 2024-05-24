const adminModel = require('../models/adminModel.js');
const emailValidator = require('email-validator');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { SECRET_KEY } = process.env;
const crypto = require('crypto');
const nodemailer = require('nodemailer'); // Import nodemailer for sending emails
const otpGenerator = require('otp-generator'); // Import otp-generator for generating OTPs



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


/*------------------------------------------------- Forgot Password --------------------------------------------------*/

const forgotPassword = async (req, res) => {
    const { email } = req.body;
    
    if (!email) {
        return res.status(400).json({
            success: false,
            message: 'Please provide your email',
        });
    }

    try {
        const admin = await adminModel.findOne({ email });
        
        if (!admin) {
            return res.status(404).json({
                success: false,
                message: 'No account found with this email',
            });
        }

        // Generate OTP
        const generateNumericOTP = (length) => {
            let otp = '';
            for (let i = 0; i < length; i++) {
                otp += Math.floor(Math.random() * 10).toString();
            }
            return otp;
        };
        const otp = generateNumericOTP(8); 

        // Save OTP and its expiry time in the database
        admin.resetPasswordOTP = otp;
        admin.resetPasswordOTPExpires = Date.now() + 600000; // OTP expires in 10 minutes
        await admin.save();

        // Send OTP via email
        const transporter = nodemailer.createTransport({
            // Configure your email provider here
            // Example configuration for Gmail:
            service: 'gmail',
            host: "smtp.gmail.com",
            port: 587,
            secure: false, // or 'STARTTLS'
            auth: {
                
                user: '',
                pass: '',
            }
        });

        const mailOptions = {
            from: '',
            to: email,
            subject: 'Password Reset OTP',
            text: `Your OTP for password reset is: ${otp}`
        };

        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.error('Error sending email:', error);
                return res.status(500).json({
                    success: false,
                    message: 'Failed to send OTP email'
                });
            }
            console.log('Email sent:', info.response);
            return res.status(200).json({
                success: true,
                message: 'OTP sent to your email',
            });
        });
    } catch (error) {
        console.error('Error during forgot password:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};


/*------------------------------------------------- Reset Password --------------------------------------------------*/

const resetPassword = async (req, res) => {
    const { email, otp, newPassword, confirmPassword } = req.body;
    
    if (!email || !otp || !newPassword || !confirmPassword) {
        return res.status(400).json({
            success: false,
            message: 'Please provide email, OTP, and new password',
        });
    }

    try {
        const admin = await adminModel.findOne({ email, resetPasswordOTP: otp, resetPasswordOTPExpires: { $gt: Date.now() } });
        
        if (!admin) {
            return res.status(400).json({
                success: false,
                message: 'Invalid or expired OTP',
            });
        }

        if (newPassword !== confirmPassword) {
            return res.status(400).json({
                success: false,
                message: 'Passwords do not match',
            });
        }

        // Hash the new password
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        // Update user's password and clear reset OTP
        admin.password = hashedPassword;
        admin.resetPasswordOTP = undefined;
        admin.resetPasswordOTPExpires = undefined;
        await admin.save();

        return res.status(200).json({
            success: true,
            message: 'Password reset successfully',
        });
    } catch (error) {
        console.error('Error during password reset:', error);
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
    forgotPassword,
    resetPassword

};
