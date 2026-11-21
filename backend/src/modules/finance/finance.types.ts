import mongoose, { Document } from 'mongoose';

export type TransactionType = 'revenue' | 'expense' | 'refund';
export type TransactionSource = 'membership' | 'booking' | 'shop' | 'cafeteria' | 'other';
export type PaymentMethod = 'cash' | 'card' | 'upi' | 'online' | 'bank_transfer';

export interface ITransaction {
  type: TransactionType;
  source: TransactionSource;
  amount: number;
  paymentMethod: PaymentMethod;
  reference?: string;
  description: string;
  relatedModel?: string;
  relatedId?: mongoose.Types.ObjectId;
  performedBy: mongoose.Types.ObjectId;
  date: Date;
  notes?: string;
}
export interface TransactionDocument extends ITransaction, Document {}

export interface IExpense {
  category: string;
  description: string;
  amount: number;
  paymentMethod: PaymentMethod;
  date: Date;
  reference?: string;
  approvedBy?: mongoose.Types.ObjectId;
  submittedBy: mongoose.Types.ObjectId;
  receipt?: string;
  notes?: string;
}
export interface ExpenseDocument extends IExpense, Document {}

export interface IFinanceSummary {
  period: 'today' | 'week' | 'month' | 'year';
  totalRevenue: number;
  totalExpenses: number;
  netProfit: number;
  revenueBySource: Record<string, number>;
}
