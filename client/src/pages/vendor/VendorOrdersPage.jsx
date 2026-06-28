import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { orderAPI } from '../../api/services';

const STATUS_COLORS = {
  pending: 'badge-amber', paid: 'badge-green', processing: 'badge-purple',
  shipped: 'badge-purple', delivered: 'badge-green', cancelled: 'badge-red',
  disputed: 'badge-red', refunded: 'badge-gray',
};

export default function VendorOrdersPage() {
  const [statusFilter, setStatusFilter] = useState('');

  const { data: orders, isLoading } = useQuery({
    queryKey: ['vendorOrders'],
    queryFn: () => orderAPI.getVendorOrders().then(r => r.data),
  });

  const filtered = statusFilter ? orders?.filter(o => o.status === statusFilter) : orders;

  const total = orders?.filter(o => o.paymentStatus === 'paid')
    .reduce((sum, o) => sum + (o.totalAmount * 0.9), 0) || 0;

  return (
    <div className="page">
      <div className="container">
        <div className="flex-between" style={{ marginBottom: '1.5rem' }}>
          <div>
            <h1>Orders</h1>
            <p style={{ color: '#6b7280', fontSize: 14, marginTop: 2 }}>
              Total earnings: <strong style={{ color: '#22c55e' }}>${total.toFixed(2)}</strong> (after 10% fee)
            </p>
          </div>
          <select
            className="form-control"
            style={{ width: 180 }}
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
          >
            <option value="">All statuses</option>
            {['pending', 'paid', 'processing', 'shipped', 'delivered', 'cancelled', 'disputed'].map(s => (
              <option key={s} value={s} style={{ textTransform: 'capitalize' }}>{s}</option>
            ))}
          </select>
        </div>

        {isLoading ? (
          <div className="spinner-center"><div className="spinner" /></div>
        ) : !filtered?.length ? (
          <div style={{ textAlign: 'center', padding: '4rem', color: '#9ca3af' }}>
            <p style={{ fontSize: 48 }}>📋</p>
            <p>No orders found.</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={styles.table}>
              <thead>
                <tr>
                  {['Order ID', 'Buyer', 'Items', 'Amount', 'Your Cut', 'Status', 'Date', 'Action'].map(h => (
                    <th key={h} style={styles.th}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map(order => {
                  const myItems = order.items?.filter(i => i.vendor?._id === order.items[0]?.vendor?._id);
                  const myTotal = myItems?.reduce((s, i) => s + i.price * i.quantity, 0) || order.totalAmount;
                  return (
                    <tr key={order._id} style={styles.tr}>
                      <td style={styles.td}>
                        <span style={{ fontFamily: 'monospace', fontSize: 13 }}>#{order._id.slice(-8).toUpperCase()}</span>
                      </td>
                      <td style={styles.td}>
                        <p style={{ fontWeight: 500, fontSize: 14 }}>{order.buyer?.name}</p>
                        <p style={{ fontSize: 12, color: '#9ca3af' }}>{order.buyer?.email}</p>
                      </td>
                      <td style={styles.td}>
                        <div style={{ display: 'flex', gap: 6 }}>
                          {order.items?.slice(0, 2).map((item, i) => (
                            <img key={i}
                              src={item.image ? `http://localhost:5000${item.image}` : 'https://placehold.co/30x30'}
                              alt={item.name}
                              title={item.name}
                              style={{ width: 32, height: 32, borderRadius: 6, objectFit: 'cover' }}
                            />
                          ))}
                          {order.items?.length > 2 && (
                            <span style={{ width: 32, height: 32, borderRadius: 6, background: '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, color: '#6b7280' }}>
                              +{order.items.length - 2}
                            </span>
                          )}
                        </div>
                      </td>
                      <td style={styles.td}><strong>${order.totalAmount?.toFixed(2)}</strong></td>
                      <td style={styles.td}><span style={{ color: '#22c55e', fontWeight: 600 }}>${(myTotal * 0.9).toFixed(2)}</span></td>
                      <td style={styles.td}>
                        <span className={`badge ${STATUS_COLORS[order.status]}`}>{order.status}</span>
                      </td>
                      <td style={styles.td}>
                        <span style={{ fontSize: 13, color: '#9ca3af' }}>
                          {new Date(order.createdAt).toLocaleDateString()}
                        </span>
                      </td>
                      <td style={styles.td}>
                        <Link to={`/orders/${order._id}`} className="btn btn-secondary btn-sm">
                          Manage
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
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
