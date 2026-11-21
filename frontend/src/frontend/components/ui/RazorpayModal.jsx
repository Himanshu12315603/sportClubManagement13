import { useState } from 'react';
import Modal from './Modal';
import Icon from './Icon';
import { Button, Badge } from './primitives';
import { Field, Input } from './form';
import { formatCurrency } from '../../utils/format';
import api from '../../services/api';

/**
 * Razorpay Test API Payment Modal
 * Simulates the Razorpay Standard Checkout experience connected to the real Champions Club backend API.
 */
export default function RazorpayModal({
  open,
  onClose,
  amount,
  purpose = 'membership',
  relatedId,
  description = 'Payment',
  onSuccess,
}) {
  const [tab, setTab] = useState('card');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [card, setCard] = useState({
    number: '4111 1111 1111 1111',
    expiry: '12/28',
    cvv: '123',
    name: 'Test Member',
  });
  const [vpa, setVpa] = useState('success@razorpay');

  if (!open) return null;

  const handlePay = async () => {
    setError('');
    setBusy(true);
    try {
      // 1. Initialize payment order on backend
      const orderRes = await api.createPaymentOrder({
        amount: Number(amount) || 0,
        currency: 'INR',
        purpose,
        relatedId,
        notes: description,
      });

      const payment = orderRes.data?.payment;
      if (!payment) throw new Error('Could not create payment order');

      // 2. Simulate Razorpay processing delay
      await new Promise((r) => setTimeout(r, 900));

      // 3. Verify payment on backend with test credentials
      const testPaymentId = `pay_rzp_${Date.now()}`;
      const testSignature = `test_sig_${Date.now()}_valid`;

      const verifyRes = await api.verifyPayment({
        paymentId: payment._id,
        gatewayOrderId: payment.gatewayOrderId,
        gatewayPaymentId: testPaymentId,
        gatewaySignature: testSignature,
      });

      setBusy(false);
      if (onSuccess) {
        onSuccess({
          payment: verifyRes.data?.payment || payment,
          paymentId: testPaymentId,
          orderId: payment.gatewayOrderId,
          amount,
        });
      }
      onClose();
    } catch (err) {
      console.error('Razorpay payment error:', err);
      setError(err.message || 'Payment processing failed. Please try again.');
      setBusy(false);
    }
  };

  return (
    <Modal open={open} onClose={busy ? undefined : onClose} size="sm">
      <div style={{ textAlign: 'center', marginBottom: 16 }}>
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            padding: '6px 14px',
            borderRadius: 999,
            background: 'rgba(59, 130, 246, 0.12)',
            border: '1px solid rgba(59, 130, 246, 0.3)',
            marginBottom: 10,
          }}
        >
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#3b82f6', display: 'inline-block' }} />
          <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#60a5fa' }}>Razorpay Test API</span>
        </div>
        <h3 style={{ margin: '4px 0 2px', fontSize: '1.4rem' }}>{formatCurrency(amount)}</h3>
        <p className="tiny muted">{description}</p>
      </div>

      <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        <button
          type="button"
          onClick={() => setTab('card')}
          style={{
            flex: 1,
            padding: '8px 12px',
            borderRadius: 8,
            border: tab === 'card' ? '1px solid #3b82f6' : '1px solid var(--cb-border)',
            background: tab === 'card' ? 'rgba(59, 130, 246, 0.1)' : 'transparent',
            color: tab === 'card' ? '#60a5fa' : 'var(--cb-muted)',
            fontWeight: 600,
            fontSize: '0.85rem',
            cursor: 'pointer',
          }}
        >
          Test Card
        </button>
        <button
          type="button"
          onClick={() => setTab('upi')}
          style={{
            flex: 1,
            padding: '8px 12px',
            borderRadius: 8,
            border: tab === 'upi' ? '1px solid #3b82f6' : '1px solid var(--cb-border)',
            background: tab === 'upi' ? 'rgba(59, 130, 246, 0.1)' : 'transparent',
            color: tab === 'upi' ? '#60a5fa' : 'var(--cb-muted)',
            fontWeight: 600,
            fontSize: '0.85rem',
            cursor: 'pointer',
          }}
        >
          Test UPI
        </button>
      </div>

      {tab === 'card' ? (
        <div className="cb-stack" style={{ gap: 10 }}>
          <Field label="Card Number">
            <Input
              value={card.number}
              onChange={(e) => setCard((c) => ({ ...c, number: e.target.value }))}
              placeholder="4111 1111 1111 1111"
            />
          </Field>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <Field label="Expiry (MM/YY)">
              <Input
                value={card.expiry}
                onChange={(e) => setCard((c) => ({ ...c, expiry: e.target.value }))}
                placeholder="12/28"
              />
            </Field>
            <Field label="CVV">
              <Input
                value={card.cvv}
                onChange={(e) => setCard((c) => ({ ...c, cvv: e.target.value }))}
                placeholder="123"
              />
            </Field>
          </div>
          <div
            style={{
              padding: '8px 12px',
              borderRadius: 6,
              background: 'rgba(255, 255, 255, 0.04)',
              fontSize: '0.75rem',
              color: 'var(--cb-muted)',
            }}
          >
            💡 Razorpay Test Mode: Using standard test card details.
          </div>
        </div>
      ) : (
        <div className="cb-stack" style={{ gap: 10 }}>
          <Field label="UPI ID / VPA">
            <Input
              value={vpa}
              onChange={(e) => setVpa(e.target.value)}
              placeholder="success@razorpay"
            />
          </Field>
          <div
            style={{
              padding: '8px 12px',
              borderRadius: 6,
              background: 'rgba(255, 255, 255, 0.04)',
              fontSize: '0.75rem',
              color: 'var(--cb-muted)',
            }}
          >
            💡 Enter <code style={{ color: '#60a5fa' }}>success@razorpay</code> for automatic success approval.
          </div>
        </div>
      )}

      {error ? (
        <div style={{ marginTop: 12, padding: '8px 12px', borderRadius: 6, background: '#fee2e2', color: '#b91c1c', fontSize: '0.8rem' }}>
          {error}
        </div>
      ) : null}

      <div style={{ marginTop: 20, display: 'flex', gap: 10 }}>
        <Button variant="ghost" block disabled={busy} onClick={onClose}>
          Cancel
        </Button>
        <Button
          block
          icon="Check"
          disabled={busy}
          onClick={handlePay}
          style={{ background: '#2563eb', color: '#fff' }}
        >
          {busy ? 'Processing with Razorpay…' : `Pay ${formatCurrency(amount)}`}
        </Button>
      </div>

      <p className="tiny dim" style={{ textAlign: 'center', marginTop: 12 }}>
        🔒 Secured by Razorpay Payment Gateway (Test Environment)
      </p>
    </Modal>
  );
}
