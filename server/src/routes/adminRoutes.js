const router = require('express').Router();
const { getDashboard, getUsers, toggleUser, getAllOrders, resolveDispute, getVendorStats } = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect, authorize('admin'));

router.get('/dashboard', getDashboard);
router.get('/users', getUsers);
router.patch('/users/:id/toggle', toggleUser);
router.get('/orders', getAllOrders);
router.patch('/orders/:id/dispute', resolveDispute);
router.get('/vendor-stats', getVendorStats);

module.exports = router;
