const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const Order = require('../models/Order');
const Product = require('../models/Product');
const { sendOrderConfirmation, sendVendorNewOrder } = require('../utils/email');
const User = require('../models/User');

// POST /api/orders  — create order + Stripe PaymentIntent
exports.createOrder = async (req, res, next) => {
  try {
    const { items, shippingAddress, notes } = req.body;

    // Validate products & calculate total
    let totalAmount = 0;
    const enrichedItems = [];

    for (const item of items) {
      const product = await Product.findById(item.product);
      if (!product || !product.isActive) {
        return res.status(400).json({ message: `Product ${item.product} not available` });
      }
      if (product.stock < item.quantity) {
        return res.status(400).json({ message: `Insufficient stock for ${product.name}` });
      }
      enrichedItems.push({
        product: product._id,
        vendor: product.vendor,
        name: product.name,
        price: product.price,
        quantity: item.quantity,
        image: product.images[0] || '',
      });
      totalAmount += product.price * item.quantity;
    }

    const platformFee = Math.round(totalAmount * 0.1 * 100) / 100;

    // Create Stripe PaymentIntent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(totalAmount * 100), // in cents
      currency: 'usd',
      metadata: { buyerId: req.user._id.toString() },
    });

    const order = await Order.create({
      buyer: req.user._id,
      items: enrichedItems,
      totalAmount,
      platformFee,
      shippingAddress,
      notes,
      paymentIntentId: paymentIntent.id,
    });

    res.status(201).json({ order, clientSecret: paymentIntent.client_secret });
  } catch (err) { next(err); }
};

// POST /api/orders/webhook  — Stripe webhook
exports.stripeWebhook = async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    return res.status(400).send(`Webhook error: ${err.message}`);
  }

  if (event.type === 'payment_intent.succeeded') {
    const pi = event.data.object;
    const order = await Order.findOne({ paymentIntentId: pi.id }).populate('buyer');
    if (order) {
      order.paymentStatus = 'paid';
      order.status = 'processing';
      await order.save();

      // Decrease stock
      for (const item of order.items) {
        await Product.findByIdAndUpdate(item.product, {
          $inc: { stock: -item.quantity, totalSold: item.quantity },
        });
      }

      // Send emails
      await sendOrderConfirmation(order, order.buyer);

      // Group items by vendor and notify
      const vendorMap = {};
      for (const item of order.items) {
        const vid = item.vendor.toString();
        if (!vendorMap[vid]) vendorMap[vid] = [];
        vendorMap[vid].push(item);
      }
      for (const vendorId of Object.keys(vendorMap)) {
        const vendor = await User.findById(vendorId);
        if (vendor) await sendVendorNewOrder(order, vendor, vendorMap[vendorId]);
      }
    }
  }

  res.json({ received: true });
};

// GET /api/orders/my  — buyer's orders
exports.getMyOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({ buyer: req.user._id })
      .populate('items.product', 'name images')
      .populate('items.vendor', 'name')
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) { next(err); }
};

// GET /api/orders/vendor  — orders containing vendor's products
exports.getVendorOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({ 'items.vendor': req.user._id })
      .populate('buyer', 'name email')
      .populate('items.product', 'name images')
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) { next(err); }
};

// GET /api/orders/:id
exports.getOrder = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('buyer', 'name email')
      .populate('items.product', 'name images')
      .populate('items.vendor', 'name');

    if (!order) return res.status(404).json({ message: 'Order not found' });

    const isOwner = order.buyer._id.toString() === req.user._id.toString();
    const isVendor = order.items.some(i => i.vendor._id?.toString() === req.user._id.toString());
    const isAdmin = req.user.role === 'admin';

    if (!isOwner && !isVendor && !isAdmin) return res.status(403).json({ message: 'Not authorized' });
    res.json(order);
  } catch (err) { next(err); }
};

// PATCH /api/orders/:id/status  — vendor updates status
exports.updateOrderStatus = async (req, res, next) => {
  try {
    const { status, trackingNumber } = req.body;
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: 'Order not found' });

    const isVendor = order.items.some(i => i.vendor.toString() === req.user._id.toString());
    if (!isVendor && req.user.role !== 'admin') return res.status(403).json({ message: 'Not authorized' });

    order.status = status;
    if (trackingNumber) order.trackingNumber = trackingNumber;
    await order.save();
    res.json(order);
  } catch (err) { next(err); }
};

// POST /api/orders/:id/dispute  — buyer raises dispute
exports.raiseDispute = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: 'Order not found' });
    if (order.buyer.toString() !== req.user._id.toString()) return res.status(403).json({ message: 'Not authorized' });

    order.status = 'disputed';
    order.disputeReason = req.body.reason;
    await order.save();
    res.json({ message: 'Dispute raised', order });
  } catch (err) { next(err); }
};
