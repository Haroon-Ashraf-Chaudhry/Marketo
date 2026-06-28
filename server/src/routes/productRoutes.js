const router = require('express').Router();
const {
  getProducts, getProduct, createProduct, updateProduct,
  deleteProduct, addReview, getMyProducts,
} = require('../controllers/productController');
const { protect, authorize } = require('../middleware/auth');
const upload = require('../middleware/upload');

router.get('/', getProducts);
router.get('/vendor/me', protect, authorize('vendor'), getMyProducts);
router.get('/:id', getProduct);
router.post('/', protect, authorize('vendor', 'admin'), upload.array('images', 5), createProduct);
router.put('/:id', protect, authorize('vendor', 'admin'), upload.array('images', 5), updateProduct);
router.delete('/:id', protect, authorize('vendor', 'admin'), deleteProduct);
router.post('/:id/reviews', protect, authorize('buyer'), addReview);

module.exports = router;
