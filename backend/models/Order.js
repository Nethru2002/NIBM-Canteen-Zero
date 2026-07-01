const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    items: [{
        product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
        name: String,
        quantity: Number,
        price: Number
    }],
    totalAmount: { type: Number, required: true },
    status: { type: String, enum: ['Pending', 'Paid', 'Preparing', 'Ready', 'Collected'], default: 'Pending' },
    paymentId: { type: String },
    tokenID: { type: String },
    paidAt: { type: Date },
    preparingAt: { type: Date },
    readyAt: { type: Date },
    collectedAt: { type: Date }
}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);