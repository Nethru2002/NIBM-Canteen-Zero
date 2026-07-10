const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    items: [{
        product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
        name: String,
        quantity: Number,
        price: Number,
        category: String
    }],
    totalAmount: { type: Number, required: true },
    orderType: { type: String, enum: ['Dine-In', 'Takeaway'], required: true },
    status: { type: String, enum: ['Pending', 'Paid', 'Preparing', 'Ready', 'Collected'], default: 'Pending' },
    paymentId: { type: String },
    tokenID: { type: String },
    seatReleased: { type: Boolean, default: false },
    isExtended: { type: Boolean, default: false },
    paidAt: { type: Date },
    preparingAt: { type: Date },
    readyAt: { type: Date },
    collectedAt: { type: Date }
}, {
    timestamps: true
});

module.exports = mongoose.model('Order', orderSchema);