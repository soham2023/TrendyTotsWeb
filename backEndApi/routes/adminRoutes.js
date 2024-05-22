const express = require('express');
const router = express.Router();
const authMiddleware = require('../helpers/authMiddleware');

// Routes that require admin role
router.use(authMiddleware(['admin']));

router.get('/someadminroute', (req, res) => {
    res.status(200).json({ success: true, message: 'Admin route accessed' });
});

module.exports = router;
