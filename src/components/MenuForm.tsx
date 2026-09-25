'use client';

import React, { useState, useEffect, useRef } from 'react';
import { IMenuData, IDayPlan, IDishItem, ISchoolItem } from '@/types';
import { matchVietnamese } from '@/lib/vietnamese';
import { MealDishesList } from './MealDishesList';
import {
  Calendar,
  Building,
  Hash,
  Plus,
  Trash2,
  ChevronDown,
  ChevronUp,
  Sparkles,
  School,
  Check,
  X,
} from 'lucide-react';

interface MenuFormProps {
  menuData: IMenuData;
  setMenuData: React.Dispatch<React.SetStateAction<IMenuData>>;
  availableDishes: IDishItem[];
  onNavigateToSchools?: () => void;
}

export const MenuForm: React.FC<MenuFormProps> = ({
  menuData,
  setMenuData,
  availableDishes,
  onNavigateToSchools,
}) => {
  const [schools, setSchools] = useState<ISchoolItem[]>([]);
  const [schoolSearch, setSchoolSearch] = useState('');
  const [showSchoolDropdown, setShowSchoolDropdown] = useState(false);
  const schoolDropdownRef = useRef<HTMLDivElement>(null);

  // Tải danh sách trường từ MongoDB
  const fetchSchools = () => {
    fetch('/api/schools')
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setSchools(data.data || []);
        }
      })
      .catch((err) => console.error(err));
  };

  useEffect(() => {
    fetchSchools();
  }, []);

  // Đóng dropdown khi click ngoài
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        schoolDropdownRef.current &&
        !schoolDropdownRef.current.contains(e.target as Node)
      ) {
        setShowSchoolDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const matchingSchools = schools.filter((s) =>
    schoolSearch.trim() ? matchVietnamese(s.name, schoolSearch) : true
  );

  // Hàm tính thứ và định dạng "Ngày D/M" từ date string YYYY-MM-DD
  const calculateDayInfo = (dateStr: string) => {
    if (!dateStr) return { dayOfWeek: '2', dateDisplay: '' };
    try {
      const parts = dateStr.split('-');
      if (parts.length === 3) {
        const year = parseInt(parts[0], 10);
        const month = parseInt(parts[1], 10) - 1;
        const day = parseInt(parts[2], 10);
        const dateObj = new Date(year, month, day);

        const dayNum = dateObj.getDay();
        let dow = '2';
        if (dayNum === 0) dow = 'CN';
        else if (dayNum === 1) dow = '2';
        else if (dayNum === 2) dow = '3';
        else if (dayNum === 3) dow = '4';
        else if (dayNum === 4) dow = '5';
        else if (dayNum === 5) dow = '6';
        else if (dayNum === 6) dow = '7';

        const display = `Ngày ${day}/${month + 1}`;
        return { dayOfWeek: dow, dateDisplay: display };
      }
    } catch (e) {
      console.error('Date parse error:', e);
    }
    return { dayOfWeek: '2', dateDisplay: '' };
  };

  // Cập nhật trường thông tin cơ bản
  const handleFieldChange = (field: keyof IMenuData, value: any) => {
    setMenuData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Cập nhật ngày bắt đầu / kết thúc và đồng bộ tiêu đề nếu cần
  const handleStartDateChange = (val: string) => {
    handleFieldChange('startDate', val);
  };

  const handleEndDateChange = (val: string) => {
    handleFieldChange('endDate', val);
  };

  // Cập nhật thông tin của một ngày cụ thể
  const handleDayChange = (index: number, updatedDay: IDayPlan) => {
    const newDays = [...menuData.days];
    newDays[index] = updatedDay;
    setMenuData((prev) => ({ ...prev, days: newDays }));
  };

  // Đổi ngày từ Date picker -> Tự động tính Thứ và Ngày nhưng cho phép sửa tay
  const handleDateValuePick = (index: number, newDateVal: string) => {
    const current = menuData.days[index];
    const { dayOfWeek, dateDisplay } = calculateDayInfo(newDateVal);
    handleDayChange(index, {
      ...current,
      dateValue: newDateVal,
      dayOfWeek: dayOfWeek,
      dateDisplay: dateDisplay,
    });
  };

  // Thêm một ngày mới vào thực đơn
  const handleAddDay = () => {
    const currentDays = menuData.days;
    let nextDateVal = '';
    let nextDow = '2';
    let nextDisplay = 'Ngày ...';

    if (currentDays.length > 0) {
      const lastDay = currentDays[currentDays.length - 1];
      if (lastDay.dateValue) {
        try {
          const parts = lastDay.dateValue.split('-');
          const d = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
          d.setDate(d.getDate() + 1);
          // Định dạng YYYY-MM-DD
          const y = d.getFullYear();
          const m = String(d.getMonth() + 1).padStart(2, '0');
          const day = String(d.getDate()).padStart(2, '0');
          nextDateVal = `${y}-${m}-${day}`;
          const calc = calculateDayInfo(nextDateVal);
          nextDow = calc.dayOfWeek;
          nextDisplay = calc.dateDisplay;
        } catch (e) {}
      } else {
        const lastDowNum = parseInt(lastDay.dayOfWeek, 10);
        if (!isNaN(lastDowNum) && lastDowNum < 7) {
          nextDow = String(lastDowNum + 1);
        }
      }
    }

    const newDayPlan: IDayPlan = {
      dayOfWeek: nextDow,
      dateDisplay: nextDisplay,
      dateValue: nextDateVal,
      mainMeals: ['Cơm trắng'],
      sideMeals: ['Sữa'],
    };

    setMenuData((prev) => ({
      ...prev,
      days: [...prev.days, newDayPlan],
    }));
  };

  // Xóa một ngày
  const handleDeleteDay = (index: number) => {
    if (menuData.days.length <= 1) {
      alert('Thực đơn cần ít nhất một ngày!');
      return;
    }
    const updated = menuData.days.filter((_, idx) => idx !== index);
    setMenuData((prev) => ({ ...prev, days: updated }));
  };

  // Di chuyển ngày lên / xuống
  const handleMoveDay = (index: number, direction: 'up' | 'down') => {
    if (
      (direction === 'up' && index === 0) ||
      (direction === 'down' && index === menuData.days.length - 1)
    ) {
      return;
    }
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    const newDays = [...menuData.days];
    const temp = newDays[targetIdx];
    newDays[targetIdx] = newDays[index];
    newDays[index] = temp;
    setMenuData((prev) => ({ ...prev, days: newDays }));
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '20px',
        padding: '20px',
        background: '#ffffff',
        borderRadius: '16px',
        boxShadow: '0 4px 20px -2px rgba(0,0,0,0.06)',
        border: '1px solid #f1f5f9',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Sparkles size={20} color="#2563eb" />
          <span>Thông tin thực đơn</span>
        </h2>
        <span style={{ fontSize: '0.8rem', color: '#64748b', background: '#f1f5f9', padding: '4px 10px', borderRadius: '20px' }}>
          {menuData.days.length} ngày trong tuần
        </span>
      </div>

      {/* Thông tin trường và tuần */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px' }}>
        <div style={{ position: 'relative' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.82rem', fontWeight: 600, color: '#475569' }}>
              <Building size={14} color="#2563eb" />
              Tên trường học (Chỉ lấy trong MongoDB)
            </label>
            {onNavigateToSchools && (
              <button
                type="button"
                onClick={onNavigateToSchools}
                style={{
                  background: 'transparent',
                  color: '#2563eb',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  padding: 0,
                }}
                title="Đến trang quản lý trường để thêm hoặc sửa danh sách trường"
              >
                + Thêm trường
              </button>
            )}
          </div>

          {/* Ô chọn trường có sẵn trong MongoDB */}
          <div
            onClick={() => {
              if (!showSchoolDropdown) {
                fetchSchools();
              }
              setShowSchoolDropdown((prev) => !prev);
            }}
            style={{
              width: '100%',
              padding: '9px 12px',
              borderRadius: '8px',
              border: '1px solid #cbd5e1',
              fontSize: '0.9rem',
              color: menuData.schoolName ? '#0f172a' : '#94a3b8',
              background: '#f8fafc',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              userSelect: 'none',
            }}
          >
            <span style={{ fontWeight: menuData.schoolName ? 600 : 400, textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
              {menuData.schoolName || '-- Chọn trường có sẵn trong MongoDB --'}
            </span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              {menuData.schoolName && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleFieldChange('schoolName', '');
                  }}
                  title="Bỏ chọn trường"
                  style={{
                    background: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    color: '#94a3b8',
                    display: 'flex',
                    alignItems: 'center',
                    padding: '2px',
                  }}
                >
                  <X size={14} />
                </button>
              )}
              <ChevronDown size={16} color="#64748b" />
            </div>
          </div>

          {/* Hộp Dropdown danh sách trường có sẵn trong MongoDB */}
          {showSchoolDropdown && (
            <div
              ref={schoolDropdownRef}
              style={{
                position: 'absolute',
                top: 'calc(100% + 4px)',
                left: 0,
                right: 0,
                background: '#ffffff',
                border: '1px solid #cbd5e1',
                borderRadius: '10px',
                boxShadow: '0 10px 20px -3px rgba(0,0,0,0.12)',
                zIndex: 100,
                maxHeight: '260px',
                overflowY: 'auto',
                padding: '6px',
              }}
            >
              {/* Ô tìm kiếm nhanh trường trong MongoDB */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  background: '#f1f5f9',
                  borderRadius: '6px',
                  padding: '6px 8px',
                  marginBottom: '6px',
                }}
              >
                <Building size={14} color="#64748b" />
                <input
                  type="text"
                  value={schoolSearch}
                  onChange={(e) => setSchoolSearch(e.target.value)}
                  placeholder="Gõ tìm trường trong MongoDB..."
                  onClick={(e) => e.stopPropagation()}
                  autoFocus
                  style={{
                    border: 'none',
                    outline: 'none',
                    background: 'transparent',
                    fontSize: '0.82rem',
                    width: '100%',
                    color: '#1e293b',
                  }}
                />
                {schoolSearch && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSchoolSearch('');
                    }}
                    style={{ background: 'transparent', color: '#94a3b8' }}
                  >
                    <Trash2 size={12} />
                  </button>
                )}
              </div>

              <div style={{ fontSize: '0.7rem', color: '#64748b', padding: '2px 8px 6px', fontWeight: 600 }}>
                Chọn 1 trường trong MongoDB ({matchingSchools.length}):
              </div>

              {matchingSchools.length > 0 ? (
                matchingSchools.map((s) => (
                  <div
                    key={s._id || s.name}
                    onClick={() => {
                      handleFieldChange('schoolName', s.name);
                      setShowSchoolDropdown(false);
                      setSchoolSearch('');
                    }}
                    style={{
                      padding: '8px 10px',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      fontSize: '0.85rem',
                      background: menuData.schoolName === s.name ? '#eff6ff' : 'transparent',
                    }}
                    onMouseEnter={(e) => {
                      if (menuData.schoolName !== s.name) e.currentTarget.style.background = '#f8fafc';
                    }}
                    onMouseLeave={(e) => {
                      if (menuData.schoolName !== s.name) e.currentTarget.style.background = 'transparent';
                    }}
                  >
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <span style={{ fontWeight: 600, color: '#1e293b' }}>{s.name}</span>
                      {s.address && <span style={{ fontSize: '0.72rem', color: '#64748b' }}>{s.address}</span>}
                    </div>
                    {menuData.schoolName === s.name && <Check size={14} color="#2563eb" />}
                  </div>
                ))
              ) : (
                <div style={{ padding: '12px 8px', textAlign: 'center', color: '#94a3b8', fontSize: '0.8rem' }}>
                  Không có trường nào khớp trong MongoDB.
                  {onNavigateToSchools && (
                    <div style={{ marginTop: '6px' }}>
                      <button
                        type="button"
                        onClick={() => {
                          setShowSchoolDropdown(false);
                          onNavigateToSchools();
                        }}
                        style={{
                          background: '#eff6ff',
                          color: '#2563eb',
                          border: '1px solid #bfdbfe',
                          padding: '4px 10px',
                          borderRadius: '6px',
                          fontSize: '0.75rem',
                          fontWeight: 600,
                          cursor: 'pointer',
                        }}
                      >
                        + Bấm vào đây để thêm trường mới
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        <div>
          <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.82rem', fontWeight: 600, color: '#475569', marginBottom: '6px' }}>
            <Hash size={14} color="#2563eb" />
            Số tuần
          </label>
          <input
            type="number"
            value={menuData.weekNumber}
            onChange={(e) => handleFieldChange('weekNumber', e.target.value)}
            placeholder="Ví dụ: 3"
            min={1}
            max={52}
            style={{
              width: '100%',
              padding: '9px 12px',
              borderRadius: '8px',
              border: '1px solid #cbd5e1',
              fontSize: '0.9rem',
              color: '#0f172a',
              background: '#f8fafc',
            }}
          />
        </div>
      </div>

      {/* Khoảng ngày */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px' }}>
        <div>
          <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.82rem', fontWeight: 600, color: '#475569', marginBottom: '6px' }}>
            <Calendar size={14} color="#2563eb" />
            Ngày bắt đầu
          </label>
          <input
            type="text"
            value={menuData.startDate}
            onChange={(e) => handleStartDateChange(e.target.value)}
            placeholder="Ví dụ: 28/9/2026"
            style={{
              width: '100%',
              padding: '9px 12px',
              borderRadius: '8px',
              border: '1px solid #cbd5e1',
              fontSize: '0.9rem',
              color: '#0f172a',
              background: '#f8fafc',
            }}
          />
        </div>

        <div>
          <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.82rem', fontWeight: 600, color: '#475569', marginBottom: '6px' }}>
            <Calendar size={14} color="#2563eb" />
            Ngày kết thúc
          </label>
          <input
            type="text"
            value={menuData.endDate}
            onChange={(e) => handleEndDateChange(e.target.value)}
            placeholder="Ví dụ: 1/10/2026"
            style={{
              width: '100%',
              padding: '9px 12px',
              borderRadius: '8px',
              border: '1px solid #cbd5e1',
              fontSize: '0.9rem',
              color: '#0f172a',
              background: '#f8fafc',
            }}
          />
        </div>
      </div>

      <hr style={{ border: 'none', borderTop: '1px dashed #e2e8f0', margin: '4px 0' }} />

      {/* Bảng nhập món theo từng ngày */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#1e293b' }}>
            Bảng thực đơn các ngày
          </h3>
          <button
            type="button"
            onClick={handleAddDay}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              background: '#eff6ff',
              color: '#2563eb',
              border: '1px solid #bfdbfe',
              padding: '6px 12px',
              borderRadius: '8px',
              fontSize: '0.82rem',
              fontWeight: 600,
            }}
          >
            <Plus size={14} />
            <span>Thêm ngày</span>
          </button>
        </div>

        {menuData.days.map((dayPlan, dayIndex) => (
          <div
            key={dayIndex}
            style={{
              background: '#fafbfc',
              border: '1px solid #e2e8f0',
              borderRadius: '12px',
              padding: '14px',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
              boxShadow: '0 2px 6px rgba(0,0,0,0.02)',
              position: 'relative',
            }}
          >
            {/* Header của ngày */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '8px',
                background: '#ffffff',
                padding: '8px 12px',
                borderRadius: '8px',
                border: '1px solid #f1f5f9',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                <span
                  style={{
                    background: '#2563eb',
                    color: '#ffffff',
                    fontWeight: 700,
                    fontSize: '0.8rem',
                    padding: '2px 8px',
                    borderRadius: '6px',
                  }}
                >
                  Ngày #{dayIndex + 1}
                </span>

                {/* Chọn ngày từ lịch datepicker */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <label style={{ fontSize: '0.75rem', color: '#64748b' }}>Chọn ngày:</label>
                  <input
                    type="date"
                    value={dayPlan.dateValue || ''}
                    onChange={(e) => handleDateValuePick(dayIndex, e.target.value)}
                    style={{
                      padding: '3px 8px',
                      borderRadius: '6px',
                      border: '1px solid #cbd5e1',
                      fontSize: '0.8rem',
                      background: '#fff',
                    }}
                  />
                </div>

                {/* Ô sửa Thứ (tự tính hoặc gõ tay) */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <label style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>Thứ:</label>
                  <input
                    type="text"
                    value={dayPlan.dayOfWeek}
                    onChange={(e) =>
                      handleDayChange(dayIndex, { ...dayPlan, dayOfWeek: e.target.value })
                    }
                    placeholder="2, 3, 4, 5..."
                    style={{
                      width: '45px',
                      textAlign: 'center',
                      padding: '3px 6px',
                      borderRadius: '6px',
                      border: '1px solid #cbd5e1',
                      fontSize: '0.82rem',
                      fontWeight: 700,
                      background: '#ffffff',
                    }}
                    title="Thứ trong tuần (tự động tính khi chọn ngày, có thể sửa tay)"
                  />
                </div>

                {/* Ô sửa hiển thị ngày (ví dụ: Ngày 28/9) */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <label style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>Hiển thị:</label>
                  <input
                    type="text"
                    value={dayPlan.dateDisplay}
                    onChange={(e) =>
                      handleDayChange(dayIndex, { ...dayPlan, dateDisplay: e.target.value })
                    }
                    placeholder="Ngày 28/9"
                    style={{
                      width: '95px',
                      padding: '3px 6px',
                      borderRadius: '6px',
                      border: '1px solid #cbd5e1',
                      fontSize: '0.82rem',
                      background: '#ffffff',
                    }}
                    title="Chuỗi ngày in trên thực đơn"
                  />
                </div>
              </div>

              {/* Điều khiển ngày */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <button
                  type="button"
                  onClick={() => handleMoveDay(dayIndex, 'up')}
                  disabled={dayIndex === 0}
                  title="Di chuyển ngày lên trên"
                  style={{
                    padding: '4px 6px',
                    borderRadius: '6px',
                    background: '#f8fafc',
                    border: '1px solid #e2e8f0',
                    color: dayIndex === 0 ? '#cbd5e1' : '#475569',
                    cursor: dayIndex === 0 ? 'not-allowed' : 'pointer',
                  }}
                >
                  <ChevronUp size={14} />
                </button>
                <button
                  type="button"
                  onClick={() => handleMoveDay(dayIndex, 'down')}
                  disabled={dayIndex === menuData.days.length - 1}
                  title="Di chuyển ngày xuống dưới"
                  style={{
                    padding: '4px 6px',
                    borderRadius: '6px',
                    background: '#f8fafc',
                    border: '1px solid #e2e8f0',
                    color: dayIndex === menuData.days.length - 1 ? '#cbd5e1' : '#475569',
                    cursor: dayIndex === menuData.days.length - 1 ? 'not-allowed' : 'pointer',
                  }}
                >
                  <ChevronDown size={14} />
                </button>
                <button
                  type="button"
                  onClick={() => handleDeleteDay(dayIndex)}
                  title="Xóa ngày này"
                  style={{
                    padding: '4px 6px',
                    borderRadius: '6px',
                    background: '#fef2f2',
                    border: '1px solid #fecaca',
                    color: '#dc2626',
                    cursor: 'pointer',
                  }}
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>

            {/* Bữa chính */}
            <MealDishesList
              label="Bữa chính"
              dishes={dayPlan.mainMeals || []}
              onChange={(newMeals) =>
                handleDayChange(dayIndex, { ...dayPlan, mainMeals: newMeals })
              }
              availableDishes={availableDishes}
              badgeColor="#1d4ed8"
              quickSuggestions={['Cơm trắng', 'Canh chua', 'Rau xào']}
            />

            {/* Bữa phụ */}
            <MealDishesList
              label="Bữa phụ"
              dishes={dayPlan.sideMeals || []}
              onChange={(newMeals) =>
                handleDayChange(dayIndex, { ...dayPlan, sideMeals: newMeals })
              }
              availableDishes={availableDishes}
              badgeColor="#059669"
              quickSuggestions={['Sữa', 'Sữa chua', 'Yakult', 'Chuối sứ', 'Bánh flan']}
            />
          </div>
        ))}

        <button
          type="button"
          onClick={handleAddDay}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            background: '#ffffff',
            border: '2px dashed #93c5fd',
            borderRadius: '12px',
            padding: '12px',
            color: '#2563eb',
            fontWeight: 600,
            fontSize: '0.9rem',
            cursor: 'pointer',
            transition: 'all 0.15s ease',
          }}
        >
          <Plus size={16} />
          <span>Thêm ngày tiếp theo vào tuần</span>
        </button>
      </div>
    </div>
  );
};
