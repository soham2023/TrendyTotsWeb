const express = require('express');
const router = express.Router();
const { signUp, signIn, signOut } = require('../controllers/adminController');

// Public routes
router.post('/signup', signUp);
router.post('/signin', signIn);
router.post('/signout', signOut);  // Add signout route

module.exports = router;
