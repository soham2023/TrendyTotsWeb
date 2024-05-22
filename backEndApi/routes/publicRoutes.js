const express = require('express');
const router = express.Router();

router.get('/public-route', (req, res) => {
    res.status(200).json({ success: true, message: 'Public route accessed by everyone' });
});

module.exports = router;
