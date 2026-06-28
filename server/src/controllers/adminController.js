const User = require('../models/User');
const Product = require('../models/Product');
const Order = require('../models/Order');

exports.getDashboard = async (req, res, next) => {
  try {
    const [totalUsers, totalVendors, totalProducts, totalOrders, revenueAgg] = await Promise.all([
      User.countDocuments({ role: 'buyer' }),
      User.countDocuments({ role: 'vendor' }),
      Product.countDocuments({ isActive: true }),
      Order.countDocuments(),
      Order.aggregate([
        { $match: { paymentStatus: 'paid' } },
        { $group: { _id: null, total: { $sum: '$platformFee' } } },
      ]),
    ]);

    const revenue = revenueAgg[0]?.total || 0;

    // Recent orders
    const recentOrders = await Order.find()
      .populate('buyer', 'name email')
      .sort({ createdAt: -1 })
      .limit(10);

    res.json({ totalUsers, totalVendors, totalProducts, totalOrders, revenue, recentOrders });
  } catch (err) { next(err); }
};

exports.getUsers = async (req, res, next) => {
  try {
    const { role, page = 1, limit = 20 } = req.query;
    const query = role ? { role } : {};
    const users = await User.find(query).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(Number(limit));
    const total = await User.countDocuments(query);
    res.json({ users, total });
  } catch (err) { next(err); }
};

exports.toggleUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    user.isActive = !user.isActive;
    await user.save();
    res.json({ message: `User ${user.isActive ? 'activated' : 'deactivated'}`, user });
  } catch (err) { next(err); }
};

exports.getAllOrders = async (req, res, next) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const query = status ? { status } : {};
    const orders = await Order.find(query)
      .populate('buyer', 'name email')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));
    const total = await Order.countDocuments(query);
    res.json({ orders, total });
  } catch (err) { next(err); }
};

exports.resolveDispute = async (req, res, next) => {
  try {
    const { resolution, status } = req.body; // 'refunded' or 'delivered'
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: 'Order not found' });

    order.status = status || 'delivered';
    order.disputeReason = `RESOLVED: ${resolution}`;
    await order.save();
    res.json({ message: 'Dispute resolved', order });
  } catch (err) { next(err); }
};

exports.getVendorStats = async (req, res, next) => {
  try {
    const stats = await Order.aggregate([
      { $unwind: '$items' },
      { $match: { paymentStatus: 'paid' } },
      {
        $group: {
          _id: '$items.vendor',
          totalSales: { $sum: { $multiply: ['$items.price', '$items.quantity'] } },
          totalOrders: { $sum: 1 },
        },
      },
      { $sort: { totalSales: -1 } },
      { $limit: 10 },
      {
        $lookup: {
          from: 'users', localField: '_id', foreignField: '_id',
          as: 'vendor', pipeline: [{ $project: { name: 1, email: 1, avatar: 1 } }],
        },
      },
      { $unwind: '$vendor' },
    ]);
    res.json(stats);
  } catch (err) { next(err); }
};
