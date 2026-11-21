import { useMemo, useState } from 'react';
import { useApp } from '../../context/AppContext';
import { cafeCategories, cafeMenu, cafeTables, cafeOrderStatusFlow } from '../../data/cafeMenu';
import { planById } from '../../data/membershipPlans';
import { useDebounced } from '../../hooks/useUi';
import { formatCurrency, formatDate } from '../../utils/format';
import MenuItemCard from '../../components/cafe/MenuItemCard';
import CartPanel from '../../components/shop/CartPanel';
import { Badge, Card, CardTitle, EmptyState, PageHeader, Tabs } from '../../components/ui/primitives';
import { SearchInput } from '../../components/ui/form';
import Icon from '../../components/ui/Icon';

export default function Cafe() {
  const { cart, cartTotals, addToCart, setCartQty, removeFromCart, placeCafeOrder, cafeOrders, membership } = useApp();
  const [tab, setTab] = useState('menu');
  const [category, setCategory] = useState('all');
  const [query, setQuery] = useState('');
  const debounced = useDebounced(query, 200);

  const plan = planById(membership?.type);
  const memberPct = plan?.cafeDiscountPct ?? 0;

  const filtered = useMemo(() => {
    const q = debounced.trim().toLowerCase();
    return cafeMenu.filter((m) => {
      const inCat = category === 'all' || m.category === category;
      const inQuery = !q || `${m.name} ${m.description}`.toLowerCase().includes(q);
      return inCat && inQuery;
    });
  }, [category, debounced]);

  const activeOrder = cafeOrders[0];
  const activeStep = activeOrder ? Math.max(0, cafeOrderStatusFlow.indexOf(activeOrder.status)) : -1;

  return (
    <>
      <PageHeader
        icon="Coffee"
        title="Cafeteria & Bar"
        subtitle="Order courtside, pick a table and track your order — member pricing applied."
        badge={<Badge tone="gold">{memberPct}% member discount</Badge>}
      />

      <Tabs
        value={tab}
        onChange={setTab}
        tabs={[
          { id: 'menu', label: 'Menu', icon: 'Utensils' },
          { id: 'track', label: 'My orders', icon: 'Package', count: cafeOrders.length },
        ]}
      />

      {tab === 'menu' ? (
        <div className="cb-grid" style={{ gridTemplateColumns: 'minmax(0, 2fr) minmax(0, 1fr)', gap: 22, marginTop: 18 }}>
          <div className="cb-stack">
            <div className="cb-row between wrap" style={{ gap: 12 }}>
              <div className="pill-row">
                {cafeCategories.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    className={`chip ${category === c.id ? 'active' : ''}`}
                    onClick={() => setCategory(c.id)}
                  >
                    {c.label}
                  </button>
                ))}
              </div>
              <SearchInput value={query} onChange={setQuery} placeholder="Search the menu…" />
            </div>

            {filtered.length ? (
              <div className="cb-grid cols-3" style={{ gap: 18 }}>
                {filtered.map((m) => (
                  <MenuItemCard
                    key={m.id}
                    item={m}
                    memberPct={memberPct}
                    onAdd={() => addToCart({ id: m.id, name: m.name, price: m.price, image: m.image, meta: m.category }, 'cafe')}
                  />
                ))}
              </div>
            ) : (
              <Card glass>
                <EmptyState
                  icon="Search"
                  title="Nothing on the menu matches"
                  message="Try another category or clear your search."
                  action={
                    <button className="btn btn-outline btn-sm" type="button" onClick={() => { setQuery(''); setCategory('all'); }}>
                      Reset filters
                    </button>
                  }
                />
              </Card>
            )}
          </div>

          <div className="cb-stack">
            <CartPanel
              channel="cafe"
              cart={cart.channel === 'cafe' ? cart : { items: [] }}
              totals={cart.channel === 'cafe' ? cartTotals : { subtotal: 0, discount: 0, discountPct: 0, total: 0, count: 0 }}
              onQty={setCartQty}
              onRemove={removeFromCart}
              onPlace={placeCafeOrder}
              tableOptions={cafeTables}
              title="Your order"
            />
          </div>
        </div>
      ) : (
        <div className="cb-stack" style={{ marginTop: 18 }}>
          {activeOrder ? (
            <Card glass glow>
              <CardTitle
                icon="Package"
                title={`Order ${activeOrder.id}`}
                hint={`Table ${activeOrder.table} · ${formatDate(activeOrder.date)}`}
                right={<Badge tone={activeOrder.status === 'served' ? 'active' : 'info'}>{activeOrder.status}</Badge>}
              />
              <div className="cb-row wrap" style={{ gap: 10, marginBottom: 16 }}>
                {cafeOrderStatusFlow.map((step, i) => (
                  <div key={step} className="cb-row" style={{ gap: 8, flex: 1, minWidth: 130 }}>
                    <span
                      className={`stat-icon ${i <= activeStep ? 'green' : ''}`}
                      style={{ width: 30, height: 30, borderRadius: 9, flex: 'none' }}
                    >
                      <Icon name={i <= activeStep ? 'Check' : 'Clock'} size={13} />
                    </span>
                    <div>
                      <div className="small semibold" style={{ textTransform: 'capitalize' }}>{step}</div>
                      <div className="tiny dim">{i <= activeStep ? 'Done' : 'Pending'}</div>
                    </div>
                  </div>
                ))}
              </div>
              <hr className="cb-hairline" />
              {activeOrder.items.map((i) => (
                <div key={i.id} className="cb-row between small" style={{ padding: '6px 0' }}>
                  <span>{i.qty} × {i.name}</span>
                  <span className="mono">{formatCurrency(i.price * i.qty)}</span>
                </div>
              ))}
              <div className="cb-row between" style={{ marginTop: 10 }}>
                <span className="semibold">Total</span>
                <span className="semibold">{formatCurrency(activeOrder.total)}</span>
              </div>
            </Card>
          ) : null}

          <Card glass>
            <CardTitle icon="Receipt" title="Order history" hint={`${cafeOrders.length} orders`} />
            <div className="cb-stack" style={{ gap: 12 }}>
              {cafeOrders.map((o) => (
                <div key={o.id} className="cb-card glass" style={{ padding: 14 }}>
                  <div className="cb-row between wrap" style={{ gap: 10 }}>
                    <div>
                      <div className="small semibold mono">{o.id}</div>
                      <div className="tiny dim">
                        Table {o.table} · {formatDate(o.date)} · {o.items.length} item{o.items.length === 1 ? '' : 's'}
                      </div>
                    </div>
                    <div className="cb-row" style={{ gap: 10 }}>
                      <Badge tone={o.paid ? 'active' : 'warning'}>{o.paid ? 'Paid' : 'Payment pending'}</Badge>
                      <Badge tone={o.status === 'served' ? 'active' : 'info'}>{o.status}</Badge>
                      <span className="semibold">{formatCurrency(o.total)}</span>
                    </div>
                  </div>
                </div>
              ))}
              {!cafeOrders.length ? (
                <EmptyState icon="Coffee" title="No cafe orders yet" message="Order something from the menu to see it here." />
              ) : null}
            </div>
          </Card>
        </div>
      )}
    </>
  );
}
