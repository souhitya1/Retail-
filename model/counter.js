const mongoose = require("mongoose");

const counterSchema = new mongoose.Schema({

    name: {
        type: String,
        required: true
    },

    capacity: {
        type: Number,
        required: true,
        min: 1
    },

    x1: {
        type: Number,
        required: true
    },

    y1: {
        type: Number,
        required: true
    },

    x2: {
        type: Number,
        required: true
    },

    y2: {
        type: Number,
        required: true
    },

    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    }

});

module.exports = mongoose.model("Counter", counterSchema);