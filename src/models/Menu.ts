import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IDayPlan {
  dayOfWeek: string;    // Ví dụ: "2", "3", "4", "5", "6"
  dateDisplay: string;  // Ví dụ: "Ngày 28/9"
  dateValue?: string;   // Ví dụ: "2026-09-28" (dùng cho input date)
  mainMeals: string[];  // Danh sách món Bữa chính
  sideMeals: string[];  // Danh sách món Bữa phụ
}

export interface IMenu extends Document {
  schoolName: string;   // Ví dụ: "Trường Tiểu học Trưng Vương"
  weekNumber: number;   // Ví dụ: 3
  startDate: string;    // Ví dụ: "28/9/2026"
  endDate: string;      // Ví dụ: "1/10/2026"
  days: IDayPlan[];
  createdAt: Date;
  updatedAt: Date;
}

const DayPlanSchema = new Schema(
  {
    dayOfWeek: {
      type: String,
      required: true,
      default: '2',
    },
    dateDisplay: {
      type: String,
      required: true,
      default: 'Ngày 28/9',
    },
    dateValue: {
      type: String,
      default: '',
    },
    mainMeals: {
      type: [String],
      default: [],
    },
    sideMeals: {
      type: [String],
      default: [],
    },
  },
  { _id: false }
);

const MenuSchema: Schema = new Schema(
  {
    schoolName: {
      type: String,
      required: [true, 'Tên trường học là bắt buộc'],
      trim: true,
    },
    weekNumber: {
      type: Number,
      required: [true, 'Số tuần là bắt buộc'],
      default: 1,
    },
    startDate: {
      type: String,
      required: [true, 'Ngày bắt đầu là bắt buộc'],
      trim: true,
    },
    endDate: {
      type: String,
      required: [true, 'Ngày kết thúc là bắt buộc'],
      trim: true,
    },
    days: {
      type: [DayPlanSchema],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

const Menu: Model<IMenu> = mongoose.models.Menu || mongoose.model<IMenu>('Menu', MenuSchema);

export default Menu;
