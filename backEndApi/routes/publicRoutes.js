const express = require('express');
const router = express.Router();
const authMiddleware = require('../helpers/authMiddleware');

// Routes where authentication is not required
const skipAuthRoutes = [
    '/public-route'
];

// Apply authMiddleware skipping authentication for certain routes
router.use(authMiddleware(skipAuthRoutes));

// Route for accessing public routes
router.get('/public-route', (req, res) => {
    res.status(200).json({ success: true, message: 'Public route accessed by everyone' });
});

module.exports = router;
