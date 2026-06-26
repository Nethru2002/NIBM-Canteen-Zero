const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const router = express.Router();

router.post('/register', async (req, res) => {
    const { name, email, password, role } = req.body;
    if (!email.toLowerCase().endsWith('@nibm.lk')) {
        return res.status(400).json({ message: "Only @nibm.lk emails are permitted." });
    }
    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({ 
            name, 
            email, 
            password: hashedPassword, 
            role: role || 'student' 
        });
        await newUser.save();
        res.status(201).json({ message: "Account created successfully" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user) return res.status(404).json({ message: "Account not found" });
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });
        const token = jwt.sign(
            { id: user._id, role: user.role }, 
            process.env.JWT_SECRET, 
            { expiresIn: '1h' }
        );
        res.json({ 
            token, 
            user: { id: user._id, name: user.name, email: user.email, role: user.role, phone: user.phone || "" } 
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.put('/profile/:id', async (req, res) => {
    try {
        const { phone } = req.body;
        const user = await User.findByIdAndUpdate(req.params.id, { phone }, { new: true });
        res.json({ message: "Profile updated", user: { name: user.name, phone: user.phone } });
    } catch (err) {
        res.status(500).json({ message: "Update failed" });
    }
});

router.put('/change-password/:id', async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        const user = await User.findById(req.params.id);
        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) return res.status(400).json({ message: "Current password incorrect" });
        user.password = await bcrypt.hash(newPassword, 10);
        await user.save();
        res.json({ message: "Password updated successfully" });
    } catch (err) {
        res.status(500).json({ message: "Password update failed" });
    }
});

module.exports = router;