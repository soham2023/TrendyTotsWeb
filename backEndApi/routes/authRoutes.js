const express = require('express');
const passport = require('passport');
const { signUp, signIn, signOut, forgotPassword, resetPassword } = require('../controllers/adminController');
const router = express.Router();

router.post('/signup', signUp);
router.post('/signin', signIn);
router.post('/signout', signOut);
router.post('/forgotpassword', forgotPassword); 
router.post('/resetpassword', resetPassword); 

// Google OAuth
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
router.get('/google/callback', 
    passport.authenticate('google', { failureRedirect: '/login' }),
    (req, res) => {
        const token = req.user.jwtToken();
        res.cookie('token', token, { maxAge: 24 * 60 * 60 * 1000, httpOnly: true });
        res.redirect('/');
    }
);

module.exports = router;
