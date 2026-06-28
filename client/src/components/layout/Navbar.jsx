import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useAuthStore from '../../store/authStore';
import useCartStore from '../../store/cartStore';
import { useSocket } from '../../hooks/useSocket';

export default function Navbar() {
  const { user, logout } = useAuthStore();
  const cartItems = useCartStore(s => s.items);
  const cartCount = cartItems.reduce((sum, i) => sum + i.quantity, 0);
  const { notifications } = useSocket() || {};
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav style={styles.nav}>
      <div className="container" style={styles.inner}>
        <Link to="/" style={styles.logo}>🛍️ Marketo</Link>

        <div style={styles.search}>
          <form onSubmit={(e) => {
            e.preventDefault();
            navigate(`/products?search=${e.target.search.value}`);
          }}>
            <input
              name="search"
              placeholder="Search products..."
              style={styles.searchInput}
            />
          </form>
        </div>

        <div style={styles.actions}>
          {user ? (
            <>
              <Link to="/cart" style={styles.iconBtn}>
                🛒 <span style={styles.badge}>{cartCount || ''}</span>
              </Link>

              <div style={{ position: 'relative' }}>
                <button style={styles.avatarBtn} onClick={() => setMenuOpen(!menuOpen)}>
                  {user.avatar
                    ? <img src={`http://localhost:5000${user.avatar}`} alt="" style={styles.avatar} />
                    : <span style={styles.initials}>{user.name[0].toUpperCase()}</span>
                  }
                  <span style={styles.userName}>{user.name.split(' ')[0]}</span>
                  <span style={{ fontSize: 12 }}>▾</span>
                </button>

                {menuOpen && (
                  <div style={styles.dropdown} onClick={() => setMenuOpen(false)}>
                    <div style={styles.dropdownHeader}>
                      <strong>{user.name}</strong>
                      <span style={{ fontSize: 12, color: '#6b7280' }}>{user.role}</span>
                    </div>
                    {user.role === 'buyer' && (
                      <>
                        <Link to="/orders" style={styles.dropdownItem}>📦 My Orders</Link>
                        <Link to="/chat" style={styles.dropdownItem}>💬 Messages</Link>
                      </>
                    )}
                    {user.role === 'vendor' && (
                      <>
                        <Link to="/vendor/products" style={styles.dropdownItem}>📋 My Products</Link>
                        <Link to="/vendor/orders" style={styles.dropdownItem}>📦 Orders</Link>
                        <Link to="/vendor/analytics" style={styles.dropdownItem}>📊 Analytics</Link>
                        <Link to="/chat" style={styles.dropdownItem}>💬 Messages</Link>
                      </>
                    )}
                    {user.role === 'admin' && (
                      <>
                        <Link to="/admin" style={styles.dropdownItem}>⚙️ Admin Panel</Link>
                      </>
                    )}
                    <Link to="/profile" style={styles.dropdownItem}>👤 Profile</Link>
                    <hr style={{ margin: '4px 0', border: 'none', borderTop: '1px solid #e5e7eb' }} />
                    <button onClick={handleLogout} style={{ ...styles.dropdownItem, color: '#ef4444', background: 'none', border: 'none', width: '100%', textAlign: 'left' }}>
                      🚪 Sign out
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              <Link to="/login" className="btn btn-secondary btn-sm">Sign in</Link>
              <Link to="/register" className="btn btn-primary btn-sm">Sign up</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

const styles = {
  nav: { background: '#fff', borderBottom: '1px solid #e5e7eb', position: 'sticky', top: 0, zIndex: 100, height: 62 },
  inner: { display: 'flex', alignItems: 'center', gap: '1rem', height: '100%' },
  logo: { fontSize: 20, fontWeight: 700, color: '#6c47ff', whiteSpace: 'nowrap', textDecoration: 'none' },
  search: { flex: 1 },
  searchInput: {
    width: '100%', padding: '0.5rem 1rem', borderRadius: 20,
    border: '1px solid #e5e7eb', background: '#f9fafb', fontSize: 14,
    outline: 'none',
  },
  actions: { display: 'flex', alignItems: 'center', gap: '0.75rem', flexShrink: 0 },
  iconBtn: { fontSize: 20, position: 'relative', textDecoration: 'none' },
  badge: {
    position: 'absolute', top: -6, right: -8, background: '#6c47ff', color: '#fff',
    borderRadius: '50%', fontSize: 10, padding: '1px 5px', fontWeight: 700,
  },
  avatarBtn: { display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', cursor: 'pointer', fontSize: 14 },
  avatar: { width: 32, height: 32, borderRadius: '50%', objectFit: 'cover' },
  initials: {
    width: 32, height: 32, borderRadius: '50%', background: '#6c47ff',
    color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: 13, fontWeight: 600,
  },
  userName: { fontWeight: 500 },
  dropdown: {
    position: 'absolute', right: 0, top: '110%', width: 200,
    background: '#fff', border: '1px solid #e5e7eb', borderRadius: 10,
    boxShadow: '0 8px 20px rgba(0,0,0,0.1)', padding: '6px',
    zIndex: 200,
  },
  dropdownHeader: {
    display: 'flex', flexDirection: 'column', padding: '8px 10px 8px',
    borderBottom: '1px solid #e5e7eb', marginBottom: 4,
  },
  dropdownItem: {
    display: 'block', padding: '8px 10px', borderRadius: 6, fontSize: 14,
    color: '#374151', textDecoration: 'none', cursor: 'pointer',
    transition: 'background 0.1s',
  },
};
