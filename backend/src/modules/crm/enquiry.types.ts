import mongoose, { Document } from 'mongoose';

export type EnquiryStatus = 'new' | 'contacted' | 'quotation_sent' | 'converted' | 'rejected';

export interface IFollowUpNote {
  note: string;
  addedBy: mongoose.Types.ObjectId;
  addedAt: Date;
}

export interface IEnquiry {
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
  source: string;
  status: EnquiryStatus;
  assignedTo?: mongoose.Types.ObjectId;
  followUpNotes: IFollowUpNote[];
  convertedMemberId?: mongoose.Types.ObjectId;
  interestedIn?: string;
  preferredContactTime?: string;
}

export interface EnquiryDocument extends IEnquiry, Document {}
