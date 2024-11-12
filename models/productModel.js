
const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  rating: { 
    type: Number, 
    required: true 
  },
  comment: { 
    type: String, 
    required: true 
  },
  createdAt: { 
    type: Date, 
    default: Date.now
   }
});

const productSchema = new mongoose.Schema({
  name: {
    type: String,
      required: true
     },
  is_listed: { 
    type: Boolean,
     default: true
     },
  description: {
    type: String,   
     required: true 
     },
  mainImage: { 
    type: String,
     required: true 
     },
  screenshots: { 
    type: [String],
     required: true
     },
  price: { 
    type: Number, 
    required: true 
     },
  quantity: { 
    type: Number, 
    required: true 
     },
  size: { 
    type: String, 
    required: true 
     },
  category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
  discount:{type: Number},
  reviews: [reviewSchema]
}, { timestamps: true });

module.exports = mongoose.model('Products', productSchema); 
