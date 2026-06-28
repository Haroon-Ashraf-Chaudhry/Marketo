import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { productAPI } from '../../api/services';
import toast from 'react-hot-toast';

export default function VendorProductsPage() {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: '', description: '', price: '', category: 'electronics', stock: '', tags: '' });
  const [images, setImages] = useState([]);

  const { data: products, isLoading } = useQuery({
    queryKey: ['vendorProducts'],
    queryFn: () => productAPI.getMyProducts().then(r => r.data),
  });

  const saveMutation = useMutation({
    mutationFn: (formData) => editing
      ? productAPI.update(editing._id, formData)
      : productAPI.create(formData),
    onSuccess: () => {
      queryClient.invalidateQueries(['vendorProducts']);
      toast.success(editing ? 'Product updated!' : 'Product created!');
      resetForm();
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed'),
  });

  const deleteMutation = useMutation({
    mutationFn: productAPI.delete,
    onSuccess: () => { queryClient.invalidateQueries(['vendorProducts']); toast.success('Product removed'); },
  });

  const resetForm = () => { setForm({ name: '', description: '', price: '', category: 'electronics', stock: '', tags: '' }); setEditing(null); setShowForm(false); setImages([]); };

  const handleSubmit = (e) => {
    e.preventDefault();
    const fd = new FormData();
    Object.entries(form).forEach(([k, v]) => fd.append(k, v));
    images.forEach(img => fd.append('images', img));
    saveMutation.mutate(fd);
  };

  const startEdit = (p) => {
    setEditing(p);
    setForm({ name: p.name, description: p.description, price: p.price, category: p.category, stock: p.stock, tags: p.tags?.join(', ') || '' });
    setShowForm(true);
  };

  return (
    <div className="page">
      <div className="container">
        <div className="flex-between" style={{ marginBottom: '1.5rem' }}>
          <h1>My Products</h1>
          <button className="btn btn-primary" onClick={() => { resetForm(); setShowForm(true); }}>
            + Add Product
          </button>
        </div>

        {showForm && (
          <div className="card" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
            <h3 style={{ marginBottom: '1rem' }}>{editing ? 'Edit Product' : 'New Product'}</h3>
            <form onSubmit={handleSubmit}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label>Product Name</label>
                  <input className="form-control" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required />
                </div>
                <div className="form-group">
                  <label>Category</label>
                  <select className="form-control" value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}>
                    {['electronics', 'clothing', 'food', 'books', 'home', 'sports', 'beauty', 'toys', 'other'].map(c => (
                      <option key={c} value={c} style={{ textTransform: 'capitalize' }}>{c}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Price ($)</label>
                  <input className="form-control" type="number" step="0.01" min="0" value={form.price} onChange={e => setForm(f => ({ ...f, price: e.target.value }))} required />
                </div>
                <div className="form-group">
                  <label>Stock</label>
                  <input className="form-control" type="number" min="0" value={form.stock} onChange={e => setForm(f => ({ ...f, stock: e.target.value }))} required />
                </div>
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea className="form-control" rows={3} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} required />
              </div>
              <div className="form-group">
                <label>Tags (comma separated)</label>
                <input className="form-control" value={form.tags} onChange={e => setForm(f => ({ ...f, tags: e.target.value }))} placeholder="e.g. wireless, bluetooth, portable" />
              </div>
              <div className="form-group">
                <label>Images (up to 5)</label>
                <input type="file" accept="image/*" multiple onChange={e => setImages([...e.target.files])} />
              </div>
              <div style={{ display: 'flex', gap: 10 }}>
                <button type="submit" className="btn btn-primary" disabled={saveMutation.isPending}>
                  {saveMutation.isPending ? 'Saving...' : editing ? 'Update' : 'Create'}
                </button>
                <button type="button" className="btn btn-secondary" onClick={resetForm}>Cancel</button>
              </div>
            </form>
          </div>
        )}

        {isLoading ? (
          <div className="spinner-center"><div className="spinner" /></div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={styles.table}>
              <thead>
                <tr>
                  {['Product', 'Category', 'Price', 'Stock', 'Sales', 'Rating', 'Actions'].map(h => (
                    <th key={h} style={styles.th}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {products?.map(p => (
                  <tr key={p._id} style={styles.tr}>
                    <td style={styles.td}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <img
                          src={p.images?.[0] ? `http://localhost:5000${p.images[0]}` : 'https://placehold.co/40x40'}
                          alt="" style={{ width: 40, height: 40, borderRadius: 6, objectFit: 'cover' }}
                        />
                        <div>
                          <div style={{ fontWeight: 500, fontSize: 14 }}>{p.name}</div>
                          <div style={{ fontSize: 12, color: '#9ca3af' }}>{p._id.slice(-8)}</div>
                        </div>
                      </div>
                    </td>
                    <td style={styles.td}><span className="badge badge-purple" style={{ textTransform: 'capitalize' }}>{p.category}</span></td>
                    <td style={styles.td}><strong>${p.price.toFixed(2)}</strong></td>
                    <td style={styles.td}>
                      <span style={{ color: p.stock < 5 ? '#ef4444' : '#22c55e', fontWeight: 500 }}>{p.stock}</span>
                    </td>
                    <td style={styles.td}>{p.totalSold}</td>
                    <td style={styles.td}>⭐ {p.averageRating || 0} ({p.totalReviews})</td>
                    <td style={styles.td}>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button className="btn btn-secondary btn-sm" onClick={() => startEdit(p)}>Edit</button>
                        <button className="btn btn-danger btn-sm" onClick={() => deleteMutation.mutate(p._id)}>Delete</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {!products?.length && <p style={{ textAlign: 'center', color: '#6b7280', padding: '2rem' }}>No products yet. Add your first one!</p>}
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  table: { width: '100%', borderCollapse: 'collapse', background: '#fff', borderRadius: 10, overflow: 'hidden', border: '1px solid #e5e7eb' },
  th: { padding: '12px 16px', background: '#f9fafb', fontSize: 12, fontWeight: 600, color: '#6b7280', textAlign: 'left', borderBottom: '1px solid #e5e7eb', textTransform: 'uppercase', letterSpacing: '0.05em' },
  tr: { borderBottom: '1px solid #f3f4f6' },
  td: { padding: '12px 16px', fontSize: 14, verticalAlign: 'middle' },
};
