import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Dish from '@/models/Dish';
import Menu from '@/models/Menu';
import { removeVietnameseTones } from '@/lib/vietnamese';

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    // Check if we should force reseed
    const { force } = await request.json().catch(() => ({ force: false }));

    if (force) {
      await Dish.deleteMany({});
      await Menu.deleteMany({});
    }

    const dishCount = await Dish.countDocuments();
    if (dishCount === 0 || force) {
      const sampleDishes = [
        // Tuần 3
        { name: 'Gà kho sả', category: 'Món mặn' },
        { name: 'Canh khoai mỡ thịt bằm', category: 'Món canh' },
        { name: 'Rau cải thìa xào', category: 'Rau xào' },
        { name: 'Cơm trắng', category: 'Cơm' },
        { name: 'Sữa', category: 'Bữa phụ' },
        { name: 'Nạc dăm kho đậu hủ', category: 'Món mặn' },
        { name: 'Canh cải ngọt thịt băm', category: 'Món canh' },
        { name: 'Bông cải cà rốt xào', category: 'Rau xào' },
        { name: 'Phi lê cá điêu hồng chiên giòn', category: 'Món mặn' },
        { name: 'Đậu que xào', category: 'Rau xào' },
        { name: 'Canh chua', category: 'Món canh' },
        { name: 'Nui xào bò băm + chả lụa', category: 'Món mặn' },
        { name: 'Rau củ quả', category: 'Rau xào' },

        // Tuần 4
        { name: 'Nạc dăm rim nước dừa', category: 'Món mặn' },
        { name: 'Canh mồng tơi thịt băm', category: 'Món canh' },
        { name: 'Dưa leo xào trứng', category: 'Rau xào' },
        { name: 'Gà Rôty', category: 'Món mặn' },
        { name: 'Canh rau ngót thịt băm', category: 'Món canh' },
        { name: 'Rau dền xào', category: 'Rau xào' },
        { name: 'Trứng chiên', category: 'Món mặn' },
        { name: 'Nạc dăm kho củ cải', category: 'Món mặn' },
        { name: 'Canh bí đỏ thịt băm', category: 'Món canh' },
        { name: 'Su su + cà rốt xào', category: 'Rau xào' },
        { name: 'Hủ tiếu gà xé + mọc + tôm', category: 'Món mặn' },

        // Tuần 2
        { name: 'Nạc dăm kho trứng vịt', category: 'Món mặn' },
        { name: 'Canh bí đỏ thịt bằm', category: 'Món canh' },
        { name: 'Bắp sú xào + cà rốt', category: 'Rau xào' },
        { name: 'Cốt lết chiên sả', category: 'Món mặn' },
        { name: 'Canh ngũ quả thịt băm', category: 'Món canh' },
        { name: 'Cải thảo xào', category: 'Rau xào' },
        { name: 'Ức gà chiên giòn', category: 'Món mặn' },
        { name: 'Canh cải bó xôi thịt băm', category: 'Món canh' },
        { name: 'Bầu xào', category: 'Rau xào' },
        { name: 'Bò kho cà rốt + khoai tây', category: 'Món mặn' },
        { name: 'Bánh mì', category: 'Món mặn' },

        // Thêm các món phụ
        { name: 'Sữa chua', category: 'Bữa phụ' },
        { name: 'Yakult', category: 'Bữa phụ' },
        { name: 'Bánh flan', category: 'Bữa phụ' },
        { name: 'Chuối sứ', category: 'Tráng miệng' },
        { name: 'Dưa hấu', category: 'Tráng miệng' },
        { name: 'Thanh long', category: 'Tráng miệng' },
      ];

      const docsToInsert = sampleDishes.map((item) => ({
        ...item,
        normalizedName: removeVietnameseTones(item.name),
        usageCount: 1,
      }));

      await Dish.insertMany(docsToInsert);
    }

    const menuCount = await Menu.countDocuments();
    if (menuCount === 0 || force) {
      const sampleMenu = {
        schoolName: 'Trường Tiểu học Trưng Vương',
        weekNumber: 3,
        startDate: '28/9/2026',
        endDate: '1/10/2026',
        days: [
          {
            dayOfWeek: '2',
            dateDisplay: 'Ngày 28/9',
            dateValue: '2026-09-28',
            mainMeals: ['Gà kho sả', 'Canh khoai mỡ thịt bằm', 'Rau cải thìa xào', 'Cơm trắng'],
            sideMeals: ['Sữa'],
          },
          {
            dayOfWeek: '3',
            dateDisplay: 'Ngày 29/9',
            dateValue: '2026-09-29',
            mainMeals: ['Nạc dăm kho đậu hủ', 'Canh cải ngọt thịt băm', 'Bông cải cà rốt xào', 'Cơm trắng'],
            sideMeals: ['Sữa'],
          },
          {
            dayOfWeek: '4',
            dateDisplay: 'Ngày 30/9',
            dateValue: '2026-09-30',
            mainMeals: ['Phi lê cá điêu hồng chiên giòn', 'Đậu que xào', 'Canh chua', 'Cơm trắng'],
            sideMeals: ['Sữa'],
          },
          {
            dayOfWeek: '5',
            dateDisplay: 'Ngày 1/10',
            dateValue: '2026-10-01',
            mainMeals: ['Nui xào bò băm + chả lụa', 'Rau củ quả'],
            sideMeals: ['Sữa'],
          },
        ],
      };

      await Menu.create(sampleMenu);
    }

    return NextResponse.json({
      success: true,
      message: 'Khởi tạo dữ liệu mẫu thành công',
    });
  } catch (error: any) {
    console.error('Error seeding data:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Lỗi khởi tạo dữ liệu mẫu' },
      { status: 500 }
    );
  }
}
