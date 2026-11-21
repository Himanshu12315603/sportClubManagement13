import { useMemo, useState } from 'react';
import {
  Badge, Button, Card, CardTitle, EmptyState, PageHeader, StatCard,
} from '../../components/ui/primitives';
import { Field, FormRow, Input, SearchInput, validateFields } from '../../components/ui/form';
import Modal from '../../components/ui/Modal';
import DataTable from '../../components/ui/DataTable';
import { useApp } from '../../context/AppContext';
import { lowStockItems } from '../../data/analytics';
import { formatCurrency, formatDate } from '../../utils/format';
import { useDebounced } from '../../hooks/useUi';

const orderTone = { packing: 'warning', ready: 'info', dispatched: 'info', delivered: 'active' };
const emptyForm = { name: '', brand: 'ClubBloom', category: 'Rackets', price: '', mrp: '', stock: '' };

export default function ManagerShop() {
  const { productList, updateProduct, addProduct, shopQueue, advanceShopOrder, pushNotification, toast } = useApp();
  const [q, setQ] = useState('');
  const [editId, setEditId] = useState(null);
  const [editForm, setEditForm] = useState({ price: '', stock: '' });
  const [addOpen, setAddOpen] = useState(false);
  const [addForm, setAddForm] = useState(emptyForm);
  const [errors, setErrors] = useState({});
  const debounced = useDebounced(q);

  const rows = useMemo(() => {
    const needle = debounced.trim().toLowerCase();
    if (!needle) return productList;
    return productList.filter((p) => [p.name, p.brand, p.category, p.id].some((v) => String(v).toLowerCase().includes(needle)));
  }, [productList, debounced]);

  const stockValue = productList.reduce((n, p) => n + p.price * p.stock, 0);
  const pendingOrders = shopQueue.filter((o) => o.status !== 'delivered').length;

  const openEdit = (p) => { setEditForm({ price: p.price, stock: p.stock }); setEditId(p.id); };
  const submitEdit = () => {
    updateProduct(editId, { price: Number(editForm.price) || 0, stock: Number(editForm.stock) || 0 });
    toast('Product updated', 'Price and stock changes saved.', 'success');
    setEditId(null);
  };

  const submitAdd = () => {
    const { valid, errors: errs } = validateFields(addForm, {
      name: { required: true, message: 'Enter the product name.' },
      category: { required: true },
      price: { required: true, min: 0, message: 'Enter a valid price.' },
    });
    if (!valid) { setErrors(errs); return; }
    addProduct(addForm);
    setAddForm(emptyForm);
    setErrors({});
    setAddOpen(false);
  };

  const raiseReorder = (item) => {
    pushNotification('low_stock', `Reorder raised for ${item.name} — ${item.threshold - item.stock} units needed.`, 'manager');
    toast('Reorder raised', `Purchase order drafted for ${item.name}.`, 'success');
  };

  const productColumns = [
    {
      key: 'name',
      label: 'Product',
      render: (p) => (
        <div>
          <div className="small semibold">{p.name}</div>
          <div className="tiny dim">{p.brand}</div>
        </div>
      ),
    },
    { key: 'category', label: 'Category', render: (p) => <Badge tone="neutral">{p.category}</Badge> },
    { key: 'price', label: 'Price', align: 'right', render: (p) => <span className="small mono">{formatCurrency(p.price)}</span> },
    {
      key: 'stock',
      label: 'Stock',
      render: (p) => <Badge tone={p.stock < 10 ? 'danger' : 'active'}>{p.stock} units</Badge>,
    },
    { key: 'rating', label: 'Rating', align: 'center', render: (p) => <span className="small mono">{p.rating} ★</span> },
    { key: 'actions', label: '', align: 'right', render: (p) => <Button size="sm" variant="ghost" icon="Edit" onClick={() => openEdit(p)}>Edit stock</Button> },
  ];

  const queueColumns = [
    { key: 'id', label: 'Order', render: (o) => <span className="small semibold mono">{o.id}</span> },
    { key: 'customer', label: 'Customer', render: (o) => <span className="small">{o.customer}</span> },
    { key: 'items', label: 'Items', align: 'center', render: (o) => <span className="small mono">{o.items}</span> },
    { key: 'total', label: 'Total', align: 'right', render: (o) => <span className="small mono semibold">{formatCurrency(o.total)}</span> },
    { key: 'fulfilment', label: 'Fulfilment', render: (o) => <Badge tone="neutral" icon={o.fulfilment === 'pickup' ? 'Store' : 'Truck'}>{o.fulfilment}</Badge> },
    { key: 'placed', label: 'Placed', render: (o) => <span className="tiny dim">{formatDate(o.placed)}</span> },
    { key: 'status', label: 'Status', render: (o) => <Badge tone={orderTone[o.status] || 'neutral'}>{o.status}</Badge> },
    {
      key: 'actions',
      label: '',
      align: 'right',
      render: (o) => (o.status === 'delivered' ? <span className="tiny dim">—</span> : <Button size="sm" variant="outline" icon="ArrowRight" onClick={() => advanceShopOrder(o.id)}>Advance</Button>),
    },
  ];

  return (
    <div className="cb-stack" style={{ gap: 20 }}>
      <PageHeader
        icon="ShoppingBag"
        title="Shop & inventory"
        subtitle="Manage the pro shop catalogue, stock levels and order fulfilment."
        badge={<Badge tone="info">{productList.length} SKUs</Badge>}
        actions={<Button icon="Plus" onClick={() => { setAddForm(emptyForm); setErrors({}); setAddOpen(true); }}>Add product</Button>}
      />

      <div className="cb-grid cols-4">
        <StatCard icon="Package" label="SKUs" value={productList.length} detail="In the catalogue" />
        <StatCard icon="AlertTriangle" tone="neon" label="Low stock" value={lowStockItems.length} detail="Below reorder threshold" delay={0.05} />
        <StatCard icon="Truck" tone="gold" label="Pending orders" value={pendingOrders} detail={`${shopQueue.length} in the queue`} delay={0.1} />
        <StatCard icon="Wallet" tone="green" label="Stock value" value={formatCurrency(stockValue, true)} detail="At selling price" delay={0.15} />
      </div>

      <div className="cb-grid" style={{ gridTemplateColumns: 'minmax(0,1fr) minmax(0,1.6fr)', gap: 20, alignItems: 'start' }}>
        <Card glass>
          <CardTitle icon="AlertTriangle" iconTone="neon" title="Low-stock panel" hint="Reorder guidance" />
          {lowStockItems.length === 0 ? (
            <EmptyState icon="Package" title="Stock healthy" message="No items are below their reorder threshold." />
          ) : (
            <div className="cb-stack" style={{ gap: 12 }}>
              {lowStockItems.map((item) => (
                <div key={item.id} className="cb-card glass" style={{ padding: 14 }}>
                  <div className="cb-row between" style={{ marginBottom: 8 }}>
                    <div>
                      <div className="small semibold">{item.name}</div>
                      <div className="tiny dim">{item.category} · {item.id}</div>
                    </div>
                    <Badge tone="danger">{item.stock} left</Badge>
                  </div>
                  <div className="cb-row between">
                    <span className="tiny dim">Threshold {item.threshold}</span>
                    <Button size="sm" variant="outline" icon="RefreshCw" onClick={() => raiseReorder(item)}>Raise reorder</Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        <Card glass>
          <CardTitle
            icon="Package"
            title="Catalogue"
            hint={`${rows.length} products`}
            right={<SearchInput value={q} onChange={setQ} placeholder="Search product or brand…" />}
          />
          <DataTable
            columns={productColumns}
            rows={rows}
            empty={<EmptyState icon="Package" title="No products found" message="Try a different search term." action={<Button icon="Plus" onClick={() => setAddOpen(true)}>Add product</Button>} />}
          />
        </Card>
      </div>

      <Card glass>
        <CardTitle icon="Truck" title="Order queue" hint={`${pendingOrders} awaiting fulfilment`} />
        <DataTable
          columns={queueColumns}
          rows={shopQueue}
          empty={<EmptyState icon="Truck" title="No orders in the queue" message="New shop orders will appear here." />}
        />
      </Card>

      <Modal
        open={Boolean(editId)}
        onClose={() => setEditId(null)}
        title="Edit product"
        subtitle={productList.find((p) => p.id === editId)?.name}
        icon="Edit"
        footer={
          <>
            <Button variant="ghost" onClick={() => setEditId(null)}>Cancel</Button>
            <Button icon="Save" onClick={submitEdit}>Save</Button>
          </>
        }
      >
        <FormRow>
          <Field label="Price (₹)" required><Input type="number" value={editForm.price} onChange={(e) => setEditForm((f) => ({ ...f, price: e.target.value }))} /></Field>
          <Field label="Stock (units)" required><Input type="number" value={editForm.stock} onChange={(e) => setEditForm((f) => ({ ...f, stock: e.target.value }))} /></Field>
        </FormRow>
      </Modal>

      <Modal
        open={addOpen}
        onClose={() => setAddOpen(false)}
        title="Add product"
        subtitle="List a new item in the pro shop"
        icon="Plus"
        footer={
          <>
            <Button variant="ghost" onClick={() => setAddOpen(false)}>Cancel</Button>
            <Button icon="Save" onClick={submitAdd}>Add product</Button>
          </>
        }
      >
        <FormRow>
          <Field label="Name" required error={errors.name}><Input value={addForm.name} onChange={(e) => setAddForm((f) => ({ ...f, name: e.target.value }))} placeholder="e.g. ClubBloom Tour Bag" /></Field>
          <Field label="Brand"><Input value={addForm.brand} onChange={(e) => setAddForm((f) => ({ ...f, brand: e.target.value }))} /></Field>
        </FormRow>
        <FormRow>
          <Field label="Category" required error={errors.category}><Input value={addForm.category} onChange={(e) => setAddForm((f) => ({ ...f, category: e.target.value }))} placeholder="e.g. Bags" /></Field>
          <Field label="Price (₹)" required error={errors.price}><Input type="number" value={addForm.price} onChange={(e) => setAddForm((f) => ({ ...f, price: e.target.value }))} /></Field>
        </FormRow>
        <FormRow>
          <Field label="MRP (₹)"><Input type="number" value={addForm.mrp} onChange={(e) => setAddForm((f) => ({ ...f, mrp: e.target.value }))} /></Field>
          <Field label="Stock (units)"><Input type="number" value={addForm.stock} onChange={(e) => setAddForm((f) => ({ ...f, stock: e.target.value }))} /></Field>
        </FormRow>
      </Modal>
    </div>
  );
}
