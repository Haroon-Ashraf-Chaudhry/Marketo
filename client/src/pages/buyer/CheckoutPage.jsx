import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { orderAPI } from '../../api/services';
import useCartStore from '../../store/cartStore';
import toast from 'react-hot-toast';

const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PK || 'pk_test_your_key');

function CheckoutForm() {
  const stripe = useStripe();
  const elements = useElements();
  const navigate = useNavigate();
  const { items, clearCart } = useCartStore();
  const [loading, setLoading] = useState(false);
  const [address, setAddress] = useState({ street: '', city: '', state: '', zip: '', country: '' });

  const total = items.reduce((sum, i) => sum + i.product.price * i.quantity, 0);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!stripe || !elements) return;
    setLoading(true);

    try {
      // 1. Create order + get PaymentIntent clientSecret
      const { data } = await orderAPI.create({
        items: items.map(i => ({ product: i.product._id, quantity: i.quantity })),
        shippingAddress: address,
      });

      // 2. Confirm payment with Stripe
      const result = await stripe.confirmCardPayment(data.clientSecret, {
        payment_method: { card: elements.getElement(CardElement) },
      });

      if (result.error) {
        toast.error(result.error.message);
      } else {
        clearCart();
        toast.success('Payment successful! Order placed.');
        navigate(`/orders/${data.order._id}`);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div style={styles.layout}>
        <div>
          <div className="card" style={{ padding: '1.5rem', marginBottom: '1rem' }}>
            <h3 style={{ marginBottom: '1rem' }}>Shipping Address</h3>
            {['street', 'city', 'state', 'zip', 'country'].map(field => (
              <div className="form-group" key={field}>
                <label style={{ textTransform: 'capitalize' }}>{field}</label>
                <input
                  className="form-control"
                  value={address[field]}
                  onChange={e => setAddress(a => ({ ...a, [field]: e.target.value }))}
                  required
                />
              </div>
            ))}
          </div>

          <div className="card" style={{ padding: '1.5rem' }}>
            <h3 style={{ marginBottom: '1rem' }}>Payment Details</h3>
            <div style={styles.cardElement}>
              <CardElement options={{ style: { base: { fontSize: '15px', color: '#1a1a2e' } } }} />
            </div>
            <p style={{ fontSize: 12, color: '#9ca3af', marginTop: 8 }}>
              Use test card: 4242 4242 4242 4242 | Any expiry & CVC
            </p>
          </div>
        </div>

        <div className="card" style={styles.summary}>
          <h3 style={{ marginBottom: '1rem' }}>Order Summary</h3>
          {items.map(({ product, quantity }) => (
            <div key={product._id} style={styles.line}>
              <span className="truncate" style={{ maxWidth: 160 }}>{product.name} × {quantity}</span>
              <span>${(product.price * quantity).toFixed(2)}</span>
            </div>
          ))}
          <hr style={{ margin: '12px 0', border: 'none', borderTop: '1px solid #e5e7eb' }} />
          <div style={styles.line}>
            <span>Subtotal</span><span>${total.toFixed(2)}</span>
          </div>
          <div style={{ ...styles.line, color: '#6b7280', fontSize: 13 }}>
            <span>Platform fee (10%)</span><span>${(total * 0.1).toFixed(2)}</span>
          </div>
          <hr style={{ margin: '12px 0', border: 'none', borderTop: '1px solid #e5e7eb' }} />
          <div style={{ ...styles.line, fontWeight: 700, fontSize: 17 }}>
            <span>Total</span><span style={{ color: '#6c47ff' }}>${total.toFixed(2)}</span>
          </div>
          <button
            type="submit"
            className="btn btn-primary btn-full btn-lg"
            style={{ marginTop: '1.25rem' }}
            disabled={loading || !stripe}
          >
            {loading ? 'Processing...' : `Pay $${total.toFixed(2)}`}
          </button>
        </div>
      </div>
    </form>
  );
}

export default function CheckoutPage() {
  return (
    <div className="page">
      <div className="container">
        <h1 style={{ marginBottom: '1.5rem' }}>Checkout</h1>
        <Elements stripe={stripePromise}>
          <CheckoutForm />
        </Elements>
      </div>
    </div>
  );
}

const styles = {
  layout: { display: 'grid', gridTemplateColumns: '1fr 320px', gap: '2rem', alignItems: 'start' },
  cardElement: { border: '1px solid #e5e7eb', borderRadius: 8, padding: '12px 14px', background: '#fff' },
  summary: { padding: '1.25rem', position: 'sticky', top: 80 },
  line: { display: 'flex', justifyContent: 'space-between', fontSize: 14, marginBottom: 8 },
};
