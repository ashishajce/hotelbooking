const mongoose = require('mongoose');
const categoryschema = new mongoose.Schema({
    categoryname: {
        type: String,
    },
    isavailable: {
        type: Number,
    },
    totalrooms: {
        type: Number,
    },
    status: {
        type: Boolean,
        default: true
    },
    price: {
        type: Number,
    }
});


module.exports = mongoose.model('category', categoryschema);