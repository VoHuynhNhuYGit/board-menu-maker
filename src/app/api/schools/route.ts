import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import School from '@/models/School';
import { removeVietnameseTones, matchVietnamese } from '@/lib/vietnamese';

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';

    const schools = await School.find().sort({ name: 1 }).lean();

    if (!search.trim()) {
      return NextResponse.json({ success: true, data: schools });
    }

    const filtered = schools.filter((s: any) =>
      matchVietnamese(s.name, search) || (s.address && matchVietnamese(s.address, search))
    );

    return NextResponse.json({ success: true, data: filtered });
  } catch (error: any) {
    console.error('Error fetching schools:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Lỗi lấy danh sách trường học' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDB();
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

    // Kiểm tra trùng tên trường
    const existing = await School.findOne({
      $or: [
        { name: new RegExp(`^${name}$`, 'i') },
        { normalizedName: normalizedName },
      ],
    });

    if (existing) {
      return NextResponse.json(
        { success: false, error: 'Trường học này đã tồn tại trong hệ thống' },
        { status: 400 }
      );
    }

    const newSchool = await School.create({
      name,
      normalizedName,
      address,
      phone,
      notes,
    });

    return NextResponse.json(
      { success: true, data: newSchool, message: 'Thêm trường học thành công' },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Error creating school:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Lỗi thêm trường học' },
      { status: 500 }
    );
  }
}
