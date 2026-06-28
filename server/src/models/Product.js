const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  comment: { type: String, required: true },
}, { timestamps: true });

const productSchema = new mongoose.Schema({
  vendor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true, trim: true },
  description: { type: String, required: true },
  price: { type: Number, required: true, min: 0 },
  category: {
    type: String,
    required: true,
    enum: ['electronics', 'clothing', 'food', 'books', 'home', 'sports', 'beauty', 'toys', 'other'],
  },
  images: [{ type: String }],
  stock: { type: Number, required: true, default: 0, min: 0 },
  isActive: { type: Boolean, default: true },
  tags: [String],
  reviews: [reviewSchema],
  averageRating: { type: Number, default: 0 },
  totalReviews: { type: Number, default: 0 },
  totalSold: { type: Number, default: 0 },
}, { timestamps: true });

// Full-text search index
productSchema.index({ name: 'text', description: 'text', tags: 'text' });
productSchema.index({ vendor: 1, category: 1, isActive: 1 });

productSchema.methods.updateRating = function () {
  if (this.reviews.length === 0) {
    this.averageRating = 0;
    this.totalReviews = 0;
  } else {
    const sum = this.reviews.reduce((acc, r) => acc + r.rating, 0);
    this.averageRating = Math.round((sum / this.reviews.length) * 10) / 10;
    this.totalReviews = this.reviews.length;
  }
};

module.exports = mongoose.model('Product', productSchema);
