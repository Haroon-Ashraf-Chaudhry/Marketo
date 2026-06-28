import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useAuthStore from '../../store/authStore';
import toast from 'react-hot-toast';

export function LoginPage() {
  const [form, setForm] = useState({ email: '', password: '' });
  const { login, loading, error } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const user = await login(form);
      toast.success(`Welcome back, ${user.name.split(' ')[0]}!`);
      if (user.role === 'admin') navigate('/admin');
      else if (user.role === 'vendor') navigate('/vendor/products');
      else navigate('/products');
    } catch {}
  };

  return (
    <div style={styles.wrapper}>
      <div style={styles.card}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h1 style={{ fontSize: 28 }}>🛍️ Marketo</h1>
          <p style={{ color: '#6b7280', marginTop: 6 }}>Sign in to your account</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Email</label>
            <input className="form-control" type="email" value={form.email}
              onChange={e => setForm(f => ({ ...f, email: e.target.value }))} required />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input className="form-control" type="password" value={form.password}
              onChange={e => setForm(f => ({ ...f, password: e.target.value }))} required />
          </div>

          {error && <p className="form-error" style={{ marginBottom: 10 }}>{error}</p>}

          <button type="submit" className="btn btn-primary btn-full btn-lg" disabled={loading}>
            {loading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '1.25rem', fontSize: 14, color: '#6b7280' }}>
          Don't have an account? <Link to="/register" style={{ color: '#6c47ff', fontWeight: 500 }}>Sign up</Link>
        </div>
        <div style={{ textAlign: 'center', marginTop: 8, fontSize: 13 }}>
          <Link to="/forgot-password" style={{ color: '#6b7280' }}>Forgot password?</Link>
        </div>
      </div>
    </div>
  );
}

export function RegisterPage() {
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'buyer' });
  const { register, loading, error } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const user = await register(form);
      toast.success(`Account created! Welcome, ${user.name.split(' ')[0]}!`);
      navigate('/products');
    } catch {}
  };

  return (
    <div style={styles.wrapper}>
      <div style={styles.card}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h1 style={{ fontSize: 28 }}>🛍️ Marketo</h1>
          <p style={{ color: '#6b7280', marginTop: 6 }}>Create your account</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Full Name</label>
            <input className="form-control" value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required />
          </div>
          <div className="form-group">
            <label>Email</label>
            <input className="form-control" type="email" value={form.email}
              onChange={e => setForm(f => ({ ...f, email: e.target.value }))} required />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input className="form-control" type="password" value={form.password}
              onChange={e => setForm(f => ({ ...f, password: e.target.value }))} required minLength={6} />
          </div>

          <div className="form-group">
            <label>Account type</label>
            <div style={{ display: 'flex', gap: 12 }}>
              {['buyer', 'vendor'].map(role => (
                <label key={role} style={styles.roleCard(form.role === role)}>
                  <input type="radio" name="role" value={role} checked={form.role === role}
                    onChange={() => setForm(f => ({ ...f, role }))} style={{ display: 'none' }} />
                  <span style={{ fontSize: 20 }}>{role === 'buyer' ? '🛒' : '🏪'}</span>
                  <span style={{ fontWeight: 500, textTransform: 'capitalize' }}>{role}</span>
                  <span style={{ fontSize: 12, color: '#6b7280' }}>
                    {role === 'buyer' ? 'Shop products' : 'Sell products'}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {error && <p className="form-error" style={{ marginBottom: 10 }}>{error}</p>}

          <button type="submit" className="btn btn-primary btn-full btn-lg" disabled={loading}>
            {loading ? 'Creating account...' : 'Create account'}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '1.25rem', fontSize: 14, color: '#6b7280' }}>
          Already have an account? <Link to="/login" style={{ color: '#6c47ff', fontWeight: 500 }}>Sign in</Link>
        </div>
      </div>
    </div>
  );
}

const styles = {
  wrapper: { minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f3f0ff', padding: '2rem' },
  card: { background: '#fff', borderRadius: 16, padding: '2.5rem', width: '100%', maxWidth: 420, boxShadow: '0 8px 30px rgba(108,71,255,0.12)' },
  roleCard: (active) => ({
    flex: 1, display: 'flex', flexDirection: 'column', gap: 2, alignItems: 'center',
    padding: '0.85rem', border: `2px solid ${active ? '#6c47ff' : '#e5e7eb'}`,
    borderRadius: 10, cursor: 'pointer', background: active ? '#f3f0ff' : '#fff',
    transition: 'all 0.15s',
  }),
};
