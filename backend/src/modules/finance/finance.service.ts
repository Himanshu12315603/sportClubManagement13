import { Transaction, Expense } from './finance.model';

export const getFinanceSummary = async (period: 'today' | 'week' | 'month' | 'year' = 'month') => {
  const now = new Date();
  let startDate: Date;

  switch (period) {
    case 'today':
      startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      break;
    case 'week':
      startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      break;
    case 'year':
      startDate = new Date(now.getFullYear(), 0, 1);
      break;
    default:
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
  }

  const [revenueAgg, expenseAgg, bySource] = await Promise.all([
    Transaction.aggregate([
      { $match: { type: 'revenue', date: { $gte: startDate } } },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]),
    Expense.aggregate([
      { $match: { date: { $gte: startDate } } },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]),
    Transaction.aggregate([
      { $match: { type: 'revenue', date: { $gte: startDate } } },
      { $group: { _id: '$source', total: { $sum: '$amount' } } },
    ]),
  ]);

  const totalRevenue = revenueAgg[0]?.total ?? 0;
  const totalExpenses = expenseAgg[0]?.total ?? 0;
  const netProfit = totalRevenue - totalExpenses;

  const revenueBySource: Record<string, number> = {};
  bySource.forEach((s: { _id: string; total: number }) => {
    revenueBySource[s._id] = s.total;
  });

  return { period, totalRevenue, totalExpenses, netProfit, revenueBySource };
};

export const getTransactions = async (query: {
  type?: string;
  source?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}) => {
  const { type, source, startDate, endDate, page = 1, limit = 20 } = query;
  const filter: Record<string, unknown> = {};
  if (type) filter.type = type;
  if (source) filter.source = source;
  if (startDate || endDate) {
    filter.date = {};
    if (startDate) (filter.date as Record<string, unknown>).$gte = new Date(startDate);
    if (endDate) (filter.date as Record<string, unknown>).$lte = new Date(endDate);
  }

  const skip = (page - 1) * limit;
  const [transactions, total] = await Promise.all([
    Transaction.find(filter).populate('performedBy', 'name email').sort({ date: -1 }).skip(skip).limit(limit),
    Transaction.countDocuments(filter),
  ]);
  return { transactions, total, page, limit, totalPages: Math.ceil(total / limit) };
};

export const recordTransaction = async (data: object) => {
  return Transaction.create(data);
};

export const addExpense = async (data: object) => {
  return Expense.create(data);
};

export const getExpenses = async (query: { startDate?: string; endDate?: string; category?: string; page?: number; limit?: number }) => {
  const { startDate, endDate, category, page = 1, limit = 20 } = query;
  const filter: Record<string, unknown> = {};
  if (category) filter.category = category;
  if (startDate || endDate) {
    filter.date = {};
    if (startDate) (filter.date as Record<string, unknown>).$gte = new Date(startDate);
    if (endDate) (filter.date as Record<string, unknown>).$lte = new Date(endDate);
  }

  const skip = (page - 1) * limit;
  const [expenses, total] = await Promise.all([
    Expense.find(filter).populate('submittedBy', 'name').sort({ date: -1 }).skip(skip).limit(limit),
    Expense.countDocuments(filter),
  ]);
  return { expenses, total, page, limit, totalPages: Math.ceil(total / limit) };
};
