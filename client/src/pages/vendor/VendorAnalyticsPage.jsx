import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { productAPI, orderAPI } from '../../api/services';

export default function VendorAnalyticsPage() {
  const { data: products } = useQuery({
    queryKey: ['vendorProducts'],
    queryFn: () => productAPI.getMyProducts().then(r => r.data),
  });

  const { data: orders } = useQuery({
    queryKey: ['vendorOrders'],
    queryFn: () => orderAPI.getVendorOrders().then(r => r.data),
  });

  const totalRevenue = orders?.filter(o => o.paymentStatus === 'paid')
    .reduce((s, o) => s + o.totalAmount * 0.9, 0) || 0;

  const totalOrders = orders?.length || 0;
  const pendingOrders = orders?.filter(o => ['processing', 'paid'].includes(o.status)).length || 0;
  const totalStock = products?.reduce((s, p) => s + p.stock, 0) || 0;
  const lowStock = products?.filter(p => p.stock < 5) || [];

  // Revenue by month
  const monthlyRevenue = {};
  orders?.filter(o => o.paymentStatus === 'paid').forEach(order => {
    const month = new Date(order.createdAt).toLocaleString('default', { month: 'short', year: '2-digit' });
    monthlyRevenue[month] = (monthlyRevenue[month] || 0) + order.totalAmount * 0.9;
  });
  const monthLabels = Object.keys(monthlyRevenue).slice(-6);
  const monthValues = monthLabels.map(m => monthlyRevenue[m]);
  const maxVal = Math.max(...monthValues, 1);

  // Top products
  const topProducts = [...(products || [])]
    .sort((a, b) => b.totalSold - a.totalSold)
    .slice(0, 5);

  const metrics = [
    { label: 'Total Revenue', value: `$${totalRevenue.toFixed(2)}`, icon: '💰', color: '#6c47ff', sub: 'after platform fee' },
    { label: 'Total Orders', value: totalOrders, icon: '📦', color: '#22c55e', sub: 'all time' },
    { label: 'Pending Orders', value: pendingOrders, icon: '⏳', color: '#f59e0b', sub: 'need attention' },
    { label: 'Total Stock', value: totalStock, icon: '🗃️', color: '#3b82f6', sub: `${lowStock.length} low stock` },
  ];

  return (
    <div className="page">
      <div className="container">
        <h1 style={{ marginBottom: '1.5rem' }}>Analytics</h1>

        {/* Metrics */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '2rem' }}>
          {metrics.map(m => (
            <div key={m.label} className="card" style={{ padding: '1.25rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <p style={{ fontSize: 12, color: '#6b7280', marginBottom: 4 }}>{m.label}</p>
                  <p style={{ fontSize: 26, fontWeight: 700 }}>{m.value}</p>
                  <p style={{ fontSize: 12, color: '#9ca3af', marginTop: 2 }}>{m.sub}</p>
                </div>
                <div style={{ width: 44, height: 44, background: `${m.color}20`, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>
                  {m.icon}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
          {/* Revenue chart */}
          <div className="card" style={{ padding: '1.25rem' }}>
            <h3 style={{ marginBottom: '1.25rem' }}>Monthly Revenue (last 6 months)</h3>
            {monthLabels.length ? (
              <div style={{ display: 'flex', alignItems: 'flex-end', gap: 10, height: 160 }}>
                {monthLabels.map((month, i) => (
                  <div key={month} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                    <span style={{ fontSize: 11, color: '#6b7280' }}>${monthValues[i].toFixed(0)}</span>
                    <div style={{
                      width: '100%', background: '#6c47ff', borderRadius: '4px 4px 0 0',
                      height: `${(monthValues[i] / maxVal) * 120}px`, minHeight: 4,
                      opacity: i === monthLabels.length - 1 ? 1 : 0.6,
                    }} />
                    <span style={{ fontSize: 11, color: '#9ca3af' }}>{month}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p style={{ color: '#9ca3af', textAlign: 'center', padding: '2rem' }}>No revenue data yet.</p>
            )}
          </div>

          {/* Top products */}
          <div className="card" style={{ padding: '1.25rem' }}>
            <h3 style={{ marginBottom: '1.25rem' }}>Top Products by Sales</h3>
            {topProducts.length ? (
              topProducts.map((p, i) => {
                const pct = Math.round((p.totalSold / (topProducts[0].totalSold || 1)) * 100);
                return (
                  <div key={p._id} style={{ marginBottom: '0.85rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 4 }}>
                      <span style={{ fontWeight: 500 }}>{i + 1}. {p.name}</span>
                      <span style={{ color: '#6b7280' }}>{p.totalSold} sold</span>
                    </div>
                    <div style={{ background: '#f3f4f6', borderRadius: 4, height: 6 }}>
                      <div style={{ width: `${pct}%`, background: '#6c47ff', height: '100%', borderRadius: 4 }} />
                    </div>
                  </div>
                );
              })
            ) : (
              <p style={{ color: '#9ca3af', textAlign: 'center', padding: '2rem' }}>No products yet.</p>
            )}
          </div>
        </div>

        {/* Low stock alert */}
        {lowStock.length > 0 && (
          <div className="card" style={{ padding: '1.25rem', background: '#fffbeb', borderColor: '#fde68a' }}>
            <h3 style={{ marginBottom: '1rem', color: '#92400e' }}>⚠️ Low Stock Alert</h3>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
              {lowStock.map(p => (
                <div key={p._id} style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#fff', border: '1px solid #fde68a', borderRadius: 8, padding: '6px 12px' }}>
                  <img
                    src={p.images?.[0] ? `http://localhost:5000${p.images[0]}` : 'https://placehold.co/30x30'}
                    alt=""
                    style={{ width: 30, height: 30, borderRadius: 4, objectFit: 'cover' }}
                  />
                  <div>
                    <p style={{ fontSize: 13, fontWeight: 500 }}>{p.name}</p>
                    <p style={{ fontSize: 12, color: p.stock === 0 ? '#ef4444' : '#d97706' }}>
                      {p.stock === 0 ? 'Out of stock' : `${p.stock} left`}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Product ratings */}
        <div className="card" style={{ padding: '1.25rem', marginTop: '1.5rem' }}>
          <h3 style={{ marginBottom: '1rem' }}>Product Performance</h3>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                {['Product', 'Price', 'Stock', 'Sold', 'Rating', 'Reviews'].map(h => (
                  <th key={h} style={{ padding: '8px 12px', fontSize: 12, color: '#6b7280', fontWeight: 600, textAlign: 'left', borderBottom: '1px solid #e5e7eb', textTransform: 'uppercase' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {products?.map(p => (
                <tr key={p._id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                  <td style={{ padding: '10px 12px', fontSize: 14, fontWeight: 500 }}>{p.name}</td>
                  <td style={{ padding: '10px 12px', fontSize: 14 }}>${p.price.toFixed(2)}</td>
                  <td style={{ padding: '10px 12px' }}>
                    <span style={{ color: p.stock < 5 ? '#ef4444' : '#22c55e', fontWeight: 500 }}>{p.stock}</span>
                  </td>
                  <td style={{ padding: '10px 12px', fontWeight: 600 }}>{p.totalSold}</td>
                  <td style={{ padding: '10px 12px' }}>⭐ {p.averageRating || 0}</td>
                  <td style={{ padding: '10px 12px', color: '#6b7280' }}>{p.totalReviews}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
