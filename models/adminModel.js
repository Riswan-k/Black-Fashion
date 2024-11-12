const mongoose = require('mongoose');

const adminSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true
  },
  password: {
    type: String,
    required: true
  },
  is_admin: {
    type: String,
    default: false
  }
});

module.exports = mongoose.model('Admin', adminSchema);
  