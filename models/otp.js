const mongoose = require('mongoose');

const otpSchema = new mongoose.Schema({
    loginid: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    email: { type: String, required: true },
    otp: { type: String, required: true },
    expireat: { type: Date, required: true }
});

module.exports = mongoose.model('Otp', otpSchema);