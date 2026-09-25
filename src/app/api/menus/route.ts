import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Menu from '@/models/Menu';
import Dish from '@/models/Dish';
import { removeVietnameseTones } from '@/lib/vietnamese';

// Tự động trích xuất các món ăn mới trong thực đơn và lưu vào kho món ăn MongoDB (không trùng lặp)
async function syncDishesFromMenu(days: any[]) {
  try {
    const namesSet = new Set<string>();
    for (const day of days || []) {
      for (const m of day.mainMeals || []) {
        const clean = (m || '').trim();
        if (clean) namesSet.add(clean);
      }
      for (const s of day.sideMeals || []) {
        const clean = (s || '').trim();
        if (clean) namesSet.add(clean);
      }
    }

    const dishNames = Array.from(namesSet);
    for (const name of dishNames) {
      const norm = removeVietnameseTones(name);
      const existing = await Dish.findOne({
        $or: [
          { name: new RegExp(`^${name}$`, 'i') },
          { normalizedName: norm },
        ],
      });

      if (!existing) {
        await Dish.create({
          name,
          normalizedName: norm,
          category: 'Chung',
          usageCount: 1,
        });
      } else {
        await Dish.updateOne(
          { _id: existing._id },
          { $inc: { usageCount: 1 } }
        );
      }
    }
  } catch (err) {
    console.error('Error syncing dishes from menu:', err);
  }
}

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const school = searchParams.get('school');
    const week = searchParams.get('week');

    const filter: any = {};
    if (school) {
      filter.schoolName = new RegExp(school, 'i');
    }
    if (week) {
      filter.weekNumber = Number(week);
    }

    const menus = await Menu.find(filter).sort({ updatedAt: -1 }).lean();

    return NextResponse.json({ success: true, data: menus });
  } catch (error: any) {
    console.error('Error fetching menus:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Lỗi lấy danh sách thực đơn' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const body = await request.json();

    const { schoolName, weekNumber, startDate, endDate, days } = body;

    if (!schoolName || !weekNumber || !startDate || !endDate) {
      return NextResponse.json(
        {
          success: false,
          error: 'Vui lòng điền đầy đủ: Tên trường, Tuần, Ngày bắt đầu, Ngày kết thúc',
        },
        { status: 400 }
      );
    }

    // Tạo bản ghi thực đơn mới
    const newMenu = await Menu.create({
      schoolName: schoolName.trim(),
      weekNumber: Number(weekNumber),
      startDate: startDate.trim(),
      endDate: endDate.trim(),
      days: days || [],
    });

    // Đồng bộ các món ăn mới vào kho món ăn tái sử dụng
    await syncDishesFromMenu(days || []);

    return NextResponse.json(
      {
        success: true,
        data: newMenu,
        message: 'Lưu thực đơn thành công vào cơ sở dữ liệu MongoDB',
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Error creating menu:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Lỗi lưu thực đơn' },
      { status: 500 }
    );
  }
}
