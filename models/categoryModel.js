const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true, // Ensure uniqueness at the schema level
    },
    is_listed: {
        type: Boolean,
        default: true,
    },
    categoryImage: {
        type: String,
        required: true,
    }
}, { timestamps: true });

 

module.exports = mongoose.model("Category", categorySchema);
11111111111111111111111111111111111111111111111111111