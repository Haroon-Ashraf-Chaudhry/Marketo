import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { productAPI } from '../../api/services';
import ProductCard from '../../components/product/ProductCard';

const CATEGORIES = [
  { name: 'Electronics', icon: '💻', value: 'electronics' },
  { name: 'Clothing', icon: '👕', value: 'clothing' },
  { name: 'Books', icon: '📚', value: 'books' },
  { name: 'Home', icon: '🏠', value: 'home' },
  { name: 'Sports', icon: '⚽', value: 'sports' },
  { name: 'Beauty', icon: '💄', value: 'beauty' },
  { name: 'Food', icon: '🍕', value: 'food' },
  { name: 'Toys', icon: '🧸', value: 'toys' },
];

export default function HomePage() {
  const navigate = useNavigate();

  const { data: featured } = useQuery({
    queryKey: ['featuredProducts'],
    queryFn: () => productAPI.getAll({ sort: 'popular', limit: 8 }).then(r => r.data),
  });

  const { data: newest } = useQuery({
    queryKey: ['newestProducts'],
    queryFn: () => productAPI.getAll({ sort: 'newest', limit: 4 }).then(r => r.data),
  });

  return (
    <div>
      {/* Hero */}
      <section style={styles.hero}>
        <div className="container" style={{ position: 'relative', zIndex: 1 }}>
          <h1 style={styles.heroTitle}>
            Your one-stop<br />
            <span style={{ color: '#a78bfa' }}>multi-vendor marketplace</span>
          </h1>
          <p style={styles.heroSub}>
            Discover thousands of products from verified vendors. Buy, sell, and connect.
          </p>
          <div style={{ display: 'flex', gap: 12 }}>
            <Link to="/products" className="btn btn-primary btn-lg">
              Browse Products
            </Link>
            <Link to="/register" className="btn btn-lg" style={{ background: 'rgba(255,255,255,0.15)', color: '#fff', border: '1px solid rgba(255,255,255,0.3)' }}>
              Become a Vendor →
            </Link>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section style={{ padding: '3rem 0', background: '#fff' }}>
        <div className="container">
          <h2 style={styles.sectionTitle}>Shop by Category</h2>
          <div style={styles.catGrid}>
            {CATEGORIES.map(cat => (
              <button
                key={cat.value}
                style={styles.catCard}
                onClick={() => navigate(`/products?category=${cat.value}`)}
              >
                <span style={styles.catIcon}>{cat.icon}</span>
                <span style={{ fontSize: 13, fontWeight: 500 }}>{cat.name}</span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Featured products */}
      <section style={{ padding: '3rem 0' }}>
        <div className="container">
          <div className="flex-between" style={{ marginBottom: '1.5rem' }}>
            <h2 style={styles.sectionTitle}>🔥 Most Popular</h2>
            <Link to="/products?sort=popular" style={{ color: '#6c47ff', fontSize: 14, fontWeight: 500 }}>View all →</Link>
          </div>
          {featured?.products?.length ? (
            <div className="grid-4">
              {featured.products.map(p => <ProductCard key={p._id} product={p} />)}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '3rem', color: '#9ca3af' }}>
              No products yet. <Link to="/register" style={{ color: '#6c47ff' }}>Be the first vendor!</Link>
            </div>
          )}
        </div>
      </section>

      {/* New arrivals */}
      {newest?.products?.length > 0 && (
        <section style={{ padding: '2rem 0 3rem', background: '#fff' }}>
          <div className="container">
            <div className="flex-between" style={{ marginBottom: '1.5rem' }}>
              <h2 style={styles.sectionTitle}>✨ New Arrivals</h2>
              <Link to="/products?sort=newest" style={{ color: '#6c47ff', fontSize: 14, fontWeight: 500 }}>View all →</Link>
            </div>
            <div className="grid-4">
              {newest.products.map(p => <ProductCard key={p._id} product={p} />)}
            </div>
          </div>
        </section>
      )}

      {/* CTA banner */}
      <section style={styles.ctaBanner}>
        <div className="container" style={{ textAlign: 'center' }}>
          <h2 style={{ fontSize: 28, fontWeight: 700, marginBottom: 12, color: '#fff' }}>
            Ready to start selling?
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.8)', marginBottom: '1.5rem' }}>
            Join thousands of vendors and reach millions of buyers.
          </p>
          <Link to="/register" className="btn btn-lg" style={{ background: '#fff', color: '#6c47ff', fontWeight: 600 }}>
            Open Your Store →
          </Link>
        </div>
      </section>
    </div>
  );
}

const styles = {
  hero: {
    background: 'linear-gradient(135deg, #6c47ff 0%, #3b1fa8 100%)',
    padding: '5rem 0',
    position: 'relative',
    overflow: 'hidden',
  },
  heroTitle: { fontSize: 46, fontWeight: 800, color: '#fff', lineHeight: 1.2, marginBottom: '1rem' },
  heroSub: { color: 'rgba(255,255,255,0.8)', fontSize: 18, marginBottom: '2rem', maxWidth: 500 },
  sectionTitle: { fontSize: 22, fontWeight: 700 },
  catGrid: { display: 'grid', gridTemplateColumns: 'repeat(8, 1fr)', gap: '0.75rem' },
  catCard: {
    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8,
    padding: '1.1rem 0.5rem', background: '#f9fafb', border: '1px solid #e5e7eb',
    borderRadius: 12, cursor: 'pointer', transition: 'all 0.15s',
  },
  catIcon: { fontSize: 28 },
  ctaBanner: {
    background: 'linear-gradient(135deg, #1a1a2e 0%, #6c47ff 100%)',
    padding: '4rem 0',
  },
};
