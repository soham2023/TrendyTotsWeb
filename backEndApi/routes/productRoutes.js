const express = require("express");
const router = express.Router();
const multer = require('multer');
const path = require('path');
const productController = require('../controllers/productController');
const authMiddleware = require('../helpers/authMiddleware');

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, './public/uploads'); // Destination folder for saving files
    },
    filename: (req, file, cb) => {
        cb(null, file.originalname); // Keep original file name
    }
});

const upload = multer({ storage: storage });

// Apply authentication middleware to all product routes
router.use(authMiddleware(['admin', 'user']));

// Route for creating products with multiple image uploads
router.post('/createproducts', authMiddleware(['admin']), upload.array('images', 6), productController.createProduct);

// Route for updating products by custom ID with multiple image uploads
router.put('/updateproducts/:customId', authMiddleware(['admin']), upload.array('images', 6), productController.updateProductByCustomId);

// Route for getting all products
router.get('/getproducts', productController.getProducts);

// Route for getting a product by custom ID
router.get('/getproducts/:customId', productController.getProductByCustomId);

// Route for deleting a product by ID
router.delete('/deleteproducts/:customId', authMiddleware(['admin']), productController.deleteProductByCustomId);

module.exports = router;
