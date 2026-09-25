import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import School from '@/models/School';
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
    const address = (body.address || '').trim();
    const phone = (body.phone || '').trim();
    const notes = (body.notes || '').trim();

    if (!name) {
      return NextResponse.json(
        { success: false, error: 'Tên trường học không được để trống' },
        { status: 400 }
      );
    }

    const normalizedName = removeVietnameseTones(name);

    // Kiểm tra trùng tên với trường khác
    const duplicate = await School.findOne({
      _id: { $ne: id },
      $or: [
        { name: new RegExp(`^${name}$`, 'i') },
        { normalizedName: normalizedName },
      ],
    });

    if (duplicate) {
      return NextResponse.json(
        { success: false, error: 'Tên trường học này đã tồn tại trong hệ thống' },
        { status: 400 }
      );
    }

    const updated = await School.findByIdAndUpdate(
      id,
      { name, normalizedName, address, phone, notes },
      { new: true, runValidators: true }
    );

    if (!updated) {
      return NextResponse.json(
        { success: false, error: 'Không tìm thấy thông tin trường học' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: updated,
      message: 'Cập nhật thông tin trường thành công',
    });
  } catch (error: any) {
    console.error('Error updating school:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Lỗi cập nhật trường học' },
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

    const deleted = await School.findByIdAndDelete(id);

    if (!deleted) {
      return NextResponse.json(
        { success: false, error: 'Không tìm thấy trường học để xóa' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Xóa trường học thành công',
    });
  } catch (error: any) {
    console.error('Error deleting school:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Lỗi xóa trường học' },
      { status: 500 }
    );
  }
}
