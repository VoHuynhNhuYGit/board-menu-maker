'use client';

import React, { useRef, useState, useImperativeHandle, forwardRef } from 'react';
import { IMenuData } from '@/types';
import { Palette, ZoomIn, ZoomOut } from 'lucide-react';
import { toPng } from 'html-to-image';
import jsPDF from 'jspdf';

export interface MenuPreviewHandle {
  exportPNG: () => Promise<void>;
  exportPDF: () => Promise<void>;
}

interface MenuPreviewProps {
  menuData: IMenuData;
}

export const MenuPreview = forwardRef<MenuPreviewHandle, MenuPreviewProps>(
  ({ menuData }, ref) => {
    const printRef = useRef<HTMLDivElement>(null);
    const [isExportingPng, setIsExportingPng] = useState(false);
    const [isExportingPdf, setIsExportingPdf] = useState(false);
    const [zoomScale, setZoomScale] = useState<number>(0.95);
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
        await document.fonts?.ready;

        const dataUrl = await toPng(printRef.current, {
          pixelRatio: 2.5,
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

        const pageWidth = pdf.internal.pageSize.getWidth();
        const pageHeight = pdf.internal.pageSize.getHeight();
        const margin = 10;

        const img = new Image();
        img.src = imgData;

        await new Promise<void>((resolve, reject) => {
          img.onload = () => resolve();
          img.onerror = () => reject(new Error('Không thể đọc ảnh xem trước để tạo PDF.'));
        });

        // Thu nhỏ theo cả chiều rộng và chiều cao để toàn bộ thực đơn luôn nằm
        // trên đúng một trang A4, không cắt và không lặp dòng cuối.
        const availableWidth = pageWidth - margin * 2;
        const availableHeight = pageHeight - margin * 2;
        const imageScale = Math.min(
          availableWidth / img.width,
          availableHeight / img.height
        );
        const printWidth = img.width * imageScale;
        const printHeight = img.height * imageScale;
        const x = (pageWidth - printWidth) / 2;
        const y = (pageHeight - printHeight) / 2;

        pdf.addImage(imgData, 'PNG', x, y, printWidth, printHeight);

        pdf.save(`${baseFileName}.pdf`);
      } catch (err) {
        console.error('Lỗi khi xuất PDF:', err);
        alert('Đã xảy ra lỗi khi xuất file PDF. Vui lòng thử lại.');
      } finally {
        setIsExportingPdf(false);
      }
    };

    // Expose handlers cho Header gọi
    useImperativeHandle(ref, () => ({
      exportPNG: handleExportPNG,
      exportPDF: handleExportPDF,
    }));

    // Chọn font chữ
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

    const cleanDateOnly = (dateDisplay?: string) => {
      if (!dateDisplay) return '';
      return dateDisplay.replace(/^Ngày\s*/i, '');
    };

    // Format ngày yyyy-mm-dd -> d/m/yyyy
    const formatDisplayDateStr = (dateStr?: string) => {
      if (!dateStr) return '';
      try {
        const p = dateStr.split('-');
        if (p.length === 3) return `${parseInt(p[2], 10)}/${parseInt(p[1], 10)}/${p[0]}`;
      } catch (e) {}
      return dateStr;
    };

    const dateRangeText =
      menuData.startDate && menuData.endDate
        ? `Từ ngày ${formatDisplayDateStr(menuData.startDate)} đến ngày ${formatDisplayDateStr(menuData.endDate)}`
        : 'Chưa chọn khoảng ngày';

    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '14px',
          width: '100%',
          minWidth: 0,
          background: '#ffffff',
          border: '1px solid #e2e8f0',
          borderRadius: '8px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
          padding: '16px 20px 20px',
        }}
      >
        {/* Header phần xem trước và công cụ tiện ích */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <h2
            style={{
            fontSize: '1.05rem',
              fontWeight: 700,
              color: '#0f172a',
            }}
          >
            Xem trước
          </h2>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            {/* Phông chữ */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Palette size={14} color="#64748b" />
              <select
                value={fontTheme}
                onChange={(e) => setFontTheme(e.target.value)}
                style={{
                  padding: '4px 8px',
                  borderRadius: '6px',
                  border: '1px solid #cbd5e1',
                  fontSize: '0.78rem',
                  fontWeight: 600,
                  background: '#ffffff',
                  color: '#334155',
                  cursor: 'pointer',
                }}
              >
                <option value="times">Times New Roman</option>
                <option value="opensans">Open Sans</option>
                <option value="roboto">Roboto</option>
                <option value="bevietnam">Be Vietnam Pro</option>
                <option value="merriweather">Merriweather</option>
                <option value="lora">Lora</option>
                <option value="playfair">Playfair Display</option>
                <option value="montserrat">Montserrat</option>
              </select>
            </div>

            {/* Zoom */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
              <button
                type="button"
                onClick={() => setZoomScale((prev) => Math.max(0.6, prev - 0.05))}
                title="Thu nhỏ"
                style={{
                  padding: '4px 6px',
                  borderRadius: '4px',
                  background: '#ffffff',
                  border: '1px solid #cbd5e1',
                  color: '#475569',
                  cursor: 'pointer',
                  display: 'flex',
                }}
              >
                <ZoomOut size={13} />
              </button>
              <button
                type="button"
                onClick={() => setZoomScale((prev) => Math.min(1.3, prev + 0.05))}
                title="Phóng to"
                style={{
                  padding: '4px 6px',
                  borderRadius: '4px',
                  background: '#ffffff',
                  border: '1px solid #cbd5e1',
                  color: '#475569',
                  cursor: 'pointer',
                  display: 'flex',
                }}
              >
                <ZoomIn size={13} />
              </button>
            </div>
          </div>
        </div>

        {/* Khung chứa tờ giấy bảng thực đơn */}
        <div
          style={{
            background: '#f8fafc',
            borderRadius: '6px',
            padding: '14px 8px 10px',
            display: 'flex',
            justifyContent: 'center',
            overflowX: 'auto',
          }}
        >
          <div
            style={{
              transform: `scale(${zoomScale})`,
              transformOrigin: 'top center',
              transition: 'transform 0.15s ease-out',
            }}
          >
            {/* TỜ THỰC ĐƠN IN ẤN (Theo mẫu trong ảnh) */}
            <div
              ref={printRef}
              id="school-menu-preview-board"
              style={{
                width: '570px',
                minHeight: '790px',
                background: '#ffffff',
                padding: '46px 30px 34px',
                color: '#000000',
                fontFamily: getFontFamily(),
                boxSizing: 'border-box',
              }}
            >
              {/* TIÊU ĐỀ BẢNG THỰC ĐƠN */}
              <div style={{ textAlign: 'center', marginBottom: '22px' }}>
                <h1
                  style={{
                    fontSize: '20px',
                    fontWeight: 'bold',
                    textTransform: 'uppercase',
                    letterSpacing: '0.4px',
                    lineHeight: '1.3',
                    margin: '0 0 6px 0',
                  }}
                >
                  THỰC ĐƠN {menuData.schoolName || 'TRƯỜNG HỌC'}
                </h1>
                <h2
                  style={{
                    fontSize: '20px',
                    fontWeight: 'bold',
                    textTransform: 'uppercase',
                    letterSpacing: '0.8px',
                    margin: '0 0 6px 0',
                  }}
                >
                  TUẦN {menuData.weekNumber || '—'}
                </h2>
                <div
                  style={{
                    fontSize: '15px',
                    fontStyle: 'normal',
                    color: '#000000',
                  }}
                >
                  {dateRangeText}
                </div>
              </div>

              {/* BẢNG HAI CỘT: "THỨ" VÀ "THỰC ĐƠN" */}
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
                        fontSize: '16px',
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
                        fontSize: '16px',
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
                        {/* Cột THỨ */}
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
                              fontSize: '16px',
                              fontWeight: 'bold',
                              lineHeight: '1.3',
                              marginBottom: '2px',
                            }}
                          >
                            Thứ {day.dayOfWeek}
                          </div>
                          <div
                            style={{
                              fontSize: '15px',
                              fontWeight: 'bold',
                              lineHeight: '1.3',
                            }}
                          >
                            {cleanDateOnly(day.dateDisplay)}
                          </div>
                        </td>

                        {/* Cột THỰC ĐƠN */}
                        <td
                          style={{
                            border: '1.5px solid #000000',
                            verticalAlign: 'top',
                            padding: '12px 18px',
                          }}
                        >
                          {/* Bữa chính */}
                          <div style={{ marginBottom: '10px' }}>
                            <div
                              style={{
                                fontSize: '15px',
                                fontWeight: 'bold',
                                marginBottom: '4px',
                              }}
                            >
                              Bữa chính:
                            </div>

                            <div style={{ paddingLeft: '14px' }}>
                              {day.mainMeals && day.mainMeals.length > 0 ? (
                                day.mainMeals.map((dish, dIdx) => (
                                  <div
                                    key={dIdx}
                                    style={{
                                      fontSize: '15px',
                                      lineHeight: '1.55',
                                      color: '#000000',
                                    }}
                                  >
                                    • {dish}
                                  </div>
                                ))
                              ) : (
                                <span style={{ fontSize: '14px', fontStyle: 'italic', color: '#666' }}>
                                  (Chưa có món)
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Bữa phụ */}
                          <div>
                            <div
                              style={{
                                fontSize: '15px',
                                fontWeight: 'bold',
                                marginBottom: '4px',
                              }}
                            >
                              Bữa phụ:
                            </div>
                            <div style={{ paddingLeft: '14px' }}>
                              {day.sideMeals && day.sideMeals.length > 0 ? (
                                day.sideMeals.map((dish, dIdx) => (
                                  <div
                                    key={dIdx}
                                    style={{
                                      fontSize: '15px',
                                      lineHeight: '1.55',
                                      color: '#000000',
                                    }}
                                  >
                                    • {dish}
                                  </div>
                                ))
                              ) : (
                                <span style={{ fontSize: '14px', fontStyle: 'italic', color: '#666' }}>
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
                          padding: '24px',
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
  }
);

MenuPreview.displayName = 'MenuPreview';
