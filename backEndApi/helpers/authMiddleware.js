const jwt = require('jsonwebtoken');
const { SECRET_KEY } = process.env;

const authMiddleware = (requiredRoles) => {
    return (req, res, next) => {
        const token = req.cookies.token || req.headers.authorization?.split(' ')[1];
        
        if (!token) {
            return res.status(401).json({ success: false, message: 'Access denied. No token provided.' });
        }

        try {
            const decoded = jwt.verify(token, SECRET_KEY);
            req.user = decoded;

            if (requiredRoles && !requiredRoles.includes(req.user.role)) {
                return res.status(403).json({ success: false, message: 'Access denied. Insufficient permissions.' });
            }

            next();
        } catch (ex) {
            console.error('Error verifying token:', ex);
            return res.status(400).json({ success: false, message: 'Invalid token.' });
        }
    };
};

module.exports = authMiddleware;
