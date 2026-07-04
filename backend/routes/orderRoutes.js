const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const Order = require('../models/Order');

const getActiveCount = async () => {
    return await Order.countDocuments({ status: { $in: ['Paid', 'Preparing', 'Ready'] } });
};

const emitUpdate = async (req, order) => {
    const io = req.app.get('socketio');
    const count = await getActiveCount();
    io.emit('orderCountUpdate', count);
    if (order) {
        io.emit('orderUpdate', { 
            userId: order.user, 
            orderId: order._id, 
            status: order.status,
            tokenID: order.tokenID 
        });
    }
};

router.get('/active-count', async (req, res, next) => {
    try {
        const count = await getActiveCount();
        res.json({ count });
    } catch (err) {
        next(err);
    }
});

router.post('/create', async (req, res, next) => {
    try {
        const { items, totalAmount, userId } = req.body;
        const newOrder = new Order({
            user: userId,
            items,
            totalAmount,
            status: 'Pending'
        });
        await newOrder.save();
        res.status(201).json(newOrder);
    } catch (err) {
        next(err);
    }
});

router.get('/:id/status', async (req, res, next) => {
    try {
        const order = await Order.findById(req.params.id);
        if (!order) return res.status(404).json({ message: "Order not found" });
        res.json({ status: order.status, tokenID: order.tokenID });
    } catch (err) {
        next(err);
    }
});

router.patch('/:id/status', async (req, res, next) => {
    try {
        const { status } = req.body;
        const updateFields = { status };
        if (status === 'Preparing') updateFields.preparingAt = new Date();
        if (status === 'Ready') updateFields.readyAt = new Date();
        const order = await Order.findByIdAndUpdate(req.params.id, updateFields, { new: true });
        await emitUpdate(req, order);
        res.json(order);
    } catch (err) {
        next(err);
    }
});

router.patch('/:id/collect', async (req, res, next) => {
    try {
        const order = await Order.findById(req.params.id);
        order.status = 'Collected';
        order.collectedAt = new Date();
        await order.save();
        await emitUpdate(req, order);
        res.json({ message: "Success" });
    } catch (err) {
        next(err);
    }
});

router.patch('/:id/pay-simulate', async (req, res, next) => {
    try {
        const order = await Order.findById(req.params.id);
        order.status = 'Paid';
        order.paidAt = new Date();
        order.tokenID = Math.floor(1000 + Math.random() * 9000).toString();
        order.paymentId = "SIM-" + crypto.randomBytes(4).toString('hex').toUpperCase();
        await order.save();
        const io = req.app.get('socketio');
        const count = await getActiveCount();
        io.emit('orderCountUpdate', count);
        io.emit('newOrderAlert', order);
        io.emit('orderUpdate', { userId: order.user, orderId: order._id, status: 'Paid' });
        res.json({ message: "Success", order });
    } catch (err) {
        next(err);
    }
});

router.get('/admin/active', async (req, res, next) => {
    try {
        const orders = await Order.find({ status: { $in: ['Paid', 'Preparing', 'Ready'] } }).sort({ updatedAt: 1 });
        res.json(orders);
    } catch (err) {
        next(err);
    }
});

router.get('/user/:userId', async (req, res, next) => {
    try {
        const orders = await Order.find({ user: req.params.userId, status: { $in: ['Paid', 'Preparing', 'Ready'] } }).sort({ createdAt: -1 });
        res.json(orders);
    } catch (err) {
        next(err);
    }
});

module.exports = router;