import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

declare global {
  var _mongooseConn: { conn: typeof mongoose | null; promise: Promise<typeof mongoose> | null } | undefined;
  var _mongoServer: MongoMemoryServer | null | undefined;
}

let cached = global._mongooseConn;

if (!cached) {
  cached = global._mongooseConn = { conn: null, promise: null };
}

export async function connectDB() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
    };

    cached.promise = (async () => {
      let uri = process.env.MONGODB_URI;

      if (uri) {
        try {
          console.log('[MongoDB] Connecting to configured URI:', uri);
          const conn = await mongoose.connect(uri, { ...opts, serverSelectionTimeoutMS: 2500 });
          console.log('[MongoDB] Connected successfully to external/local MongoDB.');
          await checkAndSeedData();
          return conn;
        } catch (err: any) {
          console.warn('[MongoDB] Could not connect to configured MONGODB_URI:', err.message);
          console.log('[MongoDB] Falling back to automated embedded MongoDB Engine...');
        }
      }

      // If no URI or connection failed, use MongoMemoryServer
      try {
        if (!global._mongoServer) {
          console.log('[MongoDB] Launching embedded MongoDB Engine...');
          global._mongoServer = await MongoMemoryServer.create();
        }
        uri = global._mongoServer.getUri();
        console.log('[MongoDB] Embedded MongoDB is running at:', uri);
        const conn = await mongoose.connect(uri, opts);
        console.log('[MongoDB] Connected successfully to embedded MongoDB.');
        await checkAndSeedData();
        return conn;
      } catch (err: any) {
        console.error('[MongoDB] Failed to start and connect to embedded MongoDB:', err);
        throw err;
      }
    })();
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    throw e;
  }

  return cached.conn;
}

/**
 * Tự động khởi tạo dữ liệu mẫu nếu Database đang trống
 */
async function checkAndSeedData() {
  try {
    // Dynamic import models to avoid circular dependencies
    const Dish = (await import('../models/Dish')).default;
    const Menu = (await import('../models/Menu')).default;
    const { removeVietnameseTones } = await import('./vietnamese');

    const dishCount = await Dish.countDocuments();
    if (dishCount === 0) {
      console.log('[MongoDB Seeder] Seeding initial dishes bank...');
      const sampleDishes = [
        // Tuần 3 (Mẫu yêu cầu)
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

        // Các món phụ và tráng miệng phổ biến khác
        { name: 'Sữa chua', category: 'Bữa phụ' },
        { name: 'Yakult', category: 'Bữa phụ' },
        { name: 'Bánh bông lan', category: 'Bữa phụ' },
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
      console.log(`[MongoDB Seeder] Inserted ${docsToInsert.length} dishes.`);
    }

    const menuCount = await Menu.countDocuments();
    if (menuCount === 0) {
      console.log('[MongoDB Seeder] Seeding sample Menu (Tuần 3 - TH Trưng Vương)...');
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
      console.log('[MongoDB Seeder] Sample Week 3 menu created successfully.');
    }

    const School = (await import('../models/School')).default;
    const schoolCount = await School.countDocuments();
    if (schoolCount === 0) {
      console.log('[MongoDB Seeder] Seeding initial schools list...');
      const sampleSchools = [
        {
          name: 'Trường Tiểu học Trưng Vương',
          normalizedName: removeVietnameseTones('Trường Tiểu học Trưng Vương'),
          address: '260 Hai Bà Trưng, Phường Tân Định, Quận 1, TP.HCM',
          phone: '028 3829 1234',
          notes: 'Mẫu thực đơn chuẩn theo file Word',
        },
        {
          name: 'Trường Tiểu học Lê Quý Đôn',
          normalizedName: removeVietnameseTones('Trường Tiểu học Lê Quý Đôn'),
          address: '110 Lê Lợi, Quận 3, TP.HCM',
          phone: '028 3930 5678',
          notes: 'Bán trú 2 buổi/ngày',
        },
        {
          name: 'Trường Tiểu học Nguyễn Huệ',
          normalizedName: removeVietnameseTones('Trường Tiểu học Nguyễn Huệ'),
          address: '45 Nguyễn Huệ, Quận 1, TP.HCM',
          phone: '028 3822 9999',
          notes: 'Chuẩn quốc gia',
        },
      ];
      await School.insertMany(sampleSchools);
      console.log('[MongoDB Seeder] Sample schools created successfully.');
    }
  } catch (err) {
    console.error('[MongoDB Seeder] Error during data seeding:', err);
  }
}
