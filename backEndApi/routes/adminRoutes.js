const express = require('express');
const router = express.Router();
const authMiddleware = require('../helpers/authMiddleware');

router.use(authMiddleware(['admin']));
router.get('/admin-route', (req, res) => {
    res.status(200).json({ success: true, message: 'Admin route accessed' });
});

module.exports = router;
