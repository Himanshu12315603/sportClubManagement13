import mongoose, { Document } from 'mongoose';

export interface ICategory {
  name: string;
  slug: string;
  description?: string;
  isActive: boolean;
}
export interface CategoryDocument extends ICategory, Document {}

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

export type InventoryTxType = 'purchase' | 'sale' | 'return' | 'adjustment' | 'damage';

export interface IInventoryTransaction {
  product: mongoose.Types.ObjectId;
  type: InventoryTxType;
  quantity: number;
  previousStock: number;
  newStock: number;
  reference?: string;
  notes?: string;
  performedBy: mongoose.Types.ObjectId;
}
export interface InventoryTransactionDocument extends IInventoryTransaction, Document {}
