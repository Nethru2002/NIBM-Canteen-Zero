const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');
require('dotenv').config();

const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');

const app = express();

app.use(helmet()); 
app.use(cors());
app.use(morgan('dev'));
app.use(express.json({ limit: '10kb' }));

const customSanitize = (req, res, next) => {
    const sanitize = (obj) => {
        if (obj instanceof Object) {
            for (var key in obj) {
                if (key.startsWith('$')) {
                    delete obj[key];
                } else {
                    sanitize(obj[key]);
                }
            }
        }
    };
    sanitize(req.body);
    sanitize(req.params);
    next();
};
app.use(customSanitize);

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);

app.get('/', (req, res) => {
    res.json({ status: "success", message: "NIBM Canteen-Zero API is active" });
});

app.use((err, req, res, next) => {
    console.error("❌ System Error:", err.message);
    res.status(err.statusCode || 500).json({
        status: 'error',
        message: err.message || 'Internal Server Error'
    });
});

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/nibm_canteen_db';
mongoose.connect(MONGO_URI)
    .then(() => console.log("✅ Database Connected Successfully"))
    .catch((err) => console.error("❌ DB Connection Error:", err.message));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`🚀 Production Server active on http://localhost:${PORT}`);
});