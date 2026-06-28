import React from 'react';
import { Link } from 'react-router-dom';
import useCartStore from '../../store/cartStore';
import toast from 'react-hot-toast';

export default function ProductCard({ product }) {
  const addItem = useCartStore(s => s.addItem);
  const imageUrl = product.images?.[0]
    ? `http://localhost:5000${product.images[0]}`
    : 'https://placehold.co/300x200?text=No+Image';

  const handleAddToCart = (e) => {
    e.preventDefault();
    if (product.stock === 0) return;
    addItem(product, 1);
    toast.success('Added to cart!');
  };

  const stars = Array.from({ length: 5 }, (_, i) => ({
    filled: i < Math.round(product.averageRating || 0),
  }));

  return (
    <Link to={`/products/${product._id}`} style={styles.card}>
      <div style={styles.imageWrap}>
        <img src={imageUrl} alt={product.name} style={styles.image} />
        {product.stock === 0 && <div style={styles.soldOut}>Sold Out</div>}
        <div style={styles.category}>{product.category}</div>
      </div>
      <div style={styles.body}>
        <p style={styles.vendor}>{product.vendor?.name || 'Vendor'}</p>
        <h3 style={styles.name}>{product.name}</h3>
        <div style={styles.ratingRow}>
          <div className="stars">
            {stars.map((s, i) => (
              <span key={i} className={`star ${s.filled ? 'filled' : ''}`}>★</span>
            ))}
          </div>
          <span style={styles.reviewCount}>({product.totalReviews})</span>
        </div>
        <div style={styles.footer}>
          <span style={styles.price}>${product.price.toFixed(2)}</span>
          <button
            className="btn btn-primary btn-sm"
            onClick={handleAddToCart}
            disabled={product.stock === 0}
          >
            Add to cart
          </button>
        </div>
      </div>
    </Link>
  );
}

const styles = {
  card: { background: '#fff', borderRadius: 10, border: '1px solid #e5e7eb', overflow: 'hidden', display: 'block', transition: 'box-shadow 0.2s', textDecoration: 'none', color: 'inherit' },
  imageWrap: { position: 'relative', height: 200, overflow: 'hidden', background: '#f3f4f6' },
  image: { width: '100%', height: '100%', objectFit: 'cover' },
  soldOut: {
    position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.4)',
    color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontWeight: 600, fontSize: 15,
  },
  category: {
    position: 'absolute', top: 10, left: 10, background: 'rgba(108,71,255,0.85)',
    color: '#fff', fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 99,
    textTransform: 'capitalize',
  },
  body: { padding: '0.85rem' },
  vendor: { fontSize: 12, color: '#6b7280', marginBottom: 3 },
  name: { fontSize: 14, fontWeight: 600, marginBottom: 6, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' },
  ratingRow: { display: 'flex', alignItems: 'center', gap: 4, marginBottom: 10 },
  reviewCount: { fontSize: 12, color: '#9ca3af' },
  footer: { display: 'flex', alignItems: 'center', justifyContent: 'space-between' },
  price: { fontSize: 17, fontWeight: 700, color: '#6c47ff' },
};
