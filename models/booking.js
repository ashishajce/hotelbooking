const mongoose = require('mongoose');
const bookingSchema = new mongoose.Schema({
    userid: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'login',
        required: true
    },
    categoryid: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'category',
        required: true
    },
    noofrooms: {
        type: Number,
        required: true
    },
    checkindate: {
        type: Date,
        required: true
    },
    checkoutdate: {
        type: Date,
        required: true
    },
    totalamount: {
        type: Number,
        required: true
    },
    status: {
        type: Boolean,
        default: true
    }
})

const Booking = new mongoose.model('Booking', bookingSchema);
module.exports = Booking;