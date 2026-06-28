const Product = require('../models/Product');

// GET /api/products  — public, supports search, filter, sort, pagination
exports.getProducts = async (req, res, next) => {
  try {
    const { search, category, minPrice, maxPrice, sort, page = 1, limit = 12 } = req.query;
    const query = { isActive: true };

    if (search) query.$text = { $search: search };
    if (category) query.category = category;
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    const sortOptions = {
      newest: { createdAt: -1 },
      oldest: { createdAt: 1 },
      price_asc: { price: 1 },
      price_desc: { price: -1 },
      rating: { averageRating: -1 },
      popular: { totalSold: -1 },
    };

    const sortBy = sortOptions[sort] || sortOptions.newest;
    const skip = (Number(page) - 1) * Number(limit);

    const [products, total] = await Promise.all([
      Product.find(query).populate('vendor', 'name avatar').sort(sortBy).skip(skip).limit(Number(limit)),
      Product.countDocuments(query),
    ]);

    res.json({ products, total, page: Number(page), pages: Math.ceil(total / Number(limit)) });
  } catch (err) { next(err); }
};

// GET /api/products/:id
exports.getProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate('vendor', 'name avatar email createdAt')
      .populate('reviews.user', 'name avatar');
    if (!product || !product.isActive) return res.status(404).json({ message: 'Product not found' });
    res.json(product);
  } catch (err) { next(err); }
};

// POST /api/products  — vendor only
exports.createProduct = async (req, res, next) => {
  try {
    const { name, description, price, category, stock, tags } = req.body;
    const images = req.files ? req.files.map(f => `/uploads/${f.filename}`) : [];

    const product = await Product.create({
      vendor: req.user._id, name, description,
      price: Number(price), category, stock: Number(stock),
      tags: tags ? tags.split(',').map(t => t.trim()) : [],
      images,
    });
    res.status(201).json(product);
  } catch (err) { next(err); }
};

// PUT /api/products/:id  — vendor only (own product)
exports.updateProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });
    if (product.vendor.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const updates = { ...req.body };
    if (req.files?.length) updates.images = req.files.map(f => `/uploads/${f.filename}`);
    if (updates.tags && typeof updates.tags === 'string') {
      updates.tags = updates.tags.split(',').map(t => t.trim());
    }

    const updated = await Product.findByIdAndUpdate(req.params.id, updates, { new: true, runValidators: true });
    res.json(updated);
  } catch (err) { next(err); }
};

// DELETE /api/products/:id  — vendor or admin
exports.deleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });
    if (product.vendor.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }
    product.isActive = false;
    await product.save();
    res.json({ message: 'Product removed' });
  } catch (err) { next(err); }
};

// POST /api/products/:id/reviews
exports.addReview = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });

    const alreadyReviewed = product.reviews.find(r => r.user.toString() === req.user._id.toString());
    if (alreadyReviewed) return res.status(400).json({ message: 'Already reviewed this product' });

    product.reviews.push({ user: req.user._id, rating: req.body.rating, comment: req.body.comment });
    product.updateRating();
    await product.save();
    res.status(201).json({ message: 'Review added' });
  } catch (err) { next(err); }
};

// GET /api/products/vendor/me  — vendor's own products
exports.getMyProducts = async (req, res, next) => {
  try {
    const products = await Product.find({ vendor: req.user._id }).sort({ createdAt: -1 });
    res.json(products);
  } catch (err) { next(err); }
};
