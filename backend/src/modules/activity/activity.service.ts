import { Activity, ActivityDocument, ActivityType } from './activity.model';

export const logActivity = async (data: {
  userId: string;
  userName: string;
  userEmail: string;
  type: ActivityType;
  description: string;
  metadata?: Record<string, unknown>;
  ipAddress?: string;
  userAgent?: string;
}): Promise<ActivityDocument> => {
  return Activity.create(data);
};

export const getUserActivities = async (userId: string, limit: number = 50): Promise<ActivityDocument[]> => {
  return Activity.find({ userId })
    .sort({ createdAt: -1 })
    .limit(limit);
};

export const getAllActivities = async (filters: {
  userId?: string;
  type?: ActivityType;
  startDate?: Date;
  endDate?: Date;
  page?: number;
  limit?: number;
}) => {
  const { userId, type, startDate, endDate, page = 1, limit = 50 } = filters;
  const filter: Record<string, unknown> = {};

  if (userId) filter.userId = userId;
  if (type) filter.type = type;
  if (startDate || endDate) {
    filter.createdAt = {};
    if (startDate) filter.createdAt.$gte = startDate;
    if (endDate) filter.createdAt.$lte = endDate;
  }

  const skip = (page - 1) * limit;
  const [activities, total] = await Promise.all([
    Activity.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
    Activity.countDocuments(filter),
  ]);

  return {
    activities,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
};

export const getActivityStats = async (userId?: string) => {
  const filter: Record<string, unknown> = {};
  if (userId) filter.userId = userId;

  const [total, byType] = await Promise.all([
    Activity.countDocuments(filter),
    Activity.aggregate([
      { $match: filter },
      { $group: { _id: '$type', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]),
  ]);

  return { total, byType };
};
