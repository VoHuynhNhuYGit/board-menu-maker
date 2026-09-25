import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Tạo Ảnh & PDF Thực Đơn Tuần Cho Trường Học | School Menu Maker',
  description:
    'Website tạo bảng thực đơn tuần chuyên nghiệp cho trường tiểu học, mầm non, THCS; lưu trữ bằng MongoDB NoSQL, gợi ý món ăn thông minh, xuất ảnh PNG sắc nét và file PDF chuẩn khổ A4 dọc.',
  keywords: ['thực đơn trường học', 'menu maker', 'thực đơn tuần', 'tiểu học trưng vương', 'bảng thực đơn', 'xuất pdf thực đơn'],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </head>
      <body>{children}</body>
    </html>
  );
}
