const express = require('express');
const router = express.Router();
const authMiddleware = require('../helpers/authMiddleware');

// Routes accessible by both admin and user
router.get('/user-route', authMiddleware(['admin', 'user']), (req, res) => {
    res.status(200).json({ success: true, message: 'User route accessed' });
});

module.exports = router;
