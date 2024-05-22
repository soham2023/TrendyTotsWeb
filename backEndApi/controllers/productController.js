const Product = require('../models/Product');
const Upload = require('../helpers/upload');
const { generateCustomId } = require("../helpers/uuid");

// Create a new product
const createProduct = async (req, res) => {
    try {
        const { customId, name, color, variety, price, age, size, material } = req.body;
        let imageUrls = [];

        // Check if files are present in the request
        if (req.files && req.files.length > 0) {
            // Iterate through each file and upload to Cloudinary
            for (const file of req.files) {
                const upload = await Upload.uploadFile(file.path);
                if (!upload || !upload.secure_url) {
                    return res.status(400).json({ success: false, msg: 'Upload process failed or no secure_url returned' });
                }
                // Push the secure URL to the array of image URLs
                imageUrls.push(upload.secure_url);
            }
        }

        // Create a new instance of Product model with the provided customId
        const newProduct = new Product({ customId, name, color, variety, price, age, size, material, images: imageUrls });

        // Save the new product to the database
        const savedProduct = await newProduct.save();

        // Send success response with saved product data
        res.status(201).json({ success: true, data: savedProduct });
    } catch (error) {
        // Handle errors
        res.status(400).json({ success: false, msg: error.message });
    }
};

// Get all products
const getProducts = async (req, res) => {
    try {
        const products = await Product.find({});
        res.status(200).json({ success: true, data: products });
    } catch (error) {
        res.status(400).json({ success: false, msg: error.message });
    }
};

// Get a product by CustomId
const getProductByCustomId = async (req, res) => {
    try {
        const product = await Product.findOne({ customId: req.params.customId });
        if (!product) {
            return res.status(404).json({ success: false, msg: 'Product not found' });
        }
        res.status(200).json({ success: true, data: product });
    } catch (error) {
        res.status(400).json({ success: false, msg: error.message });
    }
};

// Update a product by CustomId
const updateProductByCustomId = async (req, res) => {
    try {
        const { customId } = req.params;
        const { name, color, variety, price, age, size, material } = req.body;
        const updatedData = { name, color, variety, price, age, size, material };

        if (req.files && req.files.length > 0) {
            let imageUrls = [];
            for (const file of req.files) {
                const upload = await Upload.uploadFile(file.path);
                if (!upload || !upload.secure_url) {
                    return res.status(400).json({ success: false, msg: 'Upload process failed or no secure_url returned' });
                }
                imageUrls.push(upload.secure_url);
            }
            updatedData.images = imageUrls;
        }

        const updatedProduct = await Product.findOneAndUpdate({ customId }, updatedData, { new: true });
        if (!updatedProduct) {
            return res.status(404).json({ success: false, msg: 'Product not found' });
        }
        res.status(200).json({ success: true, data: updatedProduct });
    } catch (error) {
        res.status(400).json({ success: false, msg: error.message });
    }
};

// Delete a product by CustomId
const deleteProductByCustomId = async (req, res) => {
    try {
        const { customId } = req.params;
        const deletedProduct = await Product.findOneAndDelete({ customId });
        if (!deletedProduct) {
            return res.status(404).json({ success: false, msg: 'Product not found' });
        }
        res.status(200).json({ success: true, msg: 'Product deleted successfully' });
    } catch (error) {
        res.status(400).json({ success: false, msg: error.message });
    }
};

module.exports = {
    createProduct,
    getProducts,
    getProductByCustomId,
    updateProductByCustomId,
    deleteProductByCustomId
};
