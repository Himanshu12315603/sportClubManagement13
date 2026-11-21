import mongoose, { Document, Schema } from 'mongoose';

export type TrialStatus = 'registered' | 'confirmed' | 'attended' | 'cancelled' | 'converted';

export interface ITrial {
  name: string;
  email: string;
  phone: string;
  sport: 'tennis' | 'cricket';
  preferredDate: Date;
  preferredTimeSlot: string;
  experienceLevel: 'beginner' | 'intermediate' | 'advanced';
  status: TrialStatus;
  assignedCoach?: mongoose.Types.ObjectId;
  feedbackNotes?: string;
  convertedMemberId?: mongoose.Types.ObjectId;
}

export interface TrialDocument extends ITrial, Document {}

const trialSchema = new Schema<TrialDocument>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true },
    phone: { type: String, required: true, trim: true },
    sport: { type: String, enum: ['tennis', 'cricket'], required: true },
    preferredDate: { type: Date, required: true },
    preferredTimeSlot: { type: String, required: true },
    experienceLevel: { type: String, enum: ['beginner', 'intermediate', 'advanced'], default: 'beginner' },
    status: {
      type: String,
      enum: ['registered', 'confirmed', 'attended', 'cancelled', 'converted'],
      default: 'registered',
    },
    assignedCoach: { type: Schema.Types.ObjectId, ref: 'User' },
    feedbackNotes: String,
    convertedMemberId: { type: Schema.Types.ObjectId, ref: 'Member' },
  },
  { timestamps: true }
);

trialSchema.index({ status: 1, preferredDate: 1 });

export const Trial = mongoose.model<TrialDocument>('Trial', trialSchema);
