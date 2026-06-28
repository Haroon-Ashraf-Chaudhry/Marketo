import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { authAPI } from '../../api/services';
import useAuthStore from '../../store/authStore';
import toast from 'react-hot-toast';

export default function ProfilePage() {
  const { user, fetchMe } = useAuthStore();
  const [form, setForm] = useState({ name: user?.name || '', phone: user?.phone || '' });
  const [avatar, setAvatar] = useState(null);
  const [preview, setPreview] = useState(null);

  const updateMutation = useMutation({
    mutationFn: () => {
      const fd = new FormData();
      fd.append('name', form.name);
      fd.append('phone', form.phone);
      if (avatar) fd.append('avatar', avatar);
      return authAPI.updateProfile(fd);
    },
    onSuccess: () => {
      fetchMe();
      toast.success('Profile updated!');
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed'),
  });

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setAvatar(file);
    setPreview(URL.createObjectURL(file));
  };

  const avatarSrc = preview || (user?.avatar ? `http://localhost:5000${user.avatar}` : null);

  return (
    <div className="page">
      <div className="container" style={{ maxWidth: 600 }}>
        <h1 style={{ marginBottom: '1.5rem' }}>My Profile</h1>

        <div className="card" style={{ padding: '2rem' }}>
          {/* Avatar */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', marginBottom: '2rem' }}>
            <div style={{ position: 'relative' }}>
              {avatarSrc ? (
                <img src={avatarSrc} alt="Avatar" style={styles.avatar} />
              ) : (
                <div style={styles.avatarFallback}>{user?.name?.[0]?.toUpperCase()}</div>
              )}
              <label htmlFor="avatarInput" style={styles.avatarEdit}>📷</label>
              <input id="avatarInput" type="file" accept="image/*" onChange={handleAvatarChange} style={{ display: 'none' }} />
            </div>
            <div>
              <h2 style={{ fontSize: 20 }}>{user?.name}</h2>
              <p style={{ color: '#6b7280', fontSize: 14 }}>{user?.email}</p>
              <span className={`badge ${user?.role === 'vendor' ? 'badge-purple' : user?.role === 'admin' ? 'badge-red' : 'badge-gray'}`} style={{ marginTop: 6, display: 'inline-block' }}>
                {user?.role}
              </span>
            </div>
          </div>

          <div className="form-group">
            <label>Full Name</label>
            <input className="form-control" value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
          </div>
          <div className="form-group">
            <label>Phone</label>
            <input className="form-control" value={form.phone}
              onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
              placeholder="+1 555 000 0000" />
          </div>
          <div className="form-group">
            <label>Email</label>
            <input className="form-control" value={user?.email || ''} disabled style={{ background: '#f9fafb', color: '#9ca3af' }} />
            <p className="form-error" style={{ color: '#9ca3af' }}>Email cannot be changed</p>
          </div>

          <button
            className="btn btn-primary"
            onClick={() => updateMutation.mutate()}
            disabled={updateMutation.isPending}
          >
            {updateMutation.isPending ? 'Saving...' : 'Save Changes'}
          </button>
        </div>

        <div className="card" style={{ padding: '1.5rem', marginTop: '1rem' }}>
          <h3 style={{ marginBottom: '1rem' }}>Account Info</h3>
          <div style={styles.infoRow}>
            <span style={{ color: '#6b7280' }}>Member since</span>
            <span>{user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long' }) : '—'}</span>
          </div>
          <div style={styles.infoRow}>
            <span style={{ color: '#6b7280' }}>Account type</span>
            <span style={{ textTransform: 'capitalize' }}>{user?.role}</span>
          </div>
          <div style={styles.infoRow}>
            <span style={{ color: '#6b7280' }}>Status</span>
            <span className={`badge ${user?.isActive ? 'badge-green' : 'badge-red'}`}>
              {user?.isActive ? 'Active' : 'Inactive'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  avatar: { width: 80, height: 80, borderRadius: '50%', objectFit: 'cover', border: '3px solid #e5e7eb' },
  avatarFallback: {
    width: 80, height: 80, borderRadius: '50%', background: '#6c47ff', color: '#fff',
    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, fontWeight: 700,
  },
  avatarEdit: {
    position: 'absolute', bottom: 0, right: 0, width: 26, height: 26, background: '#fff',
    border: '2px solid #e5e7eb', borderRadius: '50%', display: 'flex', alignItems: 'center',
    justifyContent: 'center', cursor: 'pointer', fontSize: 13,
  },
  infoRow: { display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #f3f4f6', fontSize: 14 },
};
