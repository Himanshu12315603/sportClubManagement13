import { useMemo, useState } from 'react';
import {
  Badge, Button, Card, CardTitle, EmptyState, PageHeader, StatCard,
} from '../../components/ui/primitives';
import { Field, Input } from '../../components/ui/form';
import Modal from '../../components/ui/Modal';
import DataTable from '../../components/ui/DataTable';
import { useApp } from '../../context/AppContext';
import { cafeMenu, cafeTables, cafeOrderStatusFlow } from '../../data/cafeMenu';
import { formatCurrency, titleCase } from '../../utils/format';

const statusTone = { received: 'warning', preparing: 'info', ready: 'active', served: 'neutral' };

export default function ManagerCafeteria() {
  const { kitchen, advanceKitchenOrder, toast } = useApp();
  const [priceOverrides, setPriceOverrides] = useState({});
  const [editItem, setEditItem] = useState(null);
  const [priceDraft, setPriceDraft] = useState('');

  const revenue = kitchen.reduce((n, o) => n + (o.amount || 0), 0);
  const byStatus = useMemo(() => {
    const map = {};
    cafeOrderStatusFlow.forEach((s) => { map[s] = kitchen.filter((o) => o.status === s); });
    return map;
  }, [kitchen]);

  const openPrice = (item) => {
    setPriceDraft(String(priceOverrides[item.id] ?? item.price));
    setEditItem(item);
  };
  const submitPrice = () => {
    setPriceOverrides((prev) => ({ ...prev, [editItem.id]: Number(priceDraft) || 0 }));
    toast('Menu price updated', `${editItem.name} is now ${formatCurrency(Number(priceDraft) || 0)}.`, 'success');
    setEditItem(null);
  };

  const menuColumns = [
    {
      key: 'name',
      label: 'Item',
      render: (m) => (
        <div>
          <div className="small semibold">{m.name}</div>
          <div className="tiny dim">{titleCase(m.category)}</div>
        </div>
      ),
    },
    { key: 'veg', label: 'Type', render: (m) => <Badge tone={m.veg ? 'active' : 'danger'}>{m.veg ? 'Veg' : 'Non-veg'}</Badge> },
    { key: 'prep', label: 'Prep', align: 'center', render: (m) => <span className="small mono">{m.prepMins}m</span> },
    { key: 'rating', label: 'Rating', align: 'center', render: (m) => <span className="small mono">{m.rating} ★</span> },
    { key: 'price', label: 'Price', align: 'right', render: (m) => <span className="small mono semibold">{formatCurrency(priceOverrides[m.id] ?? m.price)}</span> },
    { key: 'actions', label: '', align: 'right', render: (m) => <Button size="sm" variant="ghost" icon="Edit" onClick={() => openPrice(m)}>Edit price</Button> },
  ];

  return (
    <div className="cb-stack" style={{ gap: 20 }}>
      <PageHeader
        icon="Coffee"
        title="Cafeteria operations"
        subtitle="Track the live kitchen board, table turnover and the menu."
        badge={<Badge tone="info">{kitchen.length} live orders</Badge>}
      />

      <div className="cb-grid cols-4">
        <StatCard icon="Utensils" label="Live orders" value={kitchen.length} detail="On the board now" />
        <StatCard icon="Flame" tone="gold" label="Preparing" value={byStatus.preparing.length} detail="In the kitchen" delay={0.05} />
        <StatCard icon="CheckCircle2" tone="green" label="Ready" value={byStatus.ready.length} detail="Awaiting pickup" delay={0.1} />
        <StatCard icon="Wallet" label="Cafe revenue" value={formatCurrency(revenue, true)} detail="Live board total" delay={0.15} />
      </div>

      <Card glass>
        <CardTitle
          icon="Utensils"
          title="Live kitchen board"
          hint="Advance an order through the pipeline"
          right={
            <div className="pill-row">
              {cafeOrderStatusFlow.map((s) => <span key={s} className="chip active">{titleCase(s)} · {byStatus[s].length}</span>)}
            </div>
          }
        />
        <div className="cb-grid cols-4">
          {cafeOrderStatusFlow.map((status) => (
            <div key={status} className="cb-stack" style={{ gap: 12 }}>
              <div className="cb-row between">
                <span className="small semibold">{titleCase(status)}</span>
                <Badge tone={statusTone[status]}>{byStatus[status].length}</Badge>
              </div>
              {byStatus[status].length === 0 ? (
                <div className="cb-card glass" style={{ padding: 14 }}>
                  <span className="tiny dim">No orders</span>
                </div>
              ) : (
                byStatus[status].map((o) => (
                  <div key={o.id} className="cb-card glass" style={{ padding: 14 }}>
                    <div className="cb-row between" style={{ marginBottom: 6 }}>
                      <span className="small semibold mono">{o.id}</span>
                      <Badge tone="neutral" icon="Coffee">Table {o.table}</Badge>
                    </div>
                    <div className="tiny dim" style={{ marginBottom: 8 }}>{o.items}</div>
                    <div className="cb-row between" style={{ marginBottom: 10 }}>
                      <span className="tiny dim">{o.placedMinsAgo}m ago</span>
                      <span className="tiny mono semibold">{formatCurrency(o.amount)}</span>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      icon="ArrowRight"
                      block
                      disabled={status === 'served'}
                      onClick={() => advanceKitchenOrder(o.id)}
                    >
                      {status === 'served' ? 'Served' : 'Advance'}
                    </Button>
                  </div>
                ))
              )}
            </div>
          ))}
        </div>
      </Card>

      <Card glass>
        <CardTitle icon="MapPin" title="Table occupancy" hint="Seating across the terrace, garden and indoor lounge" />
        <div className="cb-grid cb-auto" style={{ gap: 14 }}>
          {cafeTables.map((t, i) => {
            const occupied = i % 3 === 0;
            return (
              <div key={t.id} className="cb-card glass" style={{ padding: 14 }}>
                <div className="cb-row between" style={{ marginBottom: 6 }}>
                  <span className="small semibold mono">{t.id}</span>
                  <Badge tone={occupied ? 'danger' : 'active'}>{occupied ? 'Occupied' : 'Free'}</Badge>
                </div>
                <div className="small">{t.label}</div>
                <div className="tiny dim">{t.zone} · {t.seats} seats</div>
              </div>
            );
          })}
        </div>
      </Card>

      <Card glass>
        <CardTitle icon="Salad" title="Menu" hint={`${cafeMenu.length} items`} />
        <DataTable
          columns={menuColumns}
          rows={cafeMenu}
          empty={<EmptyState icon="Salad" title="No menu items" message="The cafeteria menu is empty." />}
        />
      </Card>

      <Modal
        open={Boolean(editItem)}
        onClose={() => setEditItem(null)}
        title="Edit menu price"
        subtitle={editItem?.name}
        icon="Edit"
        footer={
          <>
            <Button variant="ghost" onClick={() => setEditItem(null)}>Cancel</Button>
            <Button icon="Save" onClick={submitPrice}>Save price</Button>
          </>
        }
      >
        <Field label="Price (₹)" required>
          <Input type="number" value={priceDraft} onChange={(e) => setPriceDraft(e.target.value)} />
        </Field>
      </Modal>
    </div>
  );
}
