import mongoose, { Document, Schema } from 'mongoose';

export interface ICategory {
  name: string;
  slug: string;
  description?: string;
  isActive: boolean;
}
export interface CategoryDocument extends ICategory, Document {}

const categorySchema = new Schema<CategoryDocument>(
  {
    name: { type: String, required: true, trim: true, unique: true },
    slug: { type: String, required: true, unique: true, lowercase: true },
    description: String,
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const Category = mongoose.model<CategoryDocument>('Category', categorySchema);

// ---- Product ----

export interface IProduct {
  name: string;
  description?: string;
  category: mongoose.Types.ObjectId;
  sku: string;
  price: number;
  memberPrice?: number;
  images: string[];
  stock: number;
  lowStockThreshold: number;
  isAvailableOnline: boolean;
  isAvailableInStore: boolean;
  isActive: boolean;
  weight?: number;
  brand?: string;
  tags?: string[];
}
export interface ProductDocument extends IProduct, Document {}

const productSchema = new Schema<ProductDocument>(
  {
    name: { type: String, required: true, trim: true },
    description: String,
    category: { type: Schema.Types.ObjectId, ref: 'Category', required: true },
    sku: { type: String, required: true, unique: true, trim: true },
    price: { type: Number, required: true, min: 0 },
    memberPrice: { type: Number, min: 0 },
    images: [String],
    stock: { type: Number, required: true, min: 0, default: 0 },
    lowStockThreshold: { type: Number, default: 5 },
    isAvailableOnline: { type: Boolean, default: true },
    isAvailableInStore: { type: Boolean, default: true },
    isActive: { type: Boolean, default: true },
    weight: Number,
    brand: String,
    tags: [String],
  },
  { timestamps: true }
);

productSchema.index({ category: 1 });
productSchema.index({ isActive: 1 });
productSchema.index({ stock: 1 });
productSchema.index({ name: 'text', description: 'text', brand: 'text' });

export const Product = mongoose.model<ProductDocument>('Product', productSchema);

// ---- Inventory Transaction ----

export type InventoryTxType = 'purchase' | 'sale' | 'return' | 'adjustment' | 'damage';

export interface IInventoryTransaction {
  product: mongoose.Types.ObjectId;
  type: InventoryTxType;
  quantity: number;         // positive = in, negative = out
  previousStock: number;
  newStock: number;
  reference?: string;       // order ID, PO number, etc.
  notes?: string;
  performedBy: mongoose.Types.ObjectId;
}
export interface InventoryTransactionDocument extends IInventoryTransaction, Document {}

const inventoryTransactionSchema = new Schema<InventoryTransactionDocument>(
  {
    product: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
    type: { type: String, enum: ['purchase', 'sale', 'return', 'adjustment', 'damage'], required: true },
    quantity: { type: Number, required: true },
    previousStock: { type: Number, required: true },
    newStock: { type: Number, required: true },
    reference: String,
    notes: String,
    performedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

inventoryTransactionSchema.index({ product: 1, createdAt: -1 });

export const InventoryTransaction = mongoose.model<InventoryTransactionDocument>('InventoryTransaction', inventoryTransactionSchema);
