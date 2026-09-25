import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Menu from '@/models/Menu';
import Dish from '@/models/Dish';
import { removeVietnameseTones } from '@/lib/vietnamese';

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
      }
    }
  } catch (err) {
    console.error('Error syncing dishes from menu update:', err);
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();
    const { id } = params;

    const menu = await Menu.findById(id).lean();

    if (!menu) {
      return NextResponse.json(
        { success: false, error: 'Không tìm thấy thực đơn' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: menu });
  } catch (error: any) {
    console.error('Error fetching menu:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Lỗi lấy thông tin thực đơn' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();
    const { id } = params;
    const body = await request.json();

    const { schoolName, weekNumber, startDate, endDate, days } = body;

    const updatedMenu = await Menu.findByIdAndUpdate(
      id,
      {
        schoolName: schoolName ? schoolName.trim() : undefined,
        weekNumber: weekNumber ? Number(weekNumber) : undefined,
        startDate: startDate ? startDate.trim() : undefined,
        endDate: endDate ? endDate.trim() : undefined,
        days: days || [],
      },
      { new: true, runValidators: true }
    );

    if (!updatedMenu) {
      return NextResponse.json(
        { success: false, error: 'Không tìm thấy thực đơn để cập nhật' },
        { status: 404 }
      );
    }

    // Đồng bộ các món ăn mới vào kho món ăn tái sử dụng
    if (days && days.length > 0) {
      await syncDishesFromMenu(days);
    }

    return NextResponse.json({
      success: true,
      data: updatedMenu,
      message: 'Cập nhật thực đơn thành công',
    });
  } catch (error: any) {
    console.error('Error updating menu:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Lỗi cập nhật thực đơn' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();
    const { id } = params;

    const deleted = await Menu.findByIdAndDelete(id);

    if (!deleted) {
      return NextResponse.json(
        { success: false, error: 'Không tìm thấy thực đơn để xóa' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Xóa thực đơn thành công',
    });
  } catch (error: any) {
    console.error('Error deleting menu:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Lỗi xóa thực đơn' },
      { status: 500 }
    );
  }
}
