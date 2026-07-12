const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const Order = require('../models/Order');
const Product = require('../models/Product');

const CANTEEN_CAPACITY = 40;

const generateUniqueToken = async () => {
    let isUnique = false;
    let token;
    while (!isUnique) {
        token = Math.floor(1000 + Math.random() * 9000).toString();
        const existingOrder = await Order.findOne({ 
            tokenID: token, 
            status: { $in: ['Paid', 'Preparing', 'Ready'] } 
        });
        if (!existingOrder) isUnique = true;
    }
    return token;
};

const getActiveCount = async () => {
    return await Order.countDocuments({ status: { $in: ['Paid', 'Preparing', 'Ready'] } });
};

const getActiveOccupancy = async () => {
    return await Order.countDocuments({ 
        orderType: 'Dine-In',
        status: { $in: ['Paid', 'Preparing', 'Ready', 'Collected'] },
        seatReleased: false 
    });
};

const emitUpdate = async (req, order) => {
    const io = req.app.get('socketio');
    const activeCount = await getActiveCount();
    const occupancy = await getActiveOccupancy();
    
    io.emit('orderCountUpdate', activeCount);
    io.emit('occupancyUpdate', { occupied: occupancy, available: Math.max(0, CANTEEN_CAPACITY - occupancy), total: CANTEEN_CAPACITY });
    io.emit('revenueUpdate');

    if (order) {
        io.emit('orderUpdate', { userId: order.user, orderId: order._id, status: order.status, tokenID: order.tokenID });
    }
};

const startSmartReleaseTimer = (order, req) => {
    const hasMeal = order.items.some(item => item.category === 'Main Meals');
    const duration = hasMeal ? 25 * 60 * 1000 : 12 * 60 * 1000;
    setTimeout(async () => {
        try {
            const targetOrder = await Order.findById(order._id);
            if (targetOrder && !targetOrder.seatReleased) {
                targetOrder.seatReleased = true;
                await targetOrder.save();
                await emitUpdate(req);
                const io = req.app.get('socketio');
                io.emit('orderUpdate', { userId: targetOrder.user, status: 'Expired' });
            }
        } catch (err) { console.error(err); }
    }, duration);
};

router.get('/occupancy', async (req, res, next) => {
    try {
        const occupied = await getActiveOccupancy();
        res.json({ occupied, total: CANTEEN_CAPACITY, available: Math.max(0, CANTEEN_CAPACITY - occupied) });
    } catch (err) { next(err); }
});

router.get('/active-count', async (req, res, next) => {
    try {
        const count = await getActiveCount();
        res.json({ count });
    } catch (err) { next(err); }
});

router.get('/admin/daily-report', async (req, res, next) => {
    try {
        const startOfWindow = new Date();
        startOfWindow.setHours(startOfWindow.getHours() - 24); // Look back exactly 24 hours

        const orders = await Order.find({
            createdAt: { $gte: startOfWindow },
            status: { $ne: 'Pending' }
        });

        let totalRevenue = 0;
        let itemCounts = {};
        let totalPrepTime = 0;
        let fulfilledCount = 0;

        orders.forEach(order => {
            totalRevenue += order.totalAmount;
            order.items.forEach(item => {
                itemCounts[item.name] = (itemCounts[item.name] || 0) + item.quantity;
            });
            if (order.paidAt && order.readyAt) {
                const diff = (new Date(order.readyAt) - new Date(order.paidAt)) / 60000;
                totalPrepTime += diff;
                fulfilledCount++;
            }
        });

        const topItems = Object.entries(itemCounts).sort(([, a], [, b]) => b - a).slice(0, 3).map(([name, count]) => ({ name, count }));

        res.json({ date: new Date().toLocaleDateString('en-GB'), revenue: totalRevenue, orderCount: orders.length, avgPrepTime: fulfilledCount > 0 ? Math.round(totalPrepTime / fulfilledCount) : 0, topItems });
    } catch (err) { next(err); }
});

router.get('/admin/active', async (req, res, next) => {
    try {
        const orders = await Order.find({ 
            status: { $in: ['Paid', 'Preparing', 'Ready'] } 
        }).sort({ createdAt: 1 });
        res.json(orders);
    } catch (err) { next(err); }
});

router.post('/create', async (req, res, next) => {
    try {
        const { items, totalAmount, userId, orderType } = req.body;
        if (orderType === 'Dine-In') {
            const occupied = await getActiveOccupancy();
            if (occupied >= CANTEEN_CAPACITY) {
                const error = new Error("Canteen seating capacity exceeded");
                error.statusCode = 400;
                throw error;
            }
        }
        const newOrder = new Order({ user: userId, items, totalAmount, orderType, status: 'Pending' });
        await newOrder.save();
        res.status(201).json(newOrder);
    } catch (err) { next(err); }
});

router.patch('/:id/status', async (req, res, next) => {
    try {
        const { status } = req.body;
        const updateFields = { status };
        if (status === 'Preparing') updateFields.preparingAt = new Date();
        if (status === 'Ready') updateFields.readyAt = new Date();
        const order = await Order.findByIdAndUpdate(req.params.id, updateFields, { new: true });
        if (!order) return res.status(404).json({ message: "Order not found" });
        await emitUpdate(req, order);
        res.json(order);
    } catch (err) { next(err); }
});

router.patch('/:id/collect', async (req, res, next) => {
    try {
        const order = await Order.findById(req.params.id);
        if (!order) return res.status(404).json({ message: "Order not found" });
        order.status = 'Collected';
        order.collectedAt = new Date();
        await order.save();
        if (order.orderType === 'Dine-In') { startSmartReleaseTimer(order, req); }
        else { order.seatReleased = true; await order.save(); }
        await emitUpdate(req, order);
        res.json({ message: "Success" });
    } catch (err) { next(err); }
});

router.patch('/:id/pay-simulate', async (req, res, next) => {
    try {
        const order = await Order.findById(req.params.id);
        if (!order) return res.status(404).json({ message: "Order not found" });
        order.status = 'Paid';
        order.paidAt = new Date();
        order.tokenID = await generateUniqueToken();
        order.paymentId = "SIM-" + crypto.randomBytes(4).toString('hex').toUpperCase();
        await order.save();
        await emitUpdate(req, order);
        const io = req.app.get('socketio');
        io.emit('newOrderAlert', order);
        res.json({ message: "Success", order });
    } catch (err) { next(err); }
});

router.patch('/:id/release-manual', async (req, res, next) => {
    try {
        const order = await Order.findById(req.params.id);
        if (!order) return res.status(404).json({ message: "Order not found" });
        order.seatReleased = true;
        await order.save();
        await emitUpdate(req);
        res.json({ message: "Success" });
    } catch (err) { next(err); }
});

router.patch('/:id/extend-seat', async (req, res, next) => {
    try {
        const order = await Order.findById(req.params.id);
        if (!order || order.isExtended) return res.status(400).json({ message: "Denied" });
        order.isExtended = true;
        await order.save();
        setTimeout(async () => {
            const target = await Order.findById(order._id);
            if (target && !target.seatReleased) {
                target.seatReleased = true;
                await target.save();
                await emitUpdate(req);
            }
        }, 5 * 60 * 1000);
        res.json({ message: "Success" });
    } catch (err) { next(err); }
});

router.get('/user-history/:userId', async (req, res, next) => {
    try {
        const history = await Order.find({ user: req.params.userId, status: { $ne: 'Pending' } }).sort({ createdAt: -1 });
        res.json(history);
    } catch (err) { next(err); }
});

router.get('/user/:userId', async (req, res, next) => {
    try {
        const orders = await Order.find({ 
            user: req.params.userId, 
            status: { $in: ['Paid', 'Preparing', 'Ready', 'Collected'] },
            seatReleased: false 
        }).sort({ createdAt: -1 });
        res.json(orders);
    } catch (err) { next(err); }
});

module.exports = router;