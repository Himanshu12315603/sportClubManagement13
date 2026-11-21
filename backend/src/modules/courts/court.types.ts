import { Document } from 'mongoose';

export type CourtType = 'tennis' | 'cricket';
export type CourtStatus = 'available' | 'maintenance' | 'closed';

export interface ICourt {
  name: string;
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
