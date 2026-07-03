const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const Order = require('../models/Order');

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
        if (!order) return res.status(404).json({ message: "Order records missing" });
        res.json({ status: order.status, tokenID: order.tokenID });
    } catch (err) {
        next(err);
    }
});

router.get('/user/:userId', async (req, res, next) => {
    try {
        const orders = await Order.find({ 
            user: req.params.userId,
            status: { $in: ['Paid', 'Preparing', 'Ready'] } 
        }).sort({ createdAt: -1 });
        res.json(orders);
    } catch (err) {
        next(err);
    }
});

router.get('/admin/active', async (req, res, next) => {
    try {
        const orders = await Order.find({
            status: { $in: ['Paid', 'Preparing', 'Ready'] }
        }).sort({ updatedAt: 1 });
        res.json(orders);
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
        if (!order) return res.status(404).json({ message: "Order not found" });

        const io = req.app.get('socketio');
        io.emit('orderUpdate', { 
            userId: order.user, 
            orderId: order._id, 
            status: order.status,
            tokenID: order.tokenID 
        });

        res.json(order);
    } catch (err) {
        next(err);
    }
});

router.patch('/:id/collect', async (req, res, next) => {
    try {
        const order = await Order.findById(req.params.id);
        if (!order) return res.status(404).json({ message: "Order not found" });
        
        order.status = 'Collected';
        order.collectedAt = new Date();
        await order.save();

        const io = req.app.get('socketio');
        io.emit('orderUpdate', { 
            userId: order.user, 
            orderId: order._id, 
            status: 'Collected' 
        });

        res.json({ message: "Handover verified" });
    } catch (err) {
        next(err);
    }
});

router.post('/payhere-notify', async (req, res, next) => {
    try {
        const { merchant_id, order_id, payhere_amount, payhere_currency, status_code, md5sig } = req.body;
        const secret = process.env.PAYHERE_SECRET;
        const hashedSecret = crypto.createHash('md5').update(secret).digest('hex').toUpperCase();
        const localHash = crypto.createHash('md5')
            .update(merchant_id + order_id + payhere_amount + payhere_currency + status_code + hashedSecret)
            .digest('hex')
            .toUpperCase();

        if (localHash === md5sig && status_code === "2") {
            const order = await Order.findById(order_id);
            if (order) {
                order.status = 'Paid';
                order.paidAt = new Date();
                order.tokenID = await generateUniqueToken();
                await order.save();
                const io = req.app.get('socketio');
                io.emit('newOrderAlert', order);
                io.emit('orderUpdate', { userId: order.user, orderId: order._id, status: 'Paid' });
            }
        }
        res.status(200).send();
    } catch (err) {
        next(err);
    }
});

router.patch('/:id/pay-simulate', async (req, res, next) => {
    try {
        const order = await Order.findById(req.params.id);
        if (!order) return res.status(404).json({ message: "Order records not found" });
        order.status = 'Paid';
        order.paidAt = new Date();
        order.tokenID = await generateUniqueToken();
        order.paymentId = "SIM-" + crypto.randomBytes(4).toString('hex').toUpperCase();
        await order.save();

        const io = req.app.get('socketio');
        io.emit('newOrderAlert', order);
        io.emit('orderUpdate', { userId: order.user, orderId: order._id, status: 'Paid' });

        res.json({ message: "Simulation Verified", order });
    } catch (err) {
        next(err);
    }
});

module.exports = router;