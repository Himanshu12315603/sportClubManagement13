import { useState } from 'react';
import { Badge, Button, Card, CardTitle, EmptyState, KeyValue } from '../ui/primitives';
import { Field, Select } from '../ui/form';
import Icon from '../ui/Icon';
import { deliveryOptions } from '../../data/products';
import { formatCurrency } from '../../utils/format';

/**
 * Channel-aware cart + checkout panel.
 * `channel` is either 'shop' (delivery/pickup + delivery fee) or 'cafe' (table service).
 */
export default function CartPanel({
  channel = 'shop',
  cart,
  totals,
  onQty,
  onRemove,
  onPlace,
  tableOptions = [],
  title = 'Your kit',
}) {
  const [fulfilment, setFulfilment] = useState('pickup');
  const [method, setMethod] = useState('upi');
  const [table, setTable] = useState(tableOptions[0]?.id || '');
  const [error, setError] = useState('');

  const deliveryFee = channel === 'shop' ? deliveryOptions.find((o) => o.id === fulfilment)?.fee || 0 : 0;
  const grandTotal = (totals?.total || 0) + deliveryFee;

  if (!cart?.items?.length) {
    return (
      <Card glass>
        <CardTitle icon="ShoppingBag" title={title} />
        <EmptyState
          icon="ShoppingBag"
          title="Your cart is empty"
          message={channel === 'shop' ? 'Add kit from the shop to check out.' : 'Add dishes from the menu to order.'}
        />
      </Card>
    );
  }

  const submit = () => {
    setError('');
    const res =
      channel === 'shop'
        ? onPlace({ fulfilment, paymentMethod: method.toUpperCase(), deliveryFee })
        : onPlace({ table, paymentMethod: method.toUpperCase() });
    if (res && !res.ok) setError(res.error || 'Could not place the order.');
  };

  return (
    <Card glass glow>
      <CardTitle
        icon={channel === 'shop' ? 'ShoppingBag' : 'Utensils'}
        title={title}
        hint={`${totals.count} item${totals.count === 1 ? '' : 's'}`}
        right={<Badge tone="info">{totals.discountPct}% off</Badge>}
      />

      <div className="cb-stack" style={{ gap: 12, marginBottom: 16 }}>
        {cart.items.map((i) => (
          <div key={i.id} className="cb-row" style={{ gap: 12, alignItems: 'center' }}>
            {i.image ? (
              <span className="product-thumb" style={{ width: 46, height: 46, borderRadius: 10, flex: 'none', overflow: 'hidden' }}>
                <img src={i.image} alt={i.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </span>
            ) : null}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div className="small semibold" style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{i.name}</div>
              <div className="tiny dim">{formatCurrency(i.price)} each</div>
            </div>
            <div className="cb-row" style={{ gap: 6 }}>
              <Button size="sm" variant="ghost" icon="Minus" onClick={() => onQty(i.id, Math.max(1, i.qty - 1))} />
              <span className="small mono" style={{ width: 22, textAlign: 'center' }}>{i.qty}</span>
              <Button size="sm" variant="ghost" icon="Plus" onClick={() => onQty(i.id, i.qty + 1)} />
            </div>
            <Button size="sm" variant="ghost" icon="Trash2" onClick={() => onRemove(i.id)} />
          </div>
        ))}
      </div>

      {channel === 'shop' ? (
        <Field label="Fulfilment">
          <Select
            value={fulfilment}
            onChange={(e) => setFulfilment(e.target.value)}
            options={deliveryOptions.map((o) => ({ value: o.id, label: `${o.label} — ${o.fee ? formatCurrency(o.fee) : 'Free'}` }))}
          />
        </Field>
      ) : (
        <Field label="Table" hint="Your order is delivered to the table you pick.">
          <Select
            value={table}
            onChange={(e) => setTable(e.target.value)}
            options={tableOptions.map((t) => ({ value: t.id, label: `${t.label} · ${t.seats} seats · ${t.zone}` }))}
          />
        </Field>
      )}

      <Field label="Payment method">
        <Select
          value={method}
          onChange={(e) => setMethod(e.target.value)}
          options={[
            { value: 'upi', label: 'UPI — GPay / PhonePe' },
            { value: 'card', label: 'Card' },
            { value: 'cash', label: 'Cash' },
          ]}
        />
      </Field>

      <hr className="cb-hairline" />
      <KeyValue label="Subtotal" value={formatCurrency(totals.subtotal)} mono />
      <KeyValue label={`Member discount (${totals.discountPct}%)`} value={`− ${formatCurrency(totals.discount)}`} />
      {channel === 'shop' && deliveryFee ? <KeyValue label="Delivery" value={formatCurrency(deliveryFee)} mono /> : null}
      <div className="cb-row between" style={{ marginTop: 12 }}>
        <span className="semibold">Total</span>
        <span className="semibold" style={{ fontSize: '1.3rem' }}>{formatCurrency(grandTotal)}</span>
      </div>

      {error ? <p className="tiny text-neon" style={{ marginTop: 10 }}>{error}</p> : null}

      <Button icon="Check" block style={{ marginTop: 16 }} onClick={submit}>
        {channel === 'shop' ? 'Place order' : 'Send to kitchen'}
      </Button>
      <p className="tiny dim" style={{ marginTop: 10, textAlign: 'center' }}>
        <Icon name="Lock" size={12} style={{ verticalAlign: '-2px', marginRight: 4 }} />
        Secure demo checkout · no real payment is taken
      </p>
    </Card>
  );
}
