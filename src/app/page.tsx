'use client';

import React, { useState, useEffect, useRef } from 'react';
import { IMenuData, IDishItem } from '@/types';
import { Sidebar } from '@/components/Sidebar';
import { MenuForm } from '@/components/MenuForm';
import { MenuPreview, MenuPreviewHandle } from '@/components/MenuPreview';
import { DishManagerModal } from '@/components/DishManagerModal';
import { SavedMenusModal } from '@/components/SavedMenusModal';
import { SchoolsView } from '@/components/SchoolsView';
import { DishesView } from '@/components/DishesView';
import {
  Save,
  Image as ImageIcon,
  FileText,
  CheckCircle2,
  AlertCircle,
  Info,
} from 'lucide-react';

// Dữ liệu mẫu khởi tạo chuẩn theo file tuan-3.docx
const SAMPLE_WEEK_3_DATA: IMenuData = {
  schoolName: 'Trường Tiểu học Trưng Vương',
  weekNumber: 3,
  startDate: '2026-09-28',
  endDate: '2026-10-01',
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
      mainMeals: ['Nạc dăm kho đậu hũ', 'Canh cải ngọt thịt bằm', 'Bông cải cà rốt xào', 'Cơm trắng'],
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

const normalizeDateValue = (value?: string) => {
  if (!value) return '';
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return value;
  const match = value.match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{4})$/);
  if (!match) return value;
  const [, day, month, year] = match;
  return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
};

interface ToastMessage {
  id: string;
  text: string;
  type: 'success' | 'error' | 'info';
}

export default function HomePage() {
  const [activeTab, setActiveTab] = useState<'menu' | 'saved' | 'schools' | 'dishes'>('menu');
  const [menuData, setMenuData] = useState<IMenuData>(SAMPLE_WEEK_3_DATA);
  const [availableDishes, setAvailableDishes] = useState<IDishItem[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [dbStatus, setDbStatus] = useState<'connected' | 'connecting' | 'error'>('connecting');

  // Ref đến MenuPreview để xuất file ảnh PNG & PDF
  const previewRef = useRef<MenuPreviewHandle>(null);

  // Modals state
  const [isDishManagerOpen, setIsDishManagerOpen] = useState(false);

  // Toasts
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const showToast = (text: string, type: 'success' | 'error' | 'info' = 'success') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, text, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3800);
  };

  // Tải danh sách món ăn từ MongoDB
  const fetchDishes = async () => {
    try {
      const res = await fetch('/api/dishes');
      const data = await res.json();
      if (data.success) {
        setAvailableDishes(data.data || []);
        setDbStatus('connected');
      } else {
        setDbStatus('error');
      }
    } catch (e) {
      console.error('Lỗi kết nối API dishes:', e);
      setDbStatus('error');
    }
  };

  // Tự động tải dữ liệu ban đầu
  useEffect(() => {
    const initData = async () => {
      try {
        await fetchDishes();
        // Kiểm tra xem đã có thực đơn nào trong DB chưa
        const menusRes = await fetch('/api/menus');
        const menusData = await menusRes.json();
        if (menusData.success && menusData.data && menusData.data.length > 0) {
          const week3Menu = menusData.data.find(
            (m: any) => m.weekNumber === 3 && m.schoolName?.includes('Trưng Vương')
          );
          if (week3Menu) {
            setMenuData({
              ...week3Menu,
              startDate: normalizeDateValue(week3Menu.startDate),
              endDate: normalizeDateValue(week3Menu.endDate),
            });
          }
        }

        // Nếu có query param ?school=... từ trang quản lý trường
        if (typeof window !== 'undefined') {
          const urlParams = new URLSearchParams(window.location.search);
          const schoolParam = urlParams.get('school');
          if (schoolParam) {
            setMenuData((prev) => ({ ...prev, schoolName: decodeURIComponent(schoolParam) }));
          }
        }
      } catch (e) {
        console.error('Lỗi khởi tạo dữ liệu:', e);
      }
    };

    initData();
  }, []);

  // Lưu thực đơn vào MongoDB
  const handleSaveMenu = async () => {
    if (!menuData.schoolName) {
      showToast('Vui lòng chọn hoặc nhập tên trường học', 'error');
      return;
    }
    if (!menuData.weekNumber) {
      showToast('Vui lòng nhập số tuần', 'error');
      return;
    }

    setIsSaving(true);
    try {
      const isUpdating = Boolean(menuData._id);
      const url = isUpdating ? `/api/menus/${menuData._id}` : '/api/menus';
      const method = isUpdating ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(menuData),
      });

      const result = await res.json();
      if (result.success) {
        setMenuData(result.data);
        showToast(
          isUpdating
            ? 'Đã cập nhật thực đơn thành công!'
            : 'Đã lưu thực đơn mới thành công!',
          'success'
        );
        await fetchDishes();
      } else {
        showToast(result.error || 'Lỗi khi lưu thực đơn', 'error');
      }
    } catch (err) {
      console.error('Lỗi khi lưu thực đơn:', err);
      showToast('Không thể kết nối đến máy chủ', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  // Nạp lại thực đơn mẫu Tuần 3
  const handleLoadSampleWeek3 = () => {
    setMenuData({
      ...SAMPLE_WEEK_3_DATA,
      _id: menuData._id,
    });
    showToast('Đã nạp lại thực đơn mẫu Tuần 3', 'info');
  };

  // Tạo thực đơn mới
  const handleNewMenu = () => {
    const nextWeek = typeof menuData.weekNumber === 'number' ? menuData.weekNumber + 1 : 4;
    setMenuData({
      schoolName: menuData.schoolName || 'Trường Tiểu học Trưng Vương',
      weekNumber: nextWeek,
      startDate: '',
      endDate: '',
      days: [
        {
          dayOfWeek: '2',
          dateDisplay: 'Ngày ...',
          dateValue: '',
          mainMeals: ['Cơm trắng'],
          sideMeals: ['Sữa'],
        },
      ],
    });
    showToast(`Đã tạo bản nháp mới cho Tuần ${nextWeek}`, 'info');
  };

  // Tải một thực đơn từ danh sách đã lưu
  const handleLoadMenu = (loadedMenu: IMenuData, isClone = false) => {
    const normalizedMenu = {
      ...loadedMenu,
      startDate: normalizeDateValue(loadedMenu.startDate),
      endDate: normalizeDateValue(loadedMenu.endDate),
    };
    if (isClone) {
      const currentWeekNum = Number(normalizedMenu.weekNumber) || 1;
      setMenuData({
        ...normalizedMenu,
        _id: undefined,
        weekNumber: currentWeekNum + 1,
      });
    } else {
      setMenuData(normalizedMenu);
    }
  };

  // Chọn trường từ tab Trường học để lập thực đơn
  const handleSelectSchoolForMenu = (schoolName: string) => {
    setMenuData((prev) => ({ ...prev, schoolName }));
    setActiveTab('menu');
    showToast(`Đã chọn ${schoolName} để lập thực đơn!`, 'success');
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#f8fafc' }}>
      {/* 1. SIDEBAR BÊN TRÁI (Chuẩn giao diện trong ảnh) */}
      <Sidebar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onNewMenu={handleNewMenu}
        onLoadSampleWeek3={handleLoadSampleWeek3}
        dbStatus={dbStatus}
      />

      {/* 2. KHU VỰC NỘI DUNG CHÍNH */}
      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          minWidth: 0,
          padding: '24px 20px 32px',
        }}
      >
        {activeTab === 'menu' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '26px' }}>
            {/* TOP HEADER THANH TIÊU ĐỀ VÀ CÁC NÚT THAO TÁC */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '16px',
                padding: '0 12px',
              }}
            >
              <div>
                <h1
                  style={{
                    fontSize: '1.7rem',
                    fontWeight: 800,
                    color: '#0f172a',
                    letterSpacing: '-0.4px',
                    margin: 0,
                  }}
                >
                  Tạo thực đơn tuần
                </h1>
                <p
                  style={{
                    fontSize: '0.88rem',
                    color: '#64748b',
                    marginTop: '4px',
                  }}
                >
                  Nhập thông tin và chọn món ăn cho từng ngày. Bạn có thể xem trước và xuất thực đơn ở bên phải.
                </p>
              </div>

              {/* 3 Nút Thao Tác Bên Phải Header (Lưu, Tải PNG, Tải PDF) */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                {/* Lưu thực đơn */}
                <button
                  type="button"
                  onClick={handleSaveMenu}
                  disabled={isSaving}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    background: '#096dd9',
                    color: '#ffffff',
                    padding: '14px 18px',
                    borderRadius: '8px',
                    fontSize: '0.88rem',
                    fontWeight: 600,
                    boxShadow: '0 2px 6px rgba(9, 109, 217, 0.25)',
                    cursor: 'pointer',
                    opacity: isSaving ? 0.7 : 1,
                  }}
                >
                  <Save size={16} />
                  <span>{isSaving ? 'Đang lưu...' : 'Lưu thực đơn'}</span>
                </button>

                {/* Tải ảnh PNG */}
                <button
                  type="button"
                  onClick={() => previewRef.current?.exportPNG()}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    background: '#ffffff',
                    color: '#0f172a',
                    border: '1px solid #cbd5e1',
                    padding: '14px 18px',
                    borderRadius: '8px',
                    fontSize: '0.88rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
                  }}
                >
                  <ImageIcon size={16} color="#475569" />
                  <span>Tải ảnh PNG</span>
                </button>

                {/* Tải PDF */}
                <button
                  type="button"
                  onClick={() => previewRef.current?.exportPDF()}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    background: '#ffffff',
                    color: '#0f172a',
                    border: '1px solid #cbd5e1',
                    padding: '14px 18px',
                    borderRadius: '8px',
                    fontSize: '0.88rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
                  }}
                >
                  <FileText size={16} color="#475569" />
                  <span>Tải PDF</span>
                </button>
              </div>
            </div>

            {/* BỐ CỤC 2 CỘT: CỘT TRÁI (FORM) VÀ CỘT PHẢI (XEM TRƯỚC) */}
            <div
              className="menu-workspace-grid"
              style={{
                display: 'grid',
                gridTemplateColumns: 'minmax(0, 1.38fr) minmax(0, 1fr)',
                gap: '14px',
                alignItems: 'start',
              }}
            >
              {/* Cột trái: Nhập thông tin & món ăn */}
              <section aria-label="Biểu mẫu thực đơn">
                <MenuForm
                  menuData={menuData}
                  setMenuData={setMenuData}
                  availableDishes={availableDishes}
                  onNavigateToSchools={() => setActiveTab('schools')}
                />
              </section>

              {/* Cột phải: Xem trước bảng thực đơn */}
              <section aria-label="Xem trước thực đơn">
                <MenuPreview ref={previewRef} menuData={menuData} />
              </section>
            </div>
          </div>
        )}

        {/* TAB TRƯỜNG HỌC */}
        {activeTab === 'schools' && (
          <SchoolsView
            onSelectSchoolForMenu={handleSelectSchoolForMenu}
            showToast={showToast}
          />
        )}

        {/* TAB THỰC ĐƠN ĐÃ LƯU */}
        {activeTab === 'saved' && (
          <SavedMenusModal
            isOpen
            embedded
            onClose={() => setActiveTab('menu')}
            onLoadMenu={handleLoadMenu}
            showToast={showToast}
          />
        )}

        {/* TAB KHO MÓN ĂN */}
        {activeTab === 'dishes' && (
          <DishesView
            onRefreshParentDishes={fetchDishes}
            showToast={showToast}
          />
        )}
      </div>

      {/* Modal Quản lý kho món ăn */}
      {isDishManagerOpen && (
        <DishManagerModal
          isOpen={isDishManagerOpen}
          onClose={() => setIsDishManagerOpen(false)}
          dishes={availableDishes}
          onRefreshDishes={fetchDishes}
          showToast={showToast}
        />
      )}

      {/* Toasts thông báo góc phải */}
      <div className="toast-container">
        {toasts.map((toast) => (
          <div key={toast.id} className={`toast-item toast-${toast.type}`}>
            {toast.type === 'success' && <CheckCircle2 size={18} />}
            {toast.type === 'error' && <AlertCircle size={18} />}
            {toast.type === 'info' && <Info size={18} />}
            <span>{toast.text}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
