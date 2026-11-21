import mongoose, { Document, Schema } from 'mongoose';

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

const transactionSchema = new Schema<TransactionDocument>(
  {
    type: { type: String, enum: ['revenue', 'expense', 'refund'], required: true },
    source: { type: String, enum: ['membership', 'booking', 'shop', 'cafeteria', 'other'], required: true },
    amount: { type: Number, required: true, min: 0 },
    paymentMethod: { type: String, enum: ['cash', 'card', 'upi', 'online', 'bank_transfer'], required: true },
    reference: String,
    description: { type: String, required: true },
    relatedModel: String,
    relatedId: Schema.Types.ObjectId,
    performedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    date: { type: Date, default: Date.now },
    notes: String,
  },
  { timestamps: true }
);

transactionSchema.index({ type: 1, source: 1, date: -1 });
transactionSchema.index({ date: -1 });

export const Transaction = mongoose.model<TransactionDocument>('Transaction', transactionSchema);

// ---- Expense ----
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

const expenseSchema = new Schema<ExpenseDocument>(
  {
    category: { type: String, required: true },
    description: { type: String, required: true },
    amount: { type: Number, required: true, min: 0 },
    paymentMethod: { type: String, enum: ['cash', 'card', 'upi', 'online', 'bank_transfer'], required: true },
    date: { type: Date, required: true },
    reference: String,
    approvedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    submittedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    receipt: String,
    notes: String,
  },
  { timestamps: true }
);

expenseSchema.index({ date: -1 });
expenseSchema.index({ category: 1 });

export const Expense = mongoose.model<ExpenseDocument>('Expense', expenseSchema);
