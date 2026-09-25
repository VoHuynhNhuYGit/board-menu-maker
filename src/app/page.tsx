'use client';

import React, { useState, useEffect } from 'react';
import { IMenuData, IDishItem } from '@/types';
import { Navbar } from '@/components/Navbar';
import { MenuForm } from '@/components/MenuForm';
import { MenuPreview } from '@/components/MenuPreview';
import { DishManagerModal } from '@/components/DishManagerModal';
import { SavedMenusModal } from '@/components/SavedMenusModal';
import { SchoolsView } from '@/components/SchoolsView';
import { DishesView } from '@/components/DishesView';
import { CheckCircle2, AlertCircle, Info } from 'lucide-react';

// Dữ liệu mẫu khởi tạo chuẩn theo file tuan-3.docx
const SAMPLE_WEEK_3_DATA: IMenuData = {
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

interface ToastMessage {
  id: string;
  text: string;
  type: 'success' | 'error' | 'info';
}

export default function HomePage() {
  const [activeTab, setActiveTab] = useState<'menu' | 'schools' | 'dishes'>('menu');
  const [menuData, setMenuData] = useState<IMenuData>(SAMPLE_WEEK_3_DATA);
  const [availableDishes, setAvailableDishes] = useState<IDishItem[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [dbStatus, setDbStatus] = useState<'connected' | 'connecting' | 'error'>('connecting');

  // Modals state
  const [isDishManagerOpen, setIsDishManagerOpen] = useState(false);
  const [isSavedMenusOpen, setIsSavedMenusOpen] = useState(false);

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
          // Gắn ID của bản ghi mẫu tuần 3 nếu tìm thấy
          const week3Menu = menusData.data.find(
            (m: any) => m.weekNumber === 3 && m.schoolName.includes('Trưng Vương')
          );
          if (week3Menu) {
            setMenuData(week3Menu);
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

  // Xử lý Lưu thực đơn vào MongoDB
  const handleSaveMenu = async () => {
    if (!menuData.schoolName.trim()) {
      showToast('Vui lòng nhập tên trường học', 'error');
      return;
    }
    if (!menuData.weekNumber) {
      showToast('Vui lòng nhập số tuần', 'error');
      return;
    }
    if (!menuData.startDate || !menuData.endDate) {
      showToast('Vui lòng nhập khoảng ngày bắt đầu và kết thúc', 'error');
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
            ? 'Đã cập nhật thực đơn thành công trên MongoDB!'
            : 'Đã lưu thực đơn mới thành công vào MongoDB!',
          'success'
        );
        // Tải lại kho món ăn vì các món mới đã được tự động lưu
        await fetchDishes();
      } else {
        showToast(result.error || 'Lỗi khi lưu thực đơn', 'error');
      }
    } catch (err) {
      console.error('Lỗi khi lưu thực đơn:', err);
      showToast('Không thể kết nối đến máy chủ MongoDB', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  // Nạp lại thực đơn mẫu Tuần 3
  const handleLoadSampleWeek3 = () => {
    setMenuData({
      ...SAMPLE_WEEK_3_DATA,
      _id: menuData._id, // Giữ ID nếu đang chỉnh sửa
    });
    showToast('Đã nạp lại thực đơn mẫu Tuần 3', 'info');
  };

  // Tạo thực đơn mới (trắng / nháp)
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
    if (isClone) {
      // Nhân bản: tăng tuần lên 1 và xóa _id để tạo bản ghi mới khi bấm Lưu
      const currentWeekNum = Number(loadedMenu.weekNumber) || 1;
      setMenuData({
        ...loadedMenu,
        _id: undefined,
        weekNumber: currentWeekNum + 1,
      });
    } else {
      setMenuData(loadedMenu);
    }
  };

  // Chọn trường từ tab Trường học để lập thực đơn ngay lập tức
  const handleSelectSchoolForMenu = (schoolName: string) => {
    setMenuData((prev) => ({ ...prev, schoolName }));
    setActiveTab('menu');
    showToast(`Đã chọn ${schoolName} để lập thực đơn!`, 'success');
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Thanh điều hướng */}
      <Navbar
        currentMenu={menuData}
        onNewMenu={handleNewMenu}
        onLoadSampleWeek3={handleLoadSampleWeek3}
        onOpenDishManager={() => setIsDishManagerOpen(true)}
        onOpenSavedMenus={() => setIsSavedMenusOpen(true)}
        onSaveMenu={handleSaveMenu}
        isSaving={isSaving}
        dbStatus={dbStatus}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />

      {/* Khu vực nội dung hiển thị theo tab (Chuyển đổi tức thì 0ms, không load lại trang) */}
      <main
        style={{
          maxWidth: '1600px',
          width: '100%',
          margin: '0 auto',
          padding: '24px 20px',
          flex: 1,
        }}
      >
        {activeTab === 'menu' && (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(480px, 1fr))',
              gap: '24px',
              alignItems: 'start',
              animation: 'fadeIn 0.2s ease-out',
            }}
          >
            {/* CỘT TRÁI: BIỂU MẪU NHẬP LIỆU */}
            <section aria-label="Biểu mẫu thực đơn">
              <MenuForm
                menuData={menuData}
                setMenuData={setMenuData}
                availableDishes={availableDishes}
              />
            </section>

            {/* CỘT PHẢI: ẢNH XEM TRƯỚC VÀ XUẤT FILE */}
            <section aria-label="Xem trước thực đơn và xuất file">
              <MenuPreview menuData={menuData} />
            </section>
          </div>
        )}

        {activeTab === 'schools' && (
          <SchoolsView
            onSelectSchoolForMenu={handleSelectSchoolForMenu}
            showToast={showToast}
          />
        )}

        {activeTab === 'dishes' && (
          <DishesView
            onRefreshParentDishes={fetchDishes}
            showToast={showToast}
          />
        )}
      </main>

      {/* Modal Quản lý kho món ăn */}
      <DishManagerModal
        isOpen={isDishManagerOpen}
        onClose={() => setIsDishManagerOpen(false)}
        dishes={availableDishes}
        onRefreshDishes={fetchDishes}
        showToast={showToast}
      />

      {/* Modal Danh sách thực đơn đã lưu */}
      <SavedMenusModal
        isOpen={isSavedMenusOpen}
        onClose={() => setIsSavedMenusOpen(false)}
        onLoadMenu={handleLoadMenu}
        showToast={showToast}
      />

      {/* Danh sách thông báo Toast */}
      <div className="toast-container">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`toast-item ${
              toast.type === 'success'
                ? 'toast-success'
                : toast.type === 'error'
                ? 'toast-error'
                : 'toast-info'
            }`}
          >
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
