const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const Order = require('../models/Order');

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
        }).sort({ createdAt: 1 });
        res.json(orders);
    } catch (err) {
        next(err);
    }
});

router.patch('/:id/collect', async (req, res, next) => {
    try {
        const order = await Order.findById(req.params.id);
        if (!order) return res.status(404).json({ message: "Order not found" });
        order.status = 'Collected';
        await order.save();
        res.json({ message: "Handover successful" });
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
                order.tokenID = Math.floor(1000 + Math.random() * 9000).toString();
                await order.save();
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
        if (!order) return res.status(404).json({ message: "Order not found" });
        order.status = 'Paid';
        order.tokenID = Math.floor(1000 + Math.random() * 9000).toString();
        order.paymentId = "SIM-" + Math.random().toString(36).substr(2, 9).toUpperCase();
        await order.save();
        res.json({ message: "Simulation Success", order });
    } catch (err) {
        next(err);
    }
});

module.exports = router;