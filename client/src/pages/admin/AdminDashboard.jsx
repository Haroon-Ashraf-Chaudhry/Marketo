import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminAPI } from '../../api/services';
import toast from 'react-hot-toast';

const STATUS_COLORS = {
  pending: 'badge-amber', paid: 'badge-green', processing: 'badge-purple',
  shipped: 'badge-purple', delivered: 'badge-green', cancelled: 'badge-red',
  disputed: 'badge-red', refunded: 'badge-gray',
};

export default function AdminDashboard() {
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ['adminDashboard'],
    queryFn: () => adminAPI.getDashboard().then(r => r.data),
  });

  const { data: vendorStats } = useQuery({
    queryKey: ['vendorStats'],
    queryFn: () => adminAPI.getVendorStats().then(r => r.data),
  });

  const { data: users } = useQuery({
    queryKey: ['adminUsers'],
    queryFn: () => adminAPI.getUsers({ limit: 10 }).then(r => r.data),
  });

  const toggleMutation = useMutation({
    mutationFn: adminAPI.toggleUser,
    onSuccess: () => { qc.invalidateQueries(['adminUsers']); toast.success('User status updated'); },
  });

  if (isLoading) return <div className="spinner-center"><div className="spinner" /></div>;

  const metrics = [
    { label: 'Total Buyers', value: data?.totalUsers, icon: '👤', color: '#6c47ff' },
    { label: 'Total Vendors', value: data?.totalVendors, icon: '🏪', color: '#22c55e' },
    { label: 'Active Products', value: data?.totalProducts, icon: '📦', color: '#f59e0b' },
    { label: 'Platform Revenue', value: `$${(data?.revenue || 0).toFixed(2)}`, icon: '💰', color: '#ef4444' },
  ];

  return (
    <div className="page">
      <div className="container">
        <h1 style={{ marginBottom: '1.5rem' }}>Admin Dashboard</h1>

        {/* Metrics */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '2rem' }}>
          {metrics.map(m => (
            <div key={m.label} className="card" style={{ padding: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <span style={styles.metricIcon(m.color)}>{m.icon}</span>
                <div>
                  <p style={{ fontSize: 12, color: '#6b7280' }}>{m.label}</p>
                  <p style={{ fontSize: 24, fontWeight: 700 }}>{m.value}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
          {/* Recent Orders */}
          <div className="card" style={{ padding: '1.25rem' }}>
            <h3 style={{ marginBottom: '1rem' }}>Recent Orders</h3>
            {data?.recentOrders?.map(order => (
              <div key={order._id} style={styles.orderRow}>
                <div>
                  <p style={{ fontSize: 13, fontWeight: 500 }}>{order.buyer?.name}</p>
                  <p style={{ fontSize: 12, color: '#9ca3af' }}>#{order._id.slice(-8)}</p>
                </div>
                <span className={`badge ${STATUS_COLORS[order.status] || 'badge-gray'}`}>{order.status}</span>
                <strong>${order.totalAmount?.toFixed(2)}</strong>
              </div>
            ))}
          </div>

          {/* Top Vendors */}
          <div className="card" style={{ padding: '1.25rem' }}>
            <h3 style={{ marginBottom: '1rem' }}>Top Vendors</h3>
            {vendorStats?.map((v, i) => (
              <div key={v._id} style={styles.orderRow}>
                <span style={{ width: 24, height: 24, background: '#6c47ff', color: '#fff', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, flexShrink: 0 }}>
                  {i + 1}
                </span>
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: 13, fontWeight: 500 }}>{v.vendor.name}</p>
                  <p style={{ fontSize: 12, color: '#9ca3af' }}>{v.totalOrders} orders</p>
                </div>
                <strong>${v.totalSales?.toFixed(2)}</strong>
              </div>
            ))}
          </div>
        </div>

        {/* Users table */}
        <div className="card" style={{ padding: '1.25rem', marginTop: '2rem' }}>
          <h3 style={{ marginBottom: '1rem' }}>Recent Users</h3>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                {['Name', 'Email', 'Role', 'Joined', 'Status', 'Action'].map(h => (
                  <th key={h} style={{ padding: '8px 12px', fontSize: 12, color: '#6b7280', fontWeight: 600, textAlign: 'left', borderBottom: '1px solid #e5e7eb', textTransform: 'uppercase' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {users?.users?.map(u => (
                <tr key={u._id}>
                  <td style={{ padding: '10px 12px', fontSize: 14 }}>{u.name}</td>
                  <td style={{ padding: '10px 12px', fontSize: 14, color: '#6b7280' }}>{u.email}</td>
                  <td style={{ padding: '10px 12px' }}><span className={`badge ${u.role === 'vendor' ? 'badge-purple' : 'badge-gray'}`}>{u.role}</span></td>
                  <td style={{ padding: '10px 12px', fontSize: 13, color: '#9ca3af' }}>{new Date(u.createdAt).toLocaleDateString()}</td>
                  <td style={{ padding: '10px 12px' }}>
                    <span className={`badge ${u.isActive ? 'badge-green' : 'badge-red'}`}>{u.isActive ? 'Active' : 'Banned'}</span>
                  </td>
                  <td style={{ padding: '10px 12px' }}>
                    {u.role !== 'admin' && (
                      <button
                        className={`btn btn-sm ${u.isActive ? 'btn-danger' : 'btn-secondary'}`}
                        onClick={() => toggleMutation.mutate(u._id)}
                      >
                        {u.isActive ? 'Ban' : 'Unban'}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

const styles = {
  metricIcon: (color) => ({
    width: 44, height: 44, background: `${color}20`, borderRadius: 10,
    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20,
  }),
  orderRow: { display: 'flex', alignItems: 'center', gap: 12, padding: '8px 0', borderBottom: '1px solid #f3f4f6', fontSize: 14 },
};
