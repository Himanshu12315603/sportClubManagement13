import mongoose, { Document } from 'mongoose';

export type TrialStatus = 'registered' | 'confirmed' | 'attended' | 'cancelled' | 'converted';
export type SportType = 'tennis' | 'cricket';

export interface ITrial {
  userId?: mongoose.Types.ObjectId;
  name: string;
  email: string;
  phone: string;
  sport: SportType;
  preferredDate: Date;
  preferredTimeSlot: string;
  experienceLevel: 'beginner' | 'intermediate' | 'advanced';
  status: TrialStatus;
  assignedCoach?: mongoose.Types.ObjectId;
  feedbackNotes?: string;
  convertedMemberId?: mongoose.Types.ObjectId;
}

export interface TrialDocument extends ITrial, Document {}

export interface RegisterTrialInput {
  userId?: string;
  name: string;
  email: string;
  phone: string;
  sport: SportType;
  preferredDate: string;
  preferredTimeSlot: string;
  experienceLevel?: 'beginner' | 'intermediate' | 'advanced';
}
