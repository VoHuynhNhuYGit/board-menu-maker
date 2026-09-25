export interface IDishItem {
  _id?: string;
  name: string;
  normalizedName?: string;
  category?: string;
  usageCount?: number;
}

export interface IDayPlan {
  dayOfWeek: string;    // Ví dụ: "2", "3", "4", "5"
  dateDisplay: string;  // Ví dụ: "Ngày 28/9"
  dateValue?: string;   // Ví dụ: "2026-09-28"
  mainMeals: string[];  // Danh sách món bữa chính
  sideMeals: string[];  // Danh sách món bữa phụ
}

export interface IMenuData {
  _id?: string;
  schoolName: string;
  weekNumber: number | string;
  startDate: string;
  endDate: string;
  days: IDayPlan[];
  createdAt?: string;
  updatedAt?: string;
}
