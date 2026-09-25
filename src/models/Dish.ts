import mongoose, { Schema, Document, Model } from 'mongoose';
import { removeVietnameseTones } from '../lib/vietnamese';

export interface IDish extends Document {
  name: string;
  normalizedName: string;
  category?: string;
  usageCount: number;
  createdAt: Date;
  updatedAt: Date;
}

const DishSchema: Schema = new Schema(
  {
    name: {
      type: String,
      required: [true, 'Tên món ăn là bắt buộc'],
      unique: true,
      trim: true,
    },
    normalizedName: {
      type: String,
      index: true,
    },
    category: {
      type: String,
      default: 'Chung',
      trim: true,
    },
    usageCount: {
      type: Number,
      default: 1,
    },
  },
  {
    timestamps: true,
  }
);

DishSchema.pre('save', function (this: any, next: any) {
  if (this.isModified('name')) {
    this.normalizedName = removeVietnameseTones((this.get('name') as string) || '');
  }
  next();
});

const Dish: Model<IDish> = mongoose.models.Dish || mongoose.model<IDish>('Dish', DishSchema);

export default Dish;
