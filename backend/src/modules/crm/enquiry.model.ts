import mongoose, { Document, Schema } from 'mongoose';

export type EnquiryStatus = 'new' | 'contacted' | 'quotation_sent' | 'converted' | 'rejected';

export interface IEnquiry {
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
  source: string;   // 'website', 'walk_in', 'phone', etc.
  status: EnquiryStatus;
  assignedTo?: mongoose.Types.ObjectId;
  followUpNotes: Array<{
    note: string;
    addedBy: mongoose.Types.ObjectId;
    addedAt: Date;
  }>;
  convertedMemberId?: mongoose.Types.ObjectId;
  interestedIn?: string;
  preferredContactTime?: string;
}

export interface EnquiryDocument extends IEnquiry, Document {}

const enquirySchema = new Schema<EnquiryDocument>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true },
    phone: String,
    subject: { type: String, required: true },
    message: { type: String, required: true },
    source: { type: String, default: 'website' },
    status: {
      type: String,
      enum: ['new', 'contacted', 'quotation_sent', 'converted', 'rejected'],
      default: 'new',
    },
    assignedTo: { type: Schema.Types.ObjectId, ref: 'User' },
    followUpNotes: [
      {
        note: { type: String, required: true },
        addedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        addedAt: { type: Date, default: Date.now },
      },
    ],
    convertedMemberId: { type: Schema.Types.ObjectId, ref: 'Member' },
    interestedIn: String,
    preferredContactTime: String,
  },
  { timestamps: true }
);

enquirySchema.index({ status: 1, createdAt: -1 });
enquirySchema.index({ email: 1 });

export const Enquiry = mongoose.model<EnquiryDocument>('Enquiry', enquirySchema);
