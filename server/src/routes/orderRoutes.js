const router = require('express').Router();
const {
  createOrder, stripeWebhook, getMyOrders,
  getVendorOrders, getOrder, updateOrderStatus, raiseDispute,
} = require('../controllers/orderController');
const { protect, authorize } = require('../middleware/auth');

// Stripe webhook needs raw body — handled in app.js before json middleware
router.post('/webhook', stripeWebhook);

router.use(protect);
router.post('/', authorize('buyer'), createOrder);
router.get('/my', authorize('buyer'), getMyOrders);
router.get('/vendor', authorize('vendor'), getVendorOrders);
router.get('/:id', getOrder);
router.patch('/:id/status', authorize('vendor', 'admin'), updateOrderStatus);
router.post('/:id/dispute', authorize('buyer'), raiseDispute);

module.exports = router;
