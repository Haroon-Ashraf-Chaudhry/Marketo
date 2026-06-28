import React from 'react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer style={styles.footer}>
      <div className="container">
        <div style={styles.grid}>
          <div>
            <h3 style={styles.brand}>🛍️ Marketo</h3>
            <p style={styles.tagline}>Your multi-vendor marketplace. Buy, sell, and connect.</p>
          </div>
          <div>
            <h4 style={styles.colTitle}>Shop</h4>
            <Link to="/products" style={styles.link}>All Products</Link>
            {['electronics', 'clothing', 'books', 'home'].map(c => (
              <Link key={c} to={`/products?category=${c}`} style={styles.link}>
                {c.charAt(0).toUpperCase() + c.slice(1)}
              </Link>
            ))}
          </div>
          <div>
            <h4 style={styles.colTitle}>Sell</h4>
            <Link to="/register" style={styles.link}>Become a Vendor</Link>
            <Link to="/vendor/products" style={styles.link}>My Products</Link>
            <Link to="/vendor/orders" style={styles.link}>My Orders</Link>
            <Link to="/vendor/analytics" style={styles.link}>Analytics</Link>
          </div>
          <div>
            <h4 style={styles.colTitle}>Account</h4>
            <Link to="/login" style={styles.link}>Sign In</Link>
            <Link to="/register" style={styles.link}>Sign Up</Link>
            <Link to="/profile" style={styles.link}>Profile</Link>
            <Link to="/orders" style={styles.link}>Orders</Link>
          </div>
        </div>
        <div style={styles.bottom}>
          <p style={{ color: '#6b7280', fontSize: 13 }}>
            © {new Date().getFullYear()} Marketo. Built with MERN Stack.
          </p>
          <div style={{ display: 'flex', gap: 16 }}>
            {['Privacy Policy', 'Terms of Service', 'Contact'].map(l => (
              <span key={l} style={{ color: '#6b7280', fontSize: 13, cursor: 'pointer' }}>{l}</span>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}

const styles = {
  footer: { background: '#1a1a2e', padding: '3rem 0 1.5rem', marginTop: '3rem' },
  grid: { display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: '2rem', marginBottom: '2rem' },
  brand: { color: '#fff', fontSize: 20, marginBottom: 8 },
  tagline: { color: '#6b7280', fontSize: 14, lineHeight: 1.6 },
  colTitle: { color: '#fff', fontSize: 14, fontWeight: 600, marginBottom: 12 },
  link: { display: 'block', color: '#6b7280', fontSize: 14, marginBottom: 8, textDecoration: 'none', textTransform: 'capitalize' },
  bottom: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '1.5rem', borderTop: '1px solid #2d2d44' },
};
