import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { orderAPI } from '../../api/services';
import useAuthStore from '../../store/authStore';
import toast from 'react-hot-toast';

const STATUS_COLORS = {
  pending: 'badge-amber', paid: 'badge-green', processing: 'badge-purple',
  shipped: 'badge-purple', delivered: 'badge-green', cancelled: 'badge-red',
  disputed: 'badge-red', refunded: 'badge-gray',
};

const STEPS = ['pending', 'paid', 'processing', 'shipped', 'delivered'];

export default function OrderDetailPage() {
  const { id } = useParams();
  const { user } = useAuthStore();
  const qc = useQueryClient();
  const [disputeText, setDisputeText] = useState('');
  const [showDispute, setShowDispute] = useState(false);
  const [statusForm, setStatusForm] = useState({ status: '', trackingNumber: '' });

  const { data: order, isLoading } = useQuery({
    queryKey: ['order', id],
    queryFn: () => orderAPI.getOne(id).then(r => r.data),
  });

  const disputeMutation = useMutation({
    mutationFn: () => orderAPI.raiseDispute(id, disputeText),
    onSuccess: () => { qc.invalidateQueries(['order', id]); toast.success('Dispute raised'); setShowDispute(false); },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed'),
  });

  const statusMutation = useMutation({
    mutationFn: () => orderAPI.updateStatus(id, statusForm),
    onSuccess: () => { qc.invalidateQueries(['order', id]); toast.success('Order updated'); },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed'),
  });

  if (isLoading) return <div className="spinner-center"><div className="spinner" /></div>;
  if (!order) return <div className="page"><div className="container">Order not found.</div></div>;

  const activeStep = STEPS.indexOf(order.status);

  return (
    <div className="page">
      <div className="container">
        <Link to={user?.role === 'vendor' ? '/vendor/orders' : '/orders'} style={{ color: '#6c47ff', fontSize: 14 }}>
          ← Back to orders
        </Link>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '1rem 0 1.5rem' }}>
          <div>
            <h1 style={{ fontSize: 22 }}>Order #{order._id.slice(-10).toUpperCase()}</h1>
            <p style={{ fontSize: 13, color: '#9ca3af', marginTop: 2 }}>
              Placed {new Date(order.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>
          <span className={`badge ${STATUS_COLORS[order.status]}`} style={{ fontSize: 14, padding: '5px 14px' }}>
            {order.status}
          </span>
        </div>

        {/* Progress tracker */}
        {!['cancelled', 'disputed', 'refunded'].includes(order.status) && (
          <div className="card" style={{ padding: '1.25rem', marginBottom: '1.5rem' }}>
            <div style={styles.steps}>
              {STEPS.map((step, i) => (
                <div key={step} style={styles.stepWrap}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                    <div style={styles.stepDot(i <= activeStep)}>
                      {i < activeStep ? '✓' : i + 1}
                    </div>
                    <span style={{ fontSize: 12, fontWeight: i === activeStep ? 600 : 400, color: i <= activeStep ? '#6c47ff' : '#9ca3af', textTransform: 'capitalize' }}>
                      {step}
                    </span>
                  </div>
                  {i < STEPS.length - 1 && <div style={styles.stepLine(i < activeStep)} />}
                </div>
              ))}
            </div>
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '1.5rem' }}>
          <div>
            {/* Items */}
            <div className="card" style={{ padding: '1.25rem', marginBottom: '1rem' }}>
              <h3 style={{ marginBottom: '1rem' }}>Items ({order.items?.length})</h3>
              {order.items?.map((item, i) => (
                <div key={i} style={styles.itemRow}>
                  <img
                    src={item.image ? `http://localhost:5000${item.image}` : 'https://placehold.co/60x60'}
                    alt={item.name}
                    style={{ width: 60, height: 60, borderRadius: 8, objectFit: 'cover' }}
                  />
                  <div style={{ flex: 1 }}>
                    <p style={{ fontWeight: 500 }}>{item.name}</p>
                    <p style={{ fontSize: 13, color: '#6b7280' }}>
                      Sold by: {item.vendor?.name} · Qty: {item.quantity}
                    </p>
                  </div>
                  <strong>${(item.price * item.quantity).toFixed(2)}</strong>
                </div>
              ))}
            </div>

            {/* Shipping address */}
            <div className="card" style={{ padding: '1.25rem', marginBottom: '1rem' }}>
              <h3 style={{ marginBottom: '0.75rem' }}>Shipping Address</h3>
              <p style={{ fontSize: 14, color: '#374151', lineHeight: 1.7 }}>
                {order.shippingAddress?.street}<br />
                {order.shippingAddress?.city}, {order.shippingAddress?.state} {order.shippingAddress?.zip}<br />
                {order.shippingAddress?.country}
              </p>
            </div>

            {/* Vendor actions */}
            {user?.role === 'vendor' && !['delivered', 'cancelled'].includes(order.status) && (
              <div className="card" style={{ padding: '1.25rem', marginBottom: '1rem' }}>
                <h3 style={{ marginBottom: '1rem' }}>Update Order Status</h3>
                <div style={{ display: 'flex', gap: 10 }}>
                  <select
                    className="form-control"
                    value={statusForm.status}
                    onChange={e => setStatusForm(f => ({ ...f, status: e.target.value }))}
                  >
                    <option value="">Select status</option>
                    {['processing', 'shipped', 'delivered', 'cancelled'].map(s => (
                      <option key={s} value={s} style={{ textTransform: 'capitalize' }}>{s}</option>
                    ))}
                  </select>
                  <input
                    className="form-control"
                    placeholder="Tracking number (optional)"
                    value={statusForm.trackingNumber}
                    onChange={e => setStatusForm(f => ({ ...f, trackingNumber: e.target.value }))}
                  />
                  <button
                    className="btn btn-primary"
                    disabled={!statusForm.status || statusMutation.isPending}
                    onClick={() => statusMutation.mutate()}
                  >
                    Update
                  </button>
                </div>
              </div>
            )}

            {/* Dispute */}
            {user?.role === 'buyer' && order.status === 'delivered' && (
              <div className="card" style={{ padding: '1.25rem' }}>
                <h3 style={{ marginBottom: '0.75rem' }}>Issue with your order?</h3>
                {!showDispute ? (
                  <button className="btn btn-danger btn-sm" onClick={() => setShowDispute(true)}>
                    Raise a Dispute
                  </button>
                ) : (
                  <div>
                    <textarea
                      className="form-control"
                      rows={3}
                      placeholder="Describe the issue..."
                      value={disputeText}
                      onChange={e => setDisputeText(e.target.value)}
                      style={{ marginBottom: 10 }}
                    />
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button className="btn btn-danger btn-sm" disabled={!disputeText || disputeMutation.isPending} onClick={() => disputeMutation.mutate()}>
                        Submit Dispute
                      </button>
                      <button className="btn btn-secondary btn-sm" onClick={() => setShowDispute(false)}>Cancel</button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {order.disputeReason && (
              <div className="card" style={{ padding: '1.25rem', background: '#fff5f5', borderColor: '#fecaca' }}>
                <h3 style={{ color: '#dc2626', marginBottom: 6 }}>⚠️ Dispute Reason</h3>
                <p style={{ fontSize: 14 }}>{order.disputeReason}</p>
              </div>
            )}
          </div>

          {/* Summary */}
          <div>
            <div className="card" style={{ padding: '1.25rem', marginBottom: '1rem' }}>
              <h3 style={{ marginBottom: '1rem' }}>Order Summary</h3>
              <div style={styles.summaryLine}>
                <span>Subtotal</span><span>${order.totalAmount?.toFixed(2)}</span>
              </div>
              <div style={{ ...styles.summaryLine, color: '#9ca3af', fontSize: 13 }}>
                <span>Platform fee</span><span>${order.platformFee?.toFixed(2)}</span>
              </div>
              <hr style={{ margin: '10px 0', border: 'none', borderTop: '1px solid #e5e7eb' }} />
              <div style={{ ...styles.summaryLine, fontWeight: 700, fontSize: 16 }}>
                <span>Total</span><span style={{ color: '#6c47ff' }}>${order.totalAmount?.toFixed(2)}</span>
              </div>
              <div style={{ marginTop: '1rem', padding: '8px 12px', background: '#f9fafb', borderRadius: 8, fontSize: 13 }}>
                <span style={{ color: '#6b7280' }}>Payment: </span>
                <span className={`badge ${order.paymentStatus === 'paid' ? 'badge-green' : 'badge-amber'}`}>
                  {order.paymentStatus}
                </span>
              </div>
            </div>

            {user?.role === 'buyer' && (
              <div className="card" style={{ padding: '1.25rem' }}>
                <h3 style={{ marginBottom: '0.75rem', fontSize: 14 }}>Buyer</h3>
                <p style={{ fontSize: 14 }}>{order.buyer?.name}</p>
                <p style={{ fontSize: 13, color: '#6b7280' }}>{order.buyer?.email}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  steps: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'relative' },
  stepWrap: { display: 'flex', flex: 1, alignItems: 'center' },
  stepDot: (active) => ({
    width: 32, height: 32, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
    background: active ? '#6c47ff' : '#e5e7eb', color: active ? '#fff' : '#9ca3af',
    fontSize: 13, fontWeight: 600, flexShrink: 0,
  }),
  stepLine: (active) => ({
    flex: 1, height: 3, background: active ? '#6c47ff' : '#e5e7eb', margin: '0 6px', marginTop: -22,
  }),
  itemRow: { display: 'flex', gap: '1rem', alignItems: 'center', padding: '0.75rem 0', borderBottom: '1px solid #f3f4f6' },
  summaryLine: { display: 'flex', justifyContent: 'space-between', fontSize: 14, marginBottom: 8 },
};
