import { useRef, useState } from 'react';
import Modal from './Modal';
import Icon from './Icon';
import { Badge, Button } from './primitives';
import { formatCurrency } from '../../utils/format';
import { useApp } from '../../context/AppContext';
import api from '../../services/api';

let checkoutScriptPromise;

function loadRazorpayCheckout() {
  if (window.Razorpay) return Promise.resolve();
  if (!checkoutScriptPromise) {
    checkoutScriptPromise = new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.async = true;
      script.onload = () => resolve();
      script.onerror = () => {
        checkoutScriptPromise = null;
        reject(new Error('Could not load Razorpay Checkout. Check your internet connection and retry.'));
      };
      document.body.appendChild(script);
    });
  }
  return checkoutScriptPromise;
}

export default function RazorpayModal({
  open,
  onClose,
  onCancel,
  onError,
  amount,
  purpose,
  relatedId,
  description = 'Payment',
  onSuccess,
}) {
  const { user } = useApp();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [pendingVerification, setPendingVerification] = useState(null);
  const paymentIdRef = useRef(null);
  const pendingVerificationRef = useRef(null);
  const finishedRef = useRef(false);
  const cancelStartedRef = useRef(false);

  if (!open) return null;

  const finishAsCancelled = async (message) => {
    if (finishedRef.current || cancelStartedRef.current) return;
    cancelStartedRef.current = true;
    if (paymentIdRef.current || purpose !== 'membership') {
      try {
        await api.cancelPayment({
          paymentId: paymentIdRef.current || undefined,
          ...(purpose !== 'membership' ? { purpose, relatedId } : {}),
        });
      } catch (cancelError) {
        console.error('Could not cancel pending checkout:', cancelError);
      }
    }
    onCancel?.();
    onClose();
    if (message) onError?.(message);
  };

  const verifyCheckout = async (response) => {
    setBusy(true);
    setError('');
    try {
      const result = await api.verifyPayment({
        paymentId: paymentIdRef.current,
        gatewayOrderId: response.razorpay_order_id,
        gatewayPaymentId: response.razorpay_payment_id,
        gatewaySignature: response.razorpay_signature,
      });
      finishedRef.current = true;
      setPendingVerification(null);
      pendingVerificationRef.current = null;
      await onSuccess?.(result.data);
      onClose();
    } catch (verifyError) {
      setPendingVerification(response);
      pendingVerificationRef.current = response;
      setError(`Payment may have completed, but verification did not finish: ${verifyError.message}`);
    } finally {
      setBusy(false);
    }
  };

  const handlePay = async () => {
    if (busy) return;
    setBusy(true);
    setError('');
    try {
      await loadRazorpayCheckout();
      const orderRes = await api.createPaymentOrder({ purpose, relatedId });
      const payment = orderRes.data?.payment;
      if (!payment?.gatewayOrderId || !payment.keyId) {
        throw new Error('Backend did not return a valid Razorpay test order.');
      }
      paymentIdRef.current = payment._id;
      cancelStartedRef.current = false;

      const checkout = new window.Razorpay({
        key: payment.keyId,
        amount: payment.gatewayAmount,
        currency: payment.gatewayCurrency,
        name: 'Champions Club',
        description,
        order_id: payment.gatewayOrderId,
        prefill: {
          name: user?.name || '',
          email: user?.email || '',
          contact: user?.phone || '',
        },
        theme: { color: '#16a085' },
        modal: {
          ondismiss: () => {
            if (pendingVerificationRef.current) return;
            finishAsCancelled('Payment was cancelled. Your purchase was not completed.');
          },
        },
        handler: verifyCheckout,
      });
      checkout.on('payment.failed', (failure) => {
        const message = failure.error?.description || 'Razorpay did not complete the payment.';
        finishAsCancelled(message);
      });
      checkout.open();
      setBusy(false);
    } catch (checkoutError) {
      setBusy(false);
      setError(checkoutError.message || 'Could not start Razorpay Checkout.');
    }
  };

  const handleClose = () => {
    if (busy) return;
    if (pendingVerification) return;
    finishAsCancelled();
  };

  return (
    <Modal open={open} onClose={handleClose} size="sm">
      <div style={{ textAlign: 'center', marginBottom: 18 }}>
        <Badge tone="info" icon="Lock">Razorpay Test Mode</Badge>
        <h3 style={{ margin: '14px 0 4px', fontSize: '1.5rem' }}>{formatCurrency(amount)}</h3>
        <p className="tiny muted">{description}</p>
      </div>

      <div className="cb-card glass" style={{ padding: 14 }}>
        <div className="cb-row" style={{ gap: 10, alignItems: 'flex-start' }}>
          <Icon name="ShieldCheck" size={18} />
          <p className="tiny dim" style={{ margin: 0 }}>
            Continue to Razorpay’s secure test checkout. Your purchase is confirmed only after the backend verifies the payment.
          </p>
        </div>
      </div>

      {error ? (
        <div role="alert" style={{ marginTop: 12, padding: '9px 12px', borderRadius: 8, background: '#fee2e2', color: '#991b1b', fontSize: '0.8rem' }}>
          {error}
        </div>
      ) : null}

      <div style={{ marginTop: 20, display: 'flex', gap: 10 }}>
        <Button variant="ghost" block disabled={busy || Boolean(pendingVerification)} onClick={handleClose}>
        {pendingVerification ? 'Verify payment to continue' : 'Cancel'}
        </Button>
        {pendingVerification ? (
          <Button block icon="RefreshCw" disabled={busy} onClick={() => verifyCheckout(pendingVerification)}>
            {busy ? 'Verifying…' : 'Retry verification'}
          </Button>
        ) : (
          <Button block icon="Lock" disabled={busy} onClick={handlePay}>
            {busy ? 'Opening checkout…' : 'Continue to payment'}
          </Button>
        )}
      </div>
      <p className="tiny dim" style={{ textAlign: 'center', marginTop: 12 }}>
        Test credentials are entered only in Razorpay Checkout.
      </p>
    </Modal>
  );
}
