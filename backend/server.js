const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');
const http = require('http');
const { Server } = require('socket.io');
require('dotenv').config();

const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');
const orderRoutes = require('./routes/orderRoutes');

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: process.env.FRONTEND_URL,
        methods: ["GET", "POST", "PATCH", "PUT", "DELETE"]
    }
});

app.set('socketio', io);

app.use(helmet()); 
app.use(cors({
    origin: process.env.FRONTEND_URL
}));
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
app.use('/api/orders', orderRoutes);

app.get('/', (req, res) => {
    res.json({ status: "success", message: "NIBM Canteen-Zero 100% Production API" });
});

app.use((err, req, res, next) => {
    console.error("❌ Critical Error:", err.message);
    const statusCode = err.statusCode || 500;
    res.status(statusCode).json({
        status: 'error',
        message: err.message || 'Internal Server Error'
    });
});

mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log("✅ Database: Industrial MongoDB Connected"))
    .catch((err) => console.error("❌ Database: Connection Failure", err.message));

io.on('connection', (socket) => {
    console.log('📡 Socket: User connected to production stream');
    socket.on('disconnect', () => {
        console.log('📡 Socket: User disconnected');
    });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
    console.log(`🚀 API Cluster Active: ${process.env.BACKEND_URL}`);
    console.log(`🔒 Security: Custom Sanitizer & Helmet Enabled`);
});