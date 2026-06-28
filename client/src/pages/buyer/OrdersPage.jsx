import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { orderAPI } from '../../api/services';

const STATUS_COLORS = {
  pending: 'badge-amber', paid: 'badge-green', processing: 'badge-purple',
  shipped: 'badge-purple', delivered: 'badge-green', cancelled: 'badge-red',
  disputed: 'badge-red', refunded: 'badge-gray',
};

const STATUS_ICONS = {
  pending: '⏳', paid: '✅', processing: '⚙️',
  shipped: '🚚', delivered: '📦', cancelled: '❌',
  disputed: '⚠️', refunded: '↩️',
};

export default function OrdersPage() {
  const { data: orders, isLoading } = useQuery({
    queryKey: ['myOrders'],
    queryFn: () => orderAPI.getMyOrders().then(r => r.data),
  });

  if (isLoading) return <div className="spinner-center"><div className="spinner" /></div>;

  return (
    <div className="page">
      <div className="container">
        <h1 style={{ marginBottom: '1.5rem' }}>My Orders</h1>

        {!orders?.length ? (
          <div style={{ textAlign: 'center', padding: '4rem', color: '#9ca3af' }}>
            <p style={{ fontSize: 48 }}>📦</p>
            <p style={{ marginBottom: '1rem' }}>You haven't placed any orders yet.</p>
            <Link to="/products" className="btn btn-primary">Start Shopping</Link>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {orders.map(order => (
              <div key={order._id} className="card" style={{ padding: '1.25rem' }}>
                <div style={styles.orderHeader}>
                  <div>
                    <p style={{ fontSize: 13, color: '#6b7280' }}>Order #{order._id.slice(-10).toUpperCase()}</p>
                    <p style={{ fontSize: 13, color: '#9ca3af', marginTop: 2 }}>
                      {new Date(order.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                    </p>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <span className={`badge ${STATUS_COLORS[order.status]}`}>
                      {STATUS_ICONS[order.status]} {order.status}
                    </span>
                    <strong style={{ fontSize: 16 }}>${order.totalAmount?.toFixed(2)}</strong>
                    <Link to={`/orders/${order._id}`} className="btn btn-secondary btn-sm">
                      View Details
                    </Link>
                  </div>
                </div>

                <div style={styles.itemsRow}>
                  {order.items?.slice(0, 4).map((item, i) => (
                    <div key={i} style={styles.itemChip}>
                      <img
                        src={item.image ? `http://localhost:5000${item.image}` : 'https://placehold.co/40x40'}
                        alt={item.name}
                        style={{ width: 36, height: 36, borderRadius: 6, objectFit: 'cover' }}
                      />
                      <div>
                        <p style={{ fontSize: 13, fontWeight: 500 }}>{item.name}</p>
                        <p style={{ fontSize: 12, color: '#6b7280' }}>Qty: {item.quantity} · ${item.price?.toFixed(2)}</p>
                      </div>
                    </div>
                  ))}
                  {order.items?.length > 4 && (
                    <span style={{ fontSize: 13, color: '#9ca3af', alignSelf: 'center' }}>
                      +{order.items.length - 4} more
                    </span>
                  )}
                </div>

                {order.trackingNumber && (
                  <p style={{ fontSize: 12, color: '#6b7280', marginTop: 8 }}>
                    🚚 Tracking: <strong>{order.trackingNumber}</strong>
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  orderHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' },
  itemsRow: { display: 'flex', gap: '1rem', flexWrap: 'wrap' },
  itemChip: { display: 'flex', gap: 8, alignItems: 'center', background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: 8, padding: '6px 10px' },
};
