const express = require('express');
const router = express.Router();
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const Product = require('../models/Product');
const { validateProduct } = require('../middleware/validator');

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_NAME,
    api_key: process.env.CLOUDINARY_KEY,
    api_secret: process.env.CLOUDINARY_SECRET
});

const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'nibm_canteen_system',
        allowed_formats: ['jpg', 'png', 'jpeg'],
        transformation: [{ width: 600, height: 600, crop: 'fill' }]
    }
});

const upload = multer({ storage: storage });

const emitUpdate = (req) => {
    const io = req.app.get('socketio');
    io.emit('inventoryUpdate');
};

router.get('/', async (req, res, next) => {
    try {
        const products = await Product.find({ isAvailable: true }).sort({ category: 1 });
        res.status(200).json(products);
    } catch (err) {
        next(err);
    }
});

router.get('/admin-list', async (req, res, next) => {
    try {
        const products = await Product.find().sort({ createdAt: -1 });
        res.status(200).json(products);
    } catch (err) {
        next(err);
    }
});

router.post('/', upload.single('image'), validateProduct, async (req, res, next) => {
    try {
        if (!req.file) {
            const error = new Error("Image upload mandatory");
            error.statusCode = 400;
            throw error;
        }
        const data = JSON.parse(req.body.data);
        const newProduct = new Product({ ...data, image: req.file.path });
        await newProduct.save();
        emitUpdate(req);
        res.status(201).json(newProduct);
    } catch (err) {
        next(err);
    }
});

router.put('/:id', upload.single('image'), async (req, res, next) => {
    try {
        const data = JSON.parse(req.body.data);
        const updatePayload = { ...data };
        if (req.file) updatePayload.image = req.file.path;
        const updatedProduct = await Product.findByIdAndUpdate(req.params.id, updatePayload, { new: true });
        if (!updatedProduct) {
            const error = new Error("Product not found");
            error.statusCode = 404;
            throw error;
        }
        emitUpdate(req);
        res.status(200).json(updatedProduct);
    } catch (err) {
        next(err);
    }
});

router.delete('/:id', async (req, res, next) => {
    try {
        const deletedProduct = await Product.findByIdAndDelete(req.params.id);
        if (!deletedProduct) {
            const error = new Error("Item not found");
            error.statusCode = 404;
            throw error;
        }
        emitUpdate(req);
        res.status(200).json({ message: "Deleted" });
    } catch (err) {
        next(err);
    }
});

router.patch('/:id/toggle', async (req, res, next) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) {
            const error = new Error("Item not found");
            error.statusCode = 404;
            throw error;
        }
        product.isAvailable = !product.isAvailable;
        await product.save();
        emitUpdate(req);
        res.status(200).json(product);
    } catch (err) {
        next(err);
    }
});

router.post('/daily-reset', async (req, res, next) => {
    try {
        await Product.updateMany({}, { isAvailable: true });
        emitUpdate(req);
        res.status(200).json({ message: "Reset complete" });
    } catch (err) {
        next(err);
    }
});

router.post('/seed', async (req, res, next) => {
    try {
        await Product.deleteMany({});
        const products = await Product.insertMany(req.body);
        emitUpdate(req);
        res.status(201).json(products);
    } catch (err) {
        next(err);
    }
});

module.exports = router;