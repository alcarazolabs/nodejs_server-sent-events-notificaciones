const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
    name:{
        type: String,
        require: true
    },
    date:{
        type: Date,
        default: Date.now
    },
    status:{
        type: Number,
        default: 0,
        required: true,
    },
    iduser:{
        //mongoose.Schema.Types.ObjectId
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        min: 1,
        max: 254
    }
});


module.exports = mongoose.model('Task', taskSchema, "Task")