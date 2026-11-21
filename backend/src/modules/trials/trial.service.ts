import mongoose from 'mongoose';
import { Trial, TrialDocument, TrialStatus } from './trial.model';
import { RegisterTrialInput } from './trial.types';
import { NotFoundError } from '../../utils/AppError';

export const registerTrial = async (data: any): Promise<TrialDocument> => {
  return Trial.create({
    name: data.name,
    email: data.email,
    phone: data.phone,
    sport: (data.sport || 'tennis').toLowerCase(),
    preferredDate: data.preferredDate ? new Date(data.preferredDate) : (data.date ? new Date(data.date) : new Date()),
    preferredTimeSlot: data.preferredTimeSlot || data.slot || '10:00 - 11:00 AM',
    experienceLevel: data.experienceLevel || 'beginner',
    status: 'registered',
    userId: data.userId ? new mongoose.Types.ObjectId(data.userId) : undefined,
  });
};

export const getMyTrials = async (userId: string, email?: string) => {
  const orFilters: Record<string, unknown>[] = [{ userId: new mongoose.Types.ObjectId(userId) }];
  if (email) orFilters.push({ email: email.toLowerCase() });
  return Trial.find({ $or: orFilters })
    .populate('assignedCoach', 'name email phone')
    .sort({ preferredDate: -1 });
};

export const getTrials = async (query: { sport?: string; status?: string; page?: number; limit?: number }) => {
  const { sport, status, page = 1, limit = 20 } = query;
  const filter: Record<string, unknown> = {};
  if (sport) filter.sport = sport;
  if (status) filter.status = status;

  const skip = (page - 1) * limit;
  const [trials, total] = await Promise.all([
    Trial.find(filter)
      .populate('userId', 'name email phone')
      .populate('assignedCoach', 'name email phone')
      .sort({ preferredDate: -1 })
      .skip(skip)
      .limit(limit),
    Trial.countDocuments(filter),
  ]);

  return { trials, total, page, limit, totalPages: Math.ceil(total / limit) };
};

export const getTrialById = async (id: string): Promise<TrialDocument> => {
  const trial = await Trial.findById(id)
    .populate('userId', 'name email phone')
    .populate('assignedCoach', 'name email phone');
  if (!trial) throw new NotFoundError('Trial registration not found');
  return trial;
};

export const updateTrialStatus = async (
  id: string,
  status: TrialStatus,
  assignedCoachId?: string,
  feedbackNotes?: string
): Promise<TrialDocument> => {
  const update: Record<string, unknown> = { status };
  if (assignedCoachId) update.assignedCoach = new mongoose.Types.ObjectId(assignedCoachId);
  if (feedbackNotes) update.feedbackNotes = feedbackNotes;

  const trial = await Trial.findByIdAndUpdate(id, update, { new: true });
  if (!trial) throw new NotFoundError('Trial registration not found');
  return trial;
};
