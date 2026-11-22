import mongoose, { Document, Schema } from 'mongoose';

// ---- Menu Item ----
export interface IMenuItem {
  name: string;
  description?: string;
  category: string;
  price: number;
  memberPrice?: number;
  image?: string;
  isAvailable: boolean;
  isActive: boolean;
  preparationTimeMinutes?: number;
  tags?: string[];
}
export interface MenuItemDocument extends IMenuItem, Document {}

const menuItemSchema = new Schema<MenuItemDocument>(
  {
    name: { type: String, required: true, trim: true },
    description: String,
    category: { type: String, required: true },
    price: { type: Number, required: true, min: 0 },
    memberPrice: { type: Number, min: 0 },
    image: String,
    isAvailable: { type: Boolean, default: true },
    isActive: { type: Boolean, default: true },
    preparationTimeMinutes: { type: Number, default: 10 },
    tags: [String],
  },
  { timestamps: true }
);

export const MenuItem = mongoose.model<MenuItemDocument>('MenuItem', menuItemSchema);

// ---- Table ----
export type TableStatus = 'available' | 'occupied' | 'reserved' | 'cleaning';

export interface ITable {
  tableNumber: string;
  capacity: number;
  status: TableStatus;
  currentOrder?: mongoose.Types.ObjectId;
  location?: string;
}
export interface TableDocument extends ITable, Document {}

const tableSchema = new Schema<TableDocument>(
  {
    tableNumber: { type: String, required: true, unique: true },
    capacity: { type: Number, required: true, min: 1 },
    status: { type: String, enum: ['available', 'occupied', 'reserved', 'cleaning'], default: 'available' },
    currentOrder: { type: Schema.Types.ObjectId, ref: 'CafeOrder' },
    location: String,
  },
  { timestamps: true }
);

export const Table = mongoose.model<TableDocument>('Table', tableSchema);

// ---- Cafe Order ----
export type CafeOrderStatus = 'created' | 'confirmed' | 'preparing' | 'ready' | 'served' | 'paid' | 'cancelled';

export interface ICafeOrderItem {
  menuItem: mongoose.Types.ObjectId;
  itemName: string;
  quantity: number;
  unitPrice: number;
  notes?: string;
  status: 'pending' | 'preparing' | 'ready' | 'served';
}

export interface ICafeOrder {
  orderNumber: string;
  table?: mongoose.Types.ObjectId;
  customer?: mongoose.Types.ObjectId;
  items: ICafeOrderItem[];
  subtotal: number;
  discount: number;
  total: number;
  status: CafeOrderStatus;
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
  paymentMethod?: string;
  paymentReference?: string;
  servedBy?: mongoose.Types.ObjectId;
  notes?: string;
  statusHistory: Array<{
    status: CafeOrderStatus;
    changedAt: Date;
    changedBy: mongoose.Types.ObjectId;
  }>;
}
export interface CafeOrderDocument extends ICafeOrder, Document {}

const cafeOrderSchema = new Schema<CafeOrderDocument>(
  {
    orderNumber: { type: String, required: true, unique: true },
    table: { type: Schema.Types.ObjectId, ref: 'Table' },
    customer: { type: Schema.Types.ObjectId, ref: 'User' },
    items: [
      {
        menuItem: { type: Schema.Types.ObjectId, ref: 'MenuItem', required: true },
        itemName: { type: String, required: true },
        quantity: { type: Number, required: true, min: 1 },
        unitPrice: { type: Number, required: true },
        notes: String,
        status: { type: String, enum: ['pending', 'preparing', 'ready', 'served'], default: 'pending' },
      },
    ],
    subtotal: { type: Number, required: true },
    discount: { type: Number, default: 0 },
    total: { type: Number, required: true },
    status: {
      type: String,
      enum: ['created', 'confirmed', 'preparing', 'ready', 'served', 'paid', 'cancelled'],
      default: 'created',
    },
    paymentStatus: { type: String, enum: ['pending', 'paid', 'failed', 'refunded'], default: 'pending' },
    paymentMethod: String,
    paymentReference: String,
    servedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    notes: String,
    statusHistory: [
      {
        status: String,
        changedAt: Date,
        changedBy: { type: Schema.Types.ObjectId, ref: 'User' },
      },
    ],
  },
  { timestamps: true }
);

cafeOrderSchema.index({ status: 1 });
cafeOrderSchema.index({ table: 1 });
cafeOrderSchema.index({ createdAt: -1 });

cafeOrderSchema.pre('validate', async function () {
  if (!this.orderNumber) {
    const count = await mongoose.model('CafeOrder').countDocuments();
    this.orderNumber = `CAFE-${Date.now()}-${String(count + 1).padStart(4, '0')}`;
  }
});

export const CafeOrder = mongoose.model<CafeOrderDocument>('CafeOrder', cafeOrderSchema);
