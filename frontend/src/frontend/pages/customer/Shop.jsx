import { useMemo, useState } from 'react';
import { useApp } from '../../context/AppContext';
import { shopCategories } from '../../data/products';
import { planById } from '../../data/membershipPlans';
import { useDebounced } from '../../hooks/useUi';
import { formatCurrency, formatDate } from '../../utils/format';
import { genImage, fallbackLandscape } from '../../utils/images';
import { useImage } from '../../hooks/useImage';
import ProductCard from '../../components/shop/ProductCard';
import CartPanel from '../../components/shop/CartPanel';
import { Badge, Card, CardTitle, EmptyState, PageHeader, Tabs } from '../../components/ui/primitives';
import { SearchInput } from '../../components/ui/form';
import DataTable from '../../components/ui/DataTable';

const SHOP_STATUS_TONE = { packing: 'warning', ready: 'info', dispatched: 'info', delivered: 'active' };

const heroGen = genImage(
  'premium sports pro shop interior, tennis rackets and sports shoes on illuminated shelves, sportswear displays, warm dramatic lighting, wide cinematic photograph',
  'landscape_16_9',
);

export default function Shop() {
  const { productList, cart, cartTotals, addToCart, setCartQty, removeFromCart, placeShopOrder, shopOrders, membership } = useApp();
  const [tab, setTab] = useState('browse');
  const [category, setCategory] = useState('all');
  const [query, setQuery] = useState('');
  const debounced = useDebounced(query, 200);

  const plan = planById(membership?.type);
  const memberPct = plan?.shopDiscountPct ?? 0;
  const { src: heroImage } = useImage(heroGen, fallbackLandscape('sports-shop'));

  const filtered = useMemo(() => {
    const q = debounced.trim().toLowerCase();
    return productList.filter((p) => {
      const inCat = category === 'all' || p.category === category;
      const inQuery = !q || `${p.name} ${p.brand} ${p.sport} ${p.description}`.toLowerCase().includes(q);
      return inCat && inQuery;
    });
  }, [productList, category, debounced]);

  const orderColumns = [
    { key: 'id', label: 'Order', render: (r) => <span className="mono tiny">{r.id}</span> },
    { key: 'date', label: 'Date', render: (r) => formatDate(r.date) },
    {
      key: 'items',
      label: 'Items',
      render: (r) => <span className="small">{r.items.map((i) => `${i.qty}× ${i.name}`).join(', ')}</span>,
    },
    { key: 'fulfilment', label: 'Fulfilment', render: (r) => <Badge tone="neutral">{r.fulfilment}</Badge> },
    { key: 'total', label: 'Total', align: 'right', render: (r) => <span className="semibold">{formatCurrency(r.total)}</span> },
    {
      key: 'status',
      label: 'Status',
      align: 'right',
      render: (r) => <Badge tone={SHOP_STATUS_TONE[r.status] || 'neutral'}>{r.status}</Badge>,
    },
  ];

  return (
    <>
      <PageHeader
        icon="ShoppingBag"
        title="Sports Shop"
        subtitle="Gear, footwear and apparel with your member discount applied at checkout."
        badge={<Badge tone="gold">{memberPct}% member discount</Badge>}
      />

      <Card glass glow style={{ padding: 0, overflow: 'hidden', marginTop: 4 }}>
        <div className="cb-shop-hero cb-shop-hero-sm">
          <img src={heroImage} alt="ClubBloom pro shop" loading="lazy" />
          <div className="cb-shop-hero-overlay">
            <Badge tone="gold" icon="Sparkles">{memberPct}% member pricing active</Badge>
            <h3 style={{ margin: '10px 0 6px' }}>Your member pro shop</h3>
            <p className="tiny" style={{ maxWidth: 470 }}>
              Every product below already includes your member discount, applied automatically at checkout.
            </p>
          </div>
        </div>
      </Card>

      <Tabs
        value={tab}
        onChange={setTab}
        tabs={[
          { id: 'browse', label: 'Browse', icon: 'Store' },
          { id: 'orders', label: 'My orders', icon: 'Package', count: shopOrders.length },
        ]}
      />

      {tab === 'browse' ? (
        <div className="cb-grid" style={{ gridTemplateColumns: 'minmax(0, 2fr) minmax(0, 1fr)', gap: 22, marginTop: 18 }}>
          <div className="cb-stack">
            <div className="cb-row between wrap" style={{ gap: 12 }}>
              <div className="pill-row">
                {shopCategories.map((c) => (
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
              <SearchInput value={query} onChange={setQuery} placeholder="Search products…" />
            </div>

            {filtered.length ? (
              <div className="cb-grid cols-3" style={{ gap: 18 }}>
                {filtered.map((p) => (
                  <ProductCard
                    key={p.id}
                    product={p}
                    memberPct={memberPct}
                    onAdd={() => addToCart({ id: p.id, name: p.name, price: p.price, image: p.image, meta: p.brand }, 'shop')}
                  />
                ))}
              </div>
            ) : (
              <Card glass>
                <EmptyState
                  icon="Search"
                  title="No products found"
                  message="Try a different category or clear your search."
                  action={
                    <button className="btn btn-outline btn-sm" type="button" onClick={() => { setQuery(''); setCategory('all'); }}>
                      Reset filters
                    </button>
                  }
                />
              </Card>
            )}
          </div>

          <CartPanel
            channel="shop"
            cart={cart.channel === 'shop' ? cart : { items: [] }}
            totals={cart.channel === 'shop' ? cartTotals : { subtotal: 0, discount: 0, discountPct: 0, total: 0, count: 0 }}
            onQty={setCartQty}
            onRemove={removeFromCart}
            onPlace={placeShopOrder}
            title="Your kit"
          />
        </div>
      ) : (
        <div style={{ marginTop: 18 }}>
          <Card glass>
            <CardTitle icon="Package" title="Shop order history" hint="Pickup and delivery orders" />
            <DataTable
              columns={orderColumns}
              rows={shopOrders}
              empty={<EmptyState icon="ShoppingBag" title="No orders yet" message="Your placed orders will appear here." />}
            />
          </Card>
        </div>
      )}
    </>
  );
}
