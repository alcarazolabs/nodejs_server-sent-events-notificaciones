const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
    status:{
        type: Number,
        default: 0,
        required: true
    },
    iduser:{
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        min: 1,
        max: 254
    }
});


module.exports = mongoose.model('Notification', notificationSchema, "Notification")