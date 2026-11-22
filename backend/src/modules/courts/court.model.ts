import mongoose, { Document, Schema } from 'mongoose';

export type CourtType = 'tennis' | 'cricket' | 'badminton' | 'padel';
export type CourtStatus = 'available' | 'maintenance' | 'closed';

export interface ICourt {
  name: string;
  code?: string;
  type: CourtType;
  description?: string;
  status: CourtStatus;
  memberPrice: number;
  walkInPrice: number;
  image?: string;
  facilities?: string[];
  isActive: boolean;
}

export interface CourtDocument extends ICourt, Document {}

const courtSchema = new Schema<CourtDocument>(
  {
    name: { type: String, required: true, trim: true, unique: true },
    code: { type: String, unique: true, sparse: true, trim: true },
    type: { type: String, enum: ['tennis', 'cricket', 'badminton', 'padel'], required: true },
    description: String,
    status: { type: String, enum: ['available', 'maintenance', 'closed'], default: 'available' },
    memberPrice: { type: Number, required: true, min: 0 },
    walkInPrice: { type: Number, required: true, min: 0 },
    image: String,
    facilities: [String],
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

courtSchema.index({ type: 1, isActive: 1 });

export const Court = mongoose.model<CourtDocument>('Court', courtSchema);
