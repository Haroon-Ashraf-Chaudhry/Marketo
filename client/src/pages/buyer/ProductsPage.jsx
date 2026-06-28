import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useSearchParams } from 'react-router-dom';
import { productAPI } from '../../api/services';
import ProductCard from '../../components/product/ProductCard';

const CATEGORIES = ['all', 'electronics', 'clothing', 'food', 'books', 'home', 'sports', 'beauty', 'toys', 'other'];
const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest' },
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
  { value: 'rating', label: 'Best Rated' },
  { value: 'popular', label: 'Most Popular' },
];

export default function ProductsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [filters, setFilters] = useState({
    search: searchParams.get('search') || '',
    category: searchParams.get('category') || '',
    minPrice: '',
    maxPrice: '',
    sort: 'newest',
    page: 1,
  });

  const { data, isLoading } = useQuery({
    queryKey: ['products', filters],
    queryFn: () => productAPI.getAll(filters).then(r => r.data),
  });

  const update = (key, value) => setFilters(f => ({ ...f, [key]: value, page: 1 }));

  return (
    <div className="page">
      <div className="container">
        <div style={styles.layout}>
          {/* Sidebar filters */}
          <aside style={styles.sidebar}>
            <h3 style={styles.sidebarTitle}>Filters</h3>

            <div className="form-group">
              <label>Search</label>
              <input
                className="form-control"
                value={filters.search}
                onChange={e => update('search', e.target.value)}
                placeholder="Search products..."
              />
            </div>

            <div className="form-group">
              <label>Category</label>
              {CATEGORIES.map(cat => (
                <label key={cat} style={styles.radioLabel}>
                  <input
                    type="radio"
                    name="category"
                    value={cat}
                    checked={filters.category === (cat === 'all' ? '' : cat)}
                    onChange={() => update('category', cat === 'all' ? '' : cat)}
                  />
                  <span style={{ textTransform: 'capitalize' }}>{cat}</span>
                </label>
              ))}
            </div>

            <div className="form-group">
              <label>Price Range</label>
              <div style={{ display: 'flex', gap: 8 }}>
                <input className="form-control" type="number" placeholder="Min" value={filters.minPrice} onChange={e => update('minPrice', e.target.value)} />
                <input className="form-control" type="number" placeholder="Max" value={filters.maxPrice} onChange={e => update('maxPrice', e.target.value)} />
              </div>
            </div>

            <button className="btn btn-secondary btn-full btn-sm" onClick={() => setFilters({ search: '', category: '', minPrice: '', maxPrice: '', sort: 'newest', page: 1 })}>
              Clear filters
            </button>
          </aside>

          {/* Products grid */}
          <main style={styles.main}>
            <div style={styles.topBar}>
              <span style={{ color: '#6b7280', fontSize: 14 }}>
                {data?.total || 0} products found
              </span>
              <select
                className="form-control"
                style={{ width: 180 }}
                value={filters.sort}
                onChange={e => update('sort', e.target.value)}
              >
                {SORT_OPTIONS.map(o => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>

            {isLoading ? (
              <div className="spinner-center"><div className="spinner" /></div>
            ) : data?.products?.length ? (
              <>
                <div className="grid-4">
                  {data.products.map(p => <ProductCard key={p._id} product={p} />)}
                </div>
                {data.pages > 1 && (
                  <div style={styles.pagination}>
                    {Array.from({ length: data.pages }, (_, i) => (
                      <button
                        key={i}
                        className={`btn btn-sm ${filters.page === i + 1 ? 'btn-primary' : 'btn-secondary'}`}
                        onClick={() => setFilters(f => ({ ...f, page: i + 1 }))}
                      >
                        {i + 1}
                      </button>
                    ))}
                  </div>
                )}
              </>
            ) : (
              <div style={styles.empty}>
                <p style={{ fontSize: 40 }}>🔍</p>
                <p>No products found. Try different filters.</p>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}

const styles = {
  layout: { display: 'grid', gridTemplateColumns: '220px 1fr', gap: '2rem', alignItems: 'start' },
  sidebar: { background: '#fff', border: '1px solid #e5e7eb', borderRadius: 10, padding: '1.25rem', position: 'sticky', top: 80 },
  sidebarTitle: { fontWeight: 600, marginBottom: '1rem', fontSize: 15 },
  radioLabel: { display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, marginBottom: 6, cursor: 'pointer', textTransform: 'capitalize' },
  main: {},
  topBar: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' },
  pagination: { display: 'flex', gap: 8, justifyContent: 'center', marginTop: '2rem' },
  empty: { textAlign: 'center', padding: '4rem', color: '#6b7280' },
};
