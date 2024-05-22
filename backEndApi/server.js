const app = require('./app');
require('dotenv').config(); // Load environment variables from .env file

const PORT = process.env.PORT || 3000;

try {
    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    }).on('error', (err) => {
        if (err.code === 'EADDRINUSE') {
            console.error(`Port ${PORT} is already in use. Trying a different port...`);
            const newPort = PORT + 1;
            app.listen(newPort, () => {
                console.log(`Server is running on port ${newPort}`);
            }).on('error', (err) => {
                console.error('Server error:', err);
            });
        } else {
            console.error('Server error:', err);
        }
    });
} catch (error) {
    console.error('Error starting server:', error);
    process.exit(1); // Exit process with failure
}

// done