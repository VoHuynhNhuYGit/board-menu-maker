import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Dish from '@/models/Dish';
import { removeVietnameseTones, matchVietnamese } from '@/lib/vietnamese';

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';

    const allDishes = await Dish.find().sort({ usageCount: -1, name: 1 }).lean();

    if (!search.trim()) {
      return NextResponse.json({ success: true, data: allDishes });
    }

    const filtered = allDishes.filter((dish: any) =>
      matchVietnamese(dish.name, search)
    );

    return NextResponse.json({ success: true, data: filtered });
  } catch (error: any) {
    console.error('Error fetching dishes:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Lỗi lấy danh sách món ăn' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const body = await request.json();
    const name = (body.name || '').trim();
    const category = (body.category || 'Chung').trim();

    if (!name) {
      return NextResponse.json(
        { success: false, error: 'Tên món ăn không được để trống' },
        { status: 400 }
      );
    }

    const normalizedName = removeVietnameseTones(name);

    // Kiểm tra món đã tồn tại chưa (không phân biệt hoa thường và dấu tiếng Việt)
    let existingDish = await Dish.findOne({
      $or: [
        { name: new RegExp(`^${name}$`, 'i') },
        { normalizedName: normalizedName },
      ],
    });

    if (existingDish) {
      existingDish.usageCount += 1;
      await existingDish.save();
      return NextResponse.json({
        success: true,
        data: existingDish,
        message: 'Món ăn đã tồn tại, đã cập nhật số lần sử dụng',
      });
    }

    const newDish = await Dish.create({
      name,
      normalizedName,
      category,
      usageCount: 1,
    });

    return NextResponse.json(
      { success: true, data: newDish, message: 'Thêm món ăn thành công' },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Error creating dish:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Lỗi thêm món ăn' },
      { status: 500 }
    );
  }
}
