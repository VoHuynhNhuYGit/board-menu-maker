'use client';

import React, { useRef, useState } from 'react';
import { IMenuData } from '@/types';
import { Download, FileText, Image as ImageIcon, ZoomIn, ZoomOut, Check, Palette } from 'lucide-react';
import { toPng } from 'html-to-image';
import jsPDF from 'jspdf';

interface MenuPreviewProps {
  menuData: IMenuData;
}

export const MenuPreview: React.FC<MenuPreviewProps> = ({ menuData }) => {
  const printRef = useRef<HTMLDivElement>(null);
  const [isExportingPng, setIsExportingPng] = useState(false);
  const [isExportingPdf, setIsExportingPdf] = useState(false);
  const [zoomScale, setZoomScale] = useState<number>(1);
  const [fontTheme, setFontTheme] = useState<string>('times');

  // Chuẩn hóa tên file xuất
  const sanitizeFileName = (str: string) => {
    return str
      .replace(/[^a-zA-Z0-9\u00C0-\u1EF9]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
  };

  const baseFileName = `Thuc-don-${sanitizeFileName(menuData.schoolName || 'Truong-hoc')}-Tuan-${menuData.weekNumber || '1'}`;

  // Xuất file ảnh PNG độ nét cao
  const handleExportPNG = async () => {
    if (!printRef.current) return;
    setIsExportingPng(true);
    try {
      // Đợi font và ảnh sẵn sàng
      await document.fonts?.ready;

      const dataUrl = await toPng(printRef.current, {
        pixelRatio: 2.5, // Tăng gấp 2.5 lần để đạt độ phân giải cực nét khi in hoặc xem
        cacheBust: true,
        backgroundColor: '#ffffff',
      });

      const link = document.createElement('a');
      link.download = `${baseFileName}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('Lỗi khi xuất ảnh PNG:', err);
      alert('Đã xảy ra lỗi khi tạo ảnh PNG. Vui lòng thử lại.');
    } finally {
      setIsExportingPng(false);
    }
  };

  // Xuất file PDF chuẩn khổ A4 dọc
  const handleExportPDF = async () => {
    if (!printRef.current) return;
    setIsExportingPdf(true);
    try {
      await document.fonts?.ready;

      // Render thành PNG chất lượng cao trước để nhúng vào PDF
      // Cách này đảm bảo hiển thị đúng 100% tiếng Việt có dấu, không bị lỗi font hay vỡ khung
      const imgData = await toPng(printRef.current, {
        pixelRatio: 2.5,
        cacheBust: true,
        backgroundColor: '#ffffff',
      });

      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      const pageWidth = pdf.internal.pageSize.getWidth();   // 210mm
      const pageHeight = pdf.internal.pageSize.getHeight(); // 297mm
      const margin = 10; // 10mm lề
      const printWidth = pageWidth - margin * 2; // 190mm

      const img = new Image();
      img.src = imgData;

      await new Promise((resolve) => {
        img.onload = resolve;
      });

      const imgAspect = img.height / img.width;
      const printHeight = printWidth * imgAspect;

      // Nếu vừa trang đơn A4
      if (printHeight <= pageHeight - margin * 2) {
        pdf.addImage(imgData, 'PNG', margin, margin, printWidth, printHeight);
      } else {
        // Nếu thực đơn dài, chia trang tự động
        let heightLeft = printHeight;
        let position = margin;

        pdf.addImage(imgData, 'PNG', margin, position, printWidth, printHeight);
        heightLeft -= (pageHeight - margin * 2);

        while (heightLeft > 0) {
          position = heightLeft - printHeight + margin;
          pdf.addPage();
          pdf.addImage(imgData, 'PNG', margin, position, printWidth, printHeight);
          heightLeft -= (pageHeight - margin * 2);
        }
      }

      pdf.save(`${baseFileName}.pdf`);
    } catch (err) {
      console.error('Lỗi khi xuất PDF:', err);
      alert('Đã xảy ra lỗi khi xuất file PDF. Vui lòng thử lại.');
    } finally {
      setIsExportingPdf(false);
    }
  };

  // Chọn font chữ phù hợp cho tấm bảng thực đơn
  const getFontFamily = () => {
    switch (fontTheme) {
      case 'times':
        return '"Times New Roman", Times, serif';
      case 'opensans':
        return '"Open Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
      case 'roboto':
        return '"Roboto", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
      case 'bevietnam':
        return '"Be Vietnam Pro", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
      case 'merriweather':
        return '"Merriweather", Georgia, serif';
      case 'lora':
        return '"Lora", Georgia, serif';
      case 'playfair':
        return '"Playfair Display", Georgia, serif';
      case 'montserrat':
        return '"Montserrat", -apple-system, BlinkMacSystemFont, sans-serif';
      default:
        return '"Times New Roman", serif';
    }
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
        position: 'sticky',
        top: '20px',
      }}
    >
      {/* Thanh công cụ xuất file và xem trước */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '10px',
          background: '#ffffff',
          padding: '12px 18px',
          borderRadius: '14px',
          boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
          border: '1px solid #e2e8f0',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Palette size={16} color="#2563eb" />
          <span style={{ fontSize: '0.82rem', fontWeight: 600, color: '#475569' }}>Phông chữ ảnh:</span>
          <select
            value={fontTheme}
            onChange={(e) => setFontTheme(e.target.value)}
            style={{
              padding: '5px 10px',
              borderRadius: '6px',
              border: '1px solid #cbd5e1',
              fontSize: '0.82rem',
              fontWeight: 600,
              background: '#f8fafc',
              cursor: 'pointer',
              color: '#0f172a',
            }}
          >
            <option value="times">Times New Roman (Chuẩn mẫu Word)</option>
            <option value="opensans">Open Sans (Hiện đại, trong trẻo)</option>
            <option value="roboto">Roboto (Chuẩn mực, dễ đọc)</option>
            <option value="bevietnam">Be Vietnam Pro (Tối ưu tiếng Việt)</option>
            <option value="merriweather">Merriweather (Serif trang nhã)</option>
            <option value="lora">Lora (Serif cổ điển, thanh lịch)</option>
            <option value="playfair">Playfair Display (Nghệ thuật, sang trọng)</option>
            <option value="montserrat">Montserrat (Trẻ trung, năng động)</option>
          </select>
        </div>

        {/* Nút Phóng to / Thu nhỏ xem trước */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <button
            type="button"
            onClick={() => setZoomScale((prev) => Math.max(0.6, prev - 0.1))}
            title="Thu nhỏ xem trước"
            style={{
              padding: '6px',
              borderRadius: '6px',
              background: '#f1f5f9',
              color: '#475569',
            }}
          >
            <ZoomOut size={15} />
          </button>
          <span style={{ fontSize: '0.78rem', color: '#64748b', minWidth: '40px', textAlign: 'center' }}>
            {Math.round(zoomScale * 100)}%
          </span>
          <button
            type="button"
            onClick={() => setZoomScale((prev) => Math.min(1.4, prev + 0.1))}
            title="Phóng to xem trước"
            style={{
              padding: '6px',
              borderRadius: '6px',
              background: '#f1f5f9',
              color: '#475569',
            }}
          >
            <ZoomIn size={15} />
          </button>
        </div>

        {/* Nút Tải PNG và Nút Tải PDF */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button
            type="button"
            onClick={handleExportPNG}
            disabled={isExportingPng}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              background: '#0284c7',
              color: '#ffffff',
              padding: '8px 14px',
              borderRadius: '8px',
              fontSize: '0.85rem',
              fontWeight: 600,
              boxShadow: '0 2px 4px rgba(2, 132, 199, 0.25)',
              opacity: isExportingPng ? 0.7 : 1,
            }}
          >
            <ImageIcon size={15} />
            <span>{isExportingPng ? 'Đang tạo PNG...' : 'Tải ảnh PNG'}</span>
          </button>

          <button
            type="button"
            onClick={handleExportPDF}
            disabled={isExportingPdf}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              background: '#dc2626',
              color: '#ffffff',
              padding: '8px 14px',
              borderRadius: '8px',
              fontSize: '0.85rem',
              fontWeight: 600,
              boxShadow: '0 2px 4px rgba(220, 38, 38, 0.25)',
              opacity: isExportingPdf ? 0.7 : 1,
            }}
          >
            <FileText size={15} />
            <span>{isExportingPdf ? 'Đang tạo PDF...' : 'Tải file PDF'}</span>
          </button>
        </div>
      </div>

      {/* Vùng xem trước - Container cuộn và zoom */}
      <div
        style={{
          overflowX: 'auto',
          padding: '10px',
          background: '#e2e8f0',
          borderRadius: '16px',
          display: 'flex',
          justifyContent: 'center',
          boxShadow: 'inset 0 2px 6px rgba(0,0,0,0.06)',
        }}
      >
        <div
          style={{
            transform: `scale(${zoomScale})`,
            transformOrigin: 'top center',
            transition: 'transform 0.15s ease-out',
          }}
        >
          {/* TẤM BẢNG THỰC ĐƠN CHUẨN IN ẤN (Theo cấu trúc tuan-3.docx) */}
          <div
            ref={printRef}
            id="school-menu-preview-board"
            style={{
              width: '680px',
              minHeight: '850px',
              background: '#ffffff',
              padding: '45px 40px',
              color: '#000000',
              fontFamily: getFontFamily(),
              boxShadow: '0 10px 25px -5px rgba(0,0,0,0.15)',
              display: 'flex',
              flexDirection: 'column',
              boxSizing: 'border-box',
            }}
          >
            {/* TIÊU ĐỀ CHÍNH */}
            <div style={{ textAlign: 'center', marginBottom: '24px' }}>
              <h1
                style={{
                  fontSize: '22px',
                  fontWeight: 'bold',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                  lineHeight: '1.3',
                  margin: '0 0 6px 0',
                }}
              >
                THỰC ĐƠN {menuData.schoolName || 'TRƯỜNG TIỂU HỌC TRƯNG VƯƠNG'}
              </h1>
              <h2
                style={{
                  fontSize: '22px',
                  fontWeight: 'bold',
                  textTransform: 'uppercase',
                  letterSpacing: '1px',
                  margin: '0 0 8px 0',
                }}
              >
                TUẦN {menuData.weekNumber || '3'}
              </h2>
              <div
                style={{
                  fontSize: '17px',
                  fontStyle: 'normal',
                  color: '#000000',
                }}
              >
                Từ ngày {menuData.startDate || '28/9/2026'} đến ngày {menuData.endDate || '1/10/2026'}
              </div>
            </div>

            {/* BẢNG THỰC ĐƠN HAI CỘT: "THỨ" VÀ "THỰC ĐƠN" */}
            <table
              style={{
                width: '100%',
                borderCollapse: 'collapse',
                border: '1.5px solid #000000',
              }}
            >
              <thead>
                <tr style={{ background: '#ffffff' }}>
                  <th
                    style={{
                      width: '18%',
                      border: '1.5px solid #000000',
                      padding: '8px 4px',
                      fontSize: '18px',
                      fontWeight: 'bold',
                      textAlign: 'center',
                      textTransform: 'uppercase',
                    }}
                  >
                    THỨ
                  </th>
                  <th
                    style={{
                      width: '82%',
                      border: '1.5px solid #000000',
                      padding: '8px 12px',
                      fontSize: '18px',
                      fontWeight: 'bold',
                      textAlign: 'center',
                      textTransform: 'uppercase',
                    }}
                  >
                    THỰC ĐƠN
                  </th>
                </tr>
              </thead>
              <tbody>
                {menuData.days && menuData.days.length > 0 ? (
                  menuData.days.map((day, idx) => (
                    <tr key={idx}>
                      {/* Cột THỨ: Hiển thị Thứ (ví dụ 2, 3, 4, 5) và Ngày (ví dụ Ngày 28/9) */}
                      <td
                        style={{
                          border: '1.5px solid #000000',
                          textAlign: 'center',
                          verticalAlign: 'middle',
                          padding: '12px 6px',
                        }}
                      >
                        <div
                          style={{
                            fontSize: '20px',
                            fontWeight: 'bold',
                            lineHeight: '1.2',
                            marginBottom: '4px',
                          }}
                        >
                          {day.dayOfWeek}
                        </div>
                        <div
                          style={{
                            fontSize: '15px',
                            lineHeight: '1.2',
                          }}
                        >
                          {day.dateDisplay}
                        </div>
                      </td>

                      {/* Cột THỰC ĐƠN: Hiển thị Bữa chính và Bữa phụ */}
                      <td
                        style={{
                          border: '1.5px solid #000000',
                          verticalAlign: 'top',
                          padding: '12px 16px',
                        }}
                      >
                        {/* Bữa chính */}
                        <div style={{ marginBottom: '14px' }}>
                          <div style={{ display: 'flex', alignItems: 'flex-start' }}>
                            <span
                              style={{
                                fontSize: '16.5px',
                                fontWeight: 'bold',
                                whiteSpace: 'nowrap',
                                minWidth: '92px',
                                lineHeight: '1.6',
                              }}
                            >
                              Bữa chính:
                            </span>

                            <div style={{ flex: 1 }}>
                              {day.mainMeals && day.mainMeals.length > 0 ? (
                                day.mainMeals.map((dish, dIdx) => (
                                  <div
                                    key={dIdx}
                                    style={{
                                      fontSize: '16.5px',
                                      lineHeight: '1.6',
                                      color: '#000000',
                                    }}
                                  >
                                    {dish}
                                  </div>
                                ))
                              ) : (
                                <span style={{ fontSize: '15px', fontStyle: 'italic', color: '#666' }}>
                                  (Chưa có món)
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Bữa phụ */}
                        <div style={{ display: 'flex', alignItems: 'flex-start' }}>
                          <span
                            style={{
                              fontSize: '16.5px',
                              fontWeight: 'bold',
                              whiteSpace: 'nowrap',
                              minWidth: '92px',
                              lineHeight: '1.5',
                            }}
                          >
                            Bữa phụ:
                          </span>
                          <div style={{ flex: 1 }}>
                            {day.sideMeals && day.sideMeals.length > 0 ? (
                              <div
                                style={{
                                  fontSize: '16.5px',
                                  lineHeight: '1.5',
                                  color: '#000000',
                                }}
                              >
                                {day.sideMeals.join(', ')}
                              </div>
                            ) : (
                              <span style={{ fontSize: '15px', fontStyle: 'italic', color: '#666' }}>
                                (Chưa có món)
                              </span>
                            )}
                          </div>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={2}
                      style={{
                        padding: '30px',
                        textAlign: 'center',
                        fontStyle: 'italic',
                        color: '#666',
                      }}
                    >
                      Chưa có ngày nào trong thực đơn.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
