import mongoose, { Schema, Document, Model } from 'mongoose';
import { removeVietnameseTones } from '../lib/vietnamese';

export interface ISchool extends Document {
  name: string;
  normalizedName: string;
  address?: string;
  phone?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const SchoolSchema: Schema = new Schema(
  {
    name: {
      type: String,
      required: [true, 'Tên trường học là bắt buộc'],
      unique: true,
      trim: true,
    },
    normalizedName: {
      type: String,
      index: true,
    },
    address: {
      type: String,
      default: '',
      trim: true,
    },
    phone: {
      type: String,
      default: '',
      trim: true,
    },
    notes: {
      type: String,
      default: '',
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

SchoolSchema.pre('save', function (this: any, next: any) {
  if (this.isModified('name')) {
    this.normalizedName = removeVietnameseTones((this.get('name') as string) || '');
  }
  next();
});

const School: Model<ISchool> = mongoose.models.School || mongoose.model<ISchool>('School', SchoolSchema);

export default School;
