const mongoose = require('mongoose');
const roomSchema = new mongoose.Schema({
    category:
    {
        type: mongoose.Schema.Types.ObjectId
    },
    nofrooms:
    {
        type: Number,
    },
    noofavailablerooms: {
        type: Number,
    }
});
const room = mongoose.model('room', roomSchema);
module.exports = room;
