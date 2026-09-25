import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Dish from '@/models/Dish';
import { removeVietnameseTones } from '@/lib/vietnamese';

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();
    const { id } = params;
    const body = await request.json();
    const name = (body.name || '').trim();
    const category = body.category ? body.category.trim() : undefined;

    if (!name) {
      return NextResponse.json(
        { success: false, error: 'Tên món ăn không được để trống' },
        { status: 400 }
      );
    }

    const normalizedName = removeVietnameseTones(name);

    // Kiểm tra trùng tên với món khác
    const duplicate = await Dish.findOne({
      _id: { $ne: id },
      $or: [
        { name: new RegExp(`^${name}$`, 'i') },
        { normalizedName: normalizedName },
      ],
    });

    if (duplicate) {
      return NextResponse.json(
        { success: false, error: 'Tên món ăn này đã tồn tại trong hệ thống' },
        { status: 400 }
      );
    }

    const updateData: any = {
      name,
      normalizedName,
    };
    if (category !== undefined) {
      updateData.category = category;
    }

    const updatedDish = await Dish.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });

    if (!updatedDish) {
      return NextResponse.json(
        { success: false, error: 'Không tìm thấy món ăn' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: updatedDish,
      message: 'Cập nhật món ăn thành công',
    });
  } catch (error: any) {
    console.error('Error updating dish:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Lỗi cập nhật món ăn' },
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

    const deleted = await Dish.findByIdAndDelete(id);

    if (!deleted) {
      return NextResponse.json(
        { success: false, error: 'Không tìm thấy món ăn để xóa' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Xóa món ăn thành công',
    });
  } catch (error: any) {
    console.error('Error deleting dish:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Lỗi xóa món ăn' },
      { status: 500 }
    );
  }
}
