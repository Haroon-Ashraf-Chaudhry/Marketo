import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { productAPI } from '../../api/services';
import useCartStore from '../../store/cartStore';
import useAuthStore from '../../store/authStore';
import toast from 'react-hot-toast';

export default function ProductDetailPage() {
  const { id } = useParams();
  const { user } = useAuthStore();
  const addItem = useCartStore(s => s.addItem);
  const [qty, setQty] = useState(1);
  const [activeImg, setActiveImg] = useState(0);
  const [review, setReview] = useState({ rating: 5, comment: '' });
  const queryClient = useQueryClient();

  const { data: product, isLoading } = useQuery({
    queryKey: ['product', id],
    queryFn: () => productAPI.getOne(id).then(r => r.data),
  });

  const reviewMutation = useMutation({
    mutationFn: () => productAPI.addReview(id, review),
    onSuccess: () => {
      queryClient.invalidateQueries(['product', id]);
      toast.success('Review submitted!');
      setReview({ rating: 5, comment: '' });
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed'),
  });

  if (isLoading) return <div className="spinner-center"><div className="spinner" /></div>;
  if (!product) return <div className="page"><div className="container">Product not found.</div></div>;

  const images = product.images?.length
    ? product.images.map(i => `http://localhost:5000${i}`)
    : ['https://placehold.co/500x400?text=No+Image'];

  return (
    <div className="page">
      <div className="container">
        <Link to="/products" style={{ color: '#6c47ff', fontSize: 14, display: 'block', marginBottom: '1rem' }}>
          ← Back to products
        </Link>

        <div style={styles.grid}>
          {/* Images */}
          <div>
            <div style={styles.mainImg}>
              <img src={images[activeImg]} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
            {images.length > 1 && (
              <div style={styles.thumbRow}>
                {images.map((img, i) => (
                  <img key={i} src={img} alt="" style={{ ...styles.thumb, border: i === activeImg ? '2px solid #6c47ff' : '2px solid transparent' }} onClick={() => setActiveImg(i)} />
                ))}
              </div>
            )}
          </div>

          {/* Info */}
          <div>
            <span style={{ textTransform: 'capitalize', fontSize: 12, color: '#6c47ff', fontWeight: 600 }}>{product.category}</span>
            <h1 style={styles.title}>{product.name}</h1>

            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: '1rem' }}>
              <div className="stars">
                {[1,2,3,4,5].map(i => <span key={i} className={`star ${i <= Math.round(product.averageRating) ? 'filled' : ''}`}>★</span>)}
              </div>
              <span style={{ fontSize: 13, color: '#6b7280' }}>{product.averageRating} ({product.totalReviews} reviews)</span>
            </div>

            <p style={styles.price}>${product.price.toFixed(2)}</p>

            <p style={{ color: '#374151', lineHeight: 1.7, marginBottom: '1.5rem' }}>{product.description}</p>

            <div style={{ marginBottom: '1rem' }}>
              <span style={{ fontSize: 13, color: product.stock > 0 ? '#22c55e' : '#ef4444', fontWeight: 500 }}>
                {product.stock > 0 ? `✓ In stock (${product.stock} left)` : '✗ Out of stock'}
              </span>
            </div>

            {product.stock > 0 && (
              <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: '1.5rem' }}>
                <div style={styles.qtyControl}>
                  <button onClick={() => setQty(q => Math.max(1, q - 1))} style={styles.qtyBtn}>−</button>
                  <span style={styles.qtyNum}>{qty}</span>
                  <button onClick={() => setQty(q => Math.min(product.stock, q + 1))} style={styles.qtyBtn}>+</button>
                </div>
                <button className="btn btn-primary btn-lg" onClick={() => { addItem(product, qty); toast.success(`${qty} item(s) added!`); }}>
                  🛒 Add to Cart
                </button>
              </div>
            )}

            <div style={styles.vendorBox}>
              <span style={{ fontSize: 13, color: '#6b7280' }}>Sold by</span>
              <strong style={{ marginLeft: 6 }}>{product.vendor?.name}</strong>
            </div>

            {product.tags?.length > 0 && (
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: '1rem' }}>
                {product.tags.map(tag => <span key={tag} className="badge badge-gray">#{tag}</span>)}
              </div>
            )}
          </div>
        </div>

        {/* Reviews */}
        <div style={styles.reviewsSection}>
          <h2 style={{ marginBottom: '1.5rem' }}>Customer Reviews</h2>

          {user?.role === 'buyer' && (
            <div className="card" style={{ padding: '1.25rem', marginBottom: '1.5rem' }}>
              <h4 style={{ marginBottom: '1rem' }}>Write a Review</h4>
              <div style={{ display: 'flex', gap: 8, marginBottom: '0.75rem' }}>
                {[1,2,3,4,5].map(i => (
                  <span key={i} onClick={() => setReview(r => ({ ...r, rating: i }))}
                    style={{ fontSize: 26, cursor: 'pointer', color: i <= review.rating ? '#f59e0b' : '#d1d5db' }}>★</span>
                ))}
              </div>
              <textarea className="form-control" rows={3} value={review.comment}
                onChange={e => setReview(r => ({ ...r, comment: e.target.value }))}
                placeholder="Share your experience..." style={{ marginBottom: 10 }} />
              <button className="btn btn-primary btn-sm" onClick={() => reviewMutation.mutate()}
                disabled={!review.comment || reviewMutation.isPending}>
                Submit Review
              </button>
            </div>
          )}

          {product.reviews?.length === 0 ? (
            <p style={{ color: '#6b7280' }}>No reviews yet. Be the first!</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {product.reviews.map(r => (
                <div key={r._id} className="card" style={{ padding: '1rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                    <div style={styles.reviewAvatar}>{r.user?.name?.[0] || 'U'}</div>
                    <div>
                      <strong style={{ fontSize: 14 }}>{r.user?.name}</strong>
                      <div className="stars" style={{ marginTop: 2 }}>
                        {[1,2,3,4,5].map(i => <span key={i} className={`star ${i <= r.rating ? 'filled' : ''}`}>★</span>)}
                      </div>
                    </div>
                    <span style={{ marginLeft: 'auto', fontSize: 12, color: '#9ca3af' }}>
                      {new Date(r.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <p style={{ fontSize: 14, color: '#374151' }}>{r.comment}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const styles = {
  grid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '3rem', marginBottom: '3rem' },
  mainImg: { height: 400, background: '#f3f4f6', borderRadius: 12, overflow: 'hidden', marginBottom: 10 },
  thumbRow: { display: 'flex', gap: 8 },
  thumb: { width: 70, height: 70, objectFit: 'cover', borderRadius: 8, cursor: 'pointer' },
  title: { fontSize: 24, fontWeight: 700, margin: '4px 0 12px' },
  price: { fontSize: 30, fontWeight: 700, color: '#6c47ff', marginBottom: '1rem' },
  qtyControl: { display: 'flex', alignItems: 'center', border: '1px solid #e5e7eb', borderRadius: 8 },
  qtyBtn: { width: 36, height: 36, background: 'none', border: 'none', fontSize: 18, cursor: 'pointer', color: '#374151' },
  qtyNum: { padding: '0 12px', fontWeight: 600 },
  vendorBox: { background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: 8, padding: '10px 14px', fontSize: 14, display: 'inline-block' },
  reviewsSection: { marginTop: '2rem', borderTop: '1px solid #e5e7eb', paddingTop: '2rem' },
  reviewAvatar: { width: 36, height: 36, borderRadius: '50%', background: '#6c47ff', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600, flexShrink: 0 },
};
