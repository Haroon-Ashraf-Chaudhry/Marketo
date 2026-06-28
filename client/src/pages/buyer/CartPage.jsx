import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useCartStore from '../../store/cartStore';
import useAuthStore from '../../store/authStore';

export default function CartPage() {
  const { items, removeItem, updateQuantity, clearCart } = useCartStore();
  const { user } = useAuthStore();
  const navigate = useNavigate();

  const total = items.reduce((sum, i) => sum + i.product.price * i.quantity, 0);

  if (items.length === 0) {
    return (
      <div className="page">
        <div className="container" style={{ textAlign: 'center', paddingTop: '4rem' }}>
          <p style={{ fontSize: 48 }}>🛒</p>
          <h2 style={{ marginBottom: '1rem' }}>Your cart is empty</h2>
          <Link to="/products" className="btn btn-primary">Browse Products</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      <div className="container">
        <h1 style={{ marginBottom: '1.5rem' }}>Shopping Cart ({items.length} items)</h1>
        <div style={styles.layout}>
          <div>
            {items.map(({ product, quantity }) => (
              <div key={product._id} className="card" style={styles.item}>
                <img
                  src={product.images?.[0] ? `http://localhost:5000${product.images[0]}` : 'https://placehold.co/80x80'}
                  alt={product.name}
                  style={styles.img}
                />
                <div style={{ flex: 1 }}>
                  <Link to={`/products/${product._id}`} style={{ fontWeight: 600, fontSize: 15 }}>{product.name}</Link>
                  <p style={{ fontSize: 13, color: '#6b7280', marginTop: 2 }}>{product.vendor?.name}</p>
                  <p style={{ color: '#6c47ff', fontWeight: 700, marginTop: 4 }}>${product.price.toFixed(2)} each</p>
                </div>
                <div style={styles.qtyCtrl}>
                  <button onClick={() => updateQuantity(product._id, quantity - 1)} style={styles.qBtn}>−</button>
                  <span style={{ padding: '0 10px', fontWeight: 600 }}>{quantity}</span>
                  <button onClick={() => updateQuantity(product._id, Math.min(product.stock, quantity + 1))} style={styles.qBtn}>+</button>
                </div>
                <div style={{ textAlign: 'right', minWidth: 80 }}>
                  <p style={{ fontWeight: 700 }}>${(product.price * quantity).toFixed(2)}</p>
                  <button onClick={() => removeItem(product._id)} style={styles.removeBtn}>Remove</button>
                </div>
              </div>
            ))}
            <button className="btn btn-secondary btn-sm" onClick={clearCart}>Clear cart</button>
          </div>

          <div className="card" style={styles.summary}>
            <h3 style={{ marginBottom: '1.25rem' }}>Order Summary</h3>
            {items.map(({ product, quantity }) => (
              <div key={product._id} style={styles.summaryLine}>
                <span className="truncate" style={{ maxWidth: 160 }}>{product.name} × {quantity}</span>
                <span>${(product.price * quantity).toFixed(2)}</span>
              </div>
            ))}
            <hr style={{ margin: '12px 0', border: 'none', borderTop: '1px solid #e5e7eb' }} />
            <div style={{ ...styles.summaryLine, fontWeight: 700, fontSize: 17 }}>
              <span>Total</span>
              <span style={{ color: '#6c47ff' }}>${total.toFixed(2)}</span>
            </div>
            <button
              className="btn btn-primary btn-full btn-lg"
              style={{ marginTop: '1.25rem' }}
              onClick={() => user ? navigate('/checkout') : navigate('/login')}
            >
              {user ? 'Proceed to Checkout' : 'Sign in to Checkout'}
            </button>
            <Link to="/products" style={{ display: 'block', textAlign: 'center', fontSize: 13, color: '#6b7280', marginTop: 10 }}>
              ← Continue shopping
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  layout: { display: 'grid', gridTemplateColumns: '1fr 340px', gap: '2rem', alignItems: 'start' },
  item: { display: 'flex', gap: '1rem', alignItems: 'center', padding: '1rem', marginBottom: '0.75rem' },
  img: { width: 80, height: 80, objectFit: 'cover', borderRadius: 8 },
  qtyCtrl: { display: 'flex', alignItems: 'center', border: '1px solid #e5e7eb', borderRadius: 8 },
  qBtn: { width: 32, height: 32, background: 'none', border: 'none', fontSize: 16, cursor: 'pointer' },
  removeBtn: { fontSize: 12, color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer', marginTop: 4 },
  summary: { padding: '1.25rem', position: 'sticky', top: 80 },
  summaryLine: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 14, marginBottom: 8 },
};
