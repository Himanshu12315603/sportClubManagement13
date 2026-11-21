import mongoose from 'mongoose';
import { Enquiry, EnquiryDocument, EnquiryStatus } from './enquiry.model';
import { NotFoundError } from '../../utils/AppError';

export const submitEnquiry = async (data: object): Promise<EnquiryDocument> => {
  return Enquiry.create(data);
};

export const getEnquiries = async (query: { status?: string; assignedTo?: string; page?: number; limit?: number }) => {
  const { status, assignedTo, page = 1, limit = 20 } = query;
  const filter: Record<string, unknown> = {};
  if (status) filter.status = status;
  if (assignedTo) filter.assignedTo = assignedTo;

  const skip = (page - 1) * limit;
  const [enquiries, total] = await Promise.all([
    Enquiry.find(filter)
      .populate('assignedTo', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Enquiry.countDocuments(filter),
  ]);
  return { enquiries, total, page, limit, totalPages: Math.ceil(total / limit) };
};

export const getEnquiryById = async (id: string): Promise<EnquiryDocument> => {
  const enquiry = await Enquiry.findById(id).populate('assignedTo', 'name email').populate('followUpNotes.addedBy', 'name');
  if (!enquiry) throw new NotFoundError('Enquiry not found');
  return enquiry;
};

export const updateEnquiry = async (id: string, data: { status?: EnquiryStatus; assignedTo?: string }): Promise<EnquiryDocument> => {
  const enquiry = await Enquiry.findByIdAndUpdate(id, data, { new: true, runValidators: true }).populate('assignedTo', 'name email');
  if (!enquiry) throw new NotFoundError('Enquiry not found');
  return enquiry;
};

export const addFollowUpNote = async (id: string, note: string, addedById: string): Promise<EnquiryDocument> => {
  const enquiry = await Enquiry.findByIdAndUpdate(
    id,
    {
      $push: {
        followUpNotes: {
          note,
          addedBy: new mongoose.Types.ObjectId(addedById),
          addedAt: new Date(),
        },
      },
    },
    { new: true }
  );
  if (!enquiry) throw new NotFoundError('Enquiry not found');
  return enquiry;
};
