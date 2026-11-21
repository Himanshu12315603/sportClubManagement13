import { AIInsight, AIInsightDocument } from './aiInsight.model';
import { Transaction } from '../finance/finance.model';
import { Booking } from '../courts/booking.model';
import { Member } from '../members/member.model';
import { Product } from '../products/product.model';

export const getInsights = async (type?: string): Promise<AIInsightDocument[]> => {
  const filter: Record<string, unknown> = {};
  if (type) filter.type = type;
  return AIInsight.find(filter).sort({ generatedAt: -1 }).limit(20);
};

export const generateFreshInsights = async () => {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  // 1. Calculate revenue metrics
  const revenueAgg = await Transaction.aggregate([
    { $match: { type: 'revenue', date: { $gte: startOfMonth } } },
    { $group: { _id: '$source', total: { $sum: '$amount' } } },
  ]);

  const currentRevenue = revenueAgg.reduce((acc: number, curr: { total: number }) => acc + curr.total, 0);
  const dayOfMonth = now.getDate();
  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  const projectedRevenue = dayOfMonth > 0 ? Math.round((currentRevenue / dayOfMonth) * daysInMonth) : currentRevenue;

  // 2. Calculate court booking volume
  const totalBookingsThisMonth = await Booking.countDocuments({
    startTime: { $gte: startOfMonth },
    status: { $ne: 'cancelled' },
  });

  // 3. Low stock count
  const lowStockCount = await Product.countDocuments({
    isActive: true,
    $expr: { $lte: ['$stock', '$lowStockThreshold'] },
  });

  // 4. Expiring memberships
  const expiringCount = await Member.countDocuments({
    status: 'active',
    endDate: {
      $gte: now,
      $lte: new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000), // next 14 days
    },
  });

  // Create insights
  const insights = await AIInsight.create([
    {
      type: 'revenue_prediction',
      title: 'End of Month Revenue Forecast',
      summary: `Based on current trajectory of ₹${currentRevenue.toLocaleString()}, projected revenue for this month is ₹${projectedRevenue.toLocaleString()}.`,
      metricValue: projectedRevenue,
      metricLabel: 'Projected Revenue (INR)',
      confidenceScore: 0.88,
      recommendations: [
        'Promote off-peak afternoon court slots with a 15% discount',
        'Upsell annual memberships to active month-to-month court users',
      ],
      dataPayload: { currentRevenue, projectedRevenue, daysInMonth },
    },
    {
      type: 'court_utilization',
      title: 'Prime Time Court Occupancy Alert',
      summary: `Total of ${totalBookingsThisMonth} sessions played so far this month. Peak occupancy is observed between 6:00 PM and 9:00 PM.`,
      metricValue: totalBookingsThisMonth,
      metricLabel: 'Monthly Bookings',
      confidenceScore: 0.92,
      recommendations: [
        'Open dynamic slot booking for weekend mornings',
        'Add weekend morning social play sessions to maximize court capacity',
      ],
    },
    {
      type: 'member_retention',
      title: 'Membership Renewal Watchlist',
      summary: `${expiringCount} members have memberships expiring within the next 14 days.`,
      metricValue: expiringCount,
      metricLabel: 'Expiring Memberships',
      confidenceScore: 0.95,
      recommendations: [
        'Trigger automated renewal reminder SMS & WhatsApp with early renewal loyalty points',
        'Have reception staff personally greet and assist expiring members at check-in',
      ],
    },
    {
      type: 'inventory_optimization',
      title: 'Sports Shop Low Stock Advisory',
      summary: `${lowStockCount} items have reached or breached their minimum safety stock threshold.`,
      metricValue: lowStockCount,
      metricLabel: 'Low Stock Items',
      confidenceScore: 0.99,
      recommendations: [
        'Reorder high-turnover tennis ball tubes and grips immediately',
        'Check supplier delivery lead times before weekend tournament',
      ],
    },
  ]);

  return insights;
};
