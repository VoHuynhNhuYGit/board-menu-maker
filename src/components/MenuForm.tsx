'use client';

import React, { useState, useEffect, useRef } from 'react';
import { IMenuData, IDayPlan, IDishItem, ISchoolItem } from '@/types';
import { matchVietnamese } from '@/lib/vietnamese';
import { MealDishesList } from './MealDishesList';
import {
  Calendar,
  Building,
  ChevronDown,
  ChevronUp,
  Plus,
  Trash2,
  X,
  Check,
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

  // Mặc định mở tất cả các ngày trong tuần
  const [expandedDays, setExpandedDays] = useState<{ [key: number]: boolean }>({
    0: true,
    1: true,
    2: true,
    3: true,
    4: true,
  });

  const toggleDayExpanded = (index: number) => {
    setExpandedDays((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

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

  // Đóng dropdown trường khi click ra ngoài
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

  const handleFieldChange = (field: keyof IMenuData, value: any) => {
    setMenuData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleDayChange = (index: number, updatedDay: IDayPlan) => {
    const newDays = [...menuData.days];
    newDays[index] = updatedDay;
    setMenuData((prev) => ({ ...prev, days: newDays }));
  };

  // Thêm một ngày mới vào tuần
  const handleAddDay = () => {
    const currentLength = menuData.days.length;
    let nextDow = '2';
    if (currentLength === 1) nextDow = '3';
    else if (currentLength === 2) nextDow = '4';
    else if (currentLength === 3) nextDow = '5';
    else if (currentLength === 4) nextDow = '6';
    else if (currentLength === 5) nextDow = '7';
    else if (currentLength >= 6) nextDow = 'CN';

    const newDay: IDayPlan = {
      dayOfWeek: nextDow,
      dateDisplay: `Ngày ${currentLength + 1}`,
      dateValue: '',
      mainMeals: ['Cơm trắng'],
      sideMeals: ['Sữa'],
    };

    setMenuData((prev) => ({
      ...prev,
      days: [...prev.days, newDay],
    }));

    setExpandedDays((prev) => ({
      ...prev,
      [currentLength]: true,
    }));
  };

  const handleRemoveDay = (index: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (menuData.days.length <= 1) {
      alert('Thực đơn cần ít nhất 1 ngày.');
      return;
    }
    if (confirm(`Bạn có chắc chắn muốn xóa Thứ ${menuData.days[index].dayOfWeek}?`)) {
      const newDays = menuData.days.filter((_, i) => i !== index);
      setMenuData((prev) => ({ ...prev, days: newDays }));
    }
  };

  // Định dạng ngày hiển thị dd/mm/yyyy
  const formatDateDisplay = (dateStr: string) => {
    if (!dateStr) return '';
    try {
      const parts = dateStr.split('-');
      if (parts.length === 3) {
        return `${parseInt(parts[2], 10)}/${parseInt(parts[1], 10)}/${parts[0]}`;
      }
      const slashParts = dateStr.split(/[/-]/);
      if (slashParts.length === 3) {
        return `${parseInt(slashParts[0], 10)}/${parseInt(slashParts[1], 10)}/${slashParts[2]}`;
      }
    } catch (e) {
      // fallback
    }
    return dateStr;
  };

  const normalizeTypedDate = (value: string) => {
    const parts = value.trim().split(/[/-]/);
    if (parts.length !== 3 || parts[2].length !== 4) return value;
    const [day, month, year] = parts;
    return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* 1. THÔNG TIN CHUNG */}
      <div
        style={{
          background: '#ffffff',
          borderRadius: '10px',
          padding: '14px 18px 16px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
          border: '1px solid #e2e8f0',
        }}
      >
        <h2
          style={{
            fontSize: '1rem',
            fontWeight: 700,
            color: '#0f172a',
            marginBottom: '14px',
            paddingBottom: '10px',
            borderBottom: '1px solid #e2e8f0',
          }}
        >
          Thông tin chung
        </h2>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'minmax(240px, 2.05fr) minmax(70px, 0.58fr) minmax(130px, 1fr) minmax(130px, 1fr)',
            gap: '14px',
            alignItems: 'start',
          }}
        >
          {/* Tên trường (Chỉ lấy trong MongoDB) */}
          <div style={{ position: 'relative' }}>
            <label
              style={{
                display: 'block',
                fontSize: '0.82rem',
                fontWeight: 600,
                color: '#334155',
                marginBottom: '6px',
              }}
            >
              Tên trường
            </label>

            <div
              onClick={() => {
                if (!showSchoolDropdown) fetchSchools();
                setShowSchoolDropdown((prev) => !prev);
              }}
              style={{
                width: '100%',
                padding: '8px 12px',
                borderRadius: '6px',
                border: '1px solid #cbd5e1',
                fontSize: '0.86rem',
                color: menuData.schoolName ? '#0f172a' : '#94a3b8',
                background: '#ffffff',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                userSelect: 'none',
                minHeight: '38px',
              }}
            >
              <span
                style={{
                  fontWeight: menuData.schoolName ? 600 : 400,
                  textOverflow: 'ellipsis',
                  overflow: 'hidden',
                  whiteSpace: 'nowrap',
                }}
              >
                {menuData.schoolName || '-- Chọn trường --'}
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
                <ChevronDown size={15} color="#64748b" />
              </div>
            </div>

            {/* Dropdown danh sách trường MongoDB */}
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
                  borderRadius: '8px',
                  boxShadow: '0 10px 20px -3px rgba(0,0,0,0.12)',
                  zIndex: 100,
                  maxHeight: '260px',
                  overflowY: 'auto',
                  padding: '6px',
                }}
              >
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
                    placeholder="Gõ tìm trường..."
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
                      style={{ background: 'transparent', color: '#94a3b8', border: 'none' }}
                    >
                      <X size={13} />
                    </button>
                  )}
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
                      <span style={{ fontWeight: 600, color: '#1e293b' }}>{s.name}</span>
                      {menuData.schoolName === s.name && <Check size={14} color="#2563eb" />}
                    </div>
                  ))
                ) : (
                  <div style={{ padding: '10px 8px', textAlign: 'center', color: '#94a3b8', fontSize: '0.8rem' }}>
                    Không có trường nào khớp.
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
                          + Thêm trường mới vào DB
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Tuần */}
          <div>
            <label
              style={{
                display: 'block',
                fontSize: '0.82rem',
                fontWeight: 600,
                color: '#334155',
                marginBottom: '6px',
              }}
            >
              Tuần
            </label>
            <input
              type="number"
              value={menuData.weekNumber}
              onChange={(e) => handleFieldChange('weekNumber', parseInt(e.target.value, 10) || 1)}
              min={1}
              max={54}
              style={{
                width: '100%',
                padding: '8px 12px',
                borderRadius: '6px',
                border: '1px solid #cbd5e1',
                fontSize: '0.86rem',
                color: '#0f172a',
                background: '#ffffff',
                minHeight: '38px',
              }}
            />
          </div>

          {/* Từ ngày */}
          <div>
            <label
              style={{
                display: 'block',
                fontSize: '0.82rem',
                fontWeight: 600,
                color: '#334155',
                marginBottom: '6px',
              }}
            >
              Từ ngày
            </label>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                border: '1px solid #cbd5e1',
                borderRadius: '6px',
                padding: '7px 10px',
                background: '#ffffff',
                minHeight: '38px',
              }}
            >
              <Calendar size={15} color="#64748b" />
              <input
                type="text"
                value={formatDateDisplay(menuData.startDate)}
                placeholder="dd/mm/yyyy"
                onChange={(e) => handleFieldChange('startDate', normalizeTypedDate(e.target.value))}
                style={{
                  border: 'none',
                  outline: 'none',
                  background: 'transparent',
                  width: '100%',
                  fontSize: '0.84rem',
                  color: '#0f172a',
                }}
              />
            </div>
          </div>

          {/* Đến ngày */}
          <div>
            <label
              style={{
                display: 'block',
                fontSize: '0.82rem',
                fontWeight: 600,
                color: '#334155',
                marginBottom: '6px',
              }}
            >
              Đến ngày
            </label>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                border: '1px solid #cbd5e1',
                borderRadius: '6px',
                padding: '7px 10px',
                background: '#ffffff',
                minHeight: '38px',
              }}
            >
              <Calendar size={15} color="#64748b" />
              <input
                type="text"
                value={formatDateDisplay(menuData.endDate)}
                placeholder="dd/mm/yyyy"
                onChange={(e) => handleFieldChange('endDate', normalizeTypedDate(e.target.value))}
                style={{
                  border: 'none',
                  outline: 'none',
                  background: 'transparent',
                  width: '100%',
                  fontSize: '0.84rem',
                  color: '#0f172a',
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* 2. NHẬP THỰC ĐƠN */}
      <div>
        <h2
          style={{
            fontSize: '1.05rem',
            fontWeight: 700,
            color: '#0f172a',
            marginBottom: '14px',
          }}
        >
          Nhập thực đơn
        </h2>

        {/* Danh sách các ngày trong tuần */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {menuData.days.map((day, idx) => {
            const isExpanded = expandedDays[idx] !== false;
            // Tiêu đề ngày: Thứ X · 28/9
            const cleanDateStr = day.dateDisplay ? day.dateDisplay.replace(/^Ngày\s*/i, '') : '';
            const dayTitle = `Thứ ${day.dayOfWeek}${cleanDateStr ? ` · ${cleanDateStr}` : ''}`;

            return (
              <div
                key={idx}
                style={{
                  background: '#ffffff',
                  borderRadius: '10px',
                  border: isExpanded ? '1.5px solid #f59e0b' : '1px solid #e2e8f0',
                  position: 'relative',
                  zIndex: isExpanded ? menuData.days.length - idx : 0,
                  boxShadow: isExpanded
                    ? '0 2px 8px rgba(245, 158, 11, 0.08)'
                    : '0 1px 2px rgba(0,0,0,0.03)',
                  overflow: isExpanded ? 'visible' : 'hidden',
                  transition: 'border-color 0.2s',
                }}
              >
                {/* Header thanh ngày (Click để toggle thu gọn / mở rộng) */}
                <div
                  onClick={() => toggleDayExpanded(idx)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '11px 16px',
                    cursor: 'pointer',
                    userSelect: 'none',
                    background: '#ffffff',
                  }}
                >
                  <span
                    style={{
                      fontSize: '0.95rem',
                      fontWeight: 700,
                      color: '#0f172a',
                    }}
                  >
                    {dayTitle}
                  </span>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    {menuData.days.length > 1 && (
                      <button
                        type="button"
                        onClick={(e) => handleRemoveDay(idx, e)}
                        title="Xóa ngày này"
                        style={{
                          background: 'transparent',
                          border: 'none',
                          color: '#94a3b8',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          padding: '2px',
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.color = '#ef4444')}
                        onMouseLeave={(e) => (e.currentTarget.style.color = '#94a3b8')}
                      >
                        <Trash2 size={14} />
                      </button>
                    )}
                    {isExpanded ? (
                      <ChevronUp size={18} color="#0284c7" />
                    ) : (
                      <ChevronDown size={18} color="#64748b" />
                    )}
                  </div>
                </div>

                {/* Nội dung ngày gồm 2 cột: Bữa chính & Bữa phụ */}
                {isExpanded && (
                  <div
                    style={{
                      padding: '4px 16px 16px 16px',
                      display: 'grid',
                      gridTemplateColumns: 'minmax(0, 1.75fr) minmax(220px, 1.15fr)',
                      gap: '0',
                      borderTop: '1px solid #f8fafc',
                    }}
                  >
                    {/* Bữa chính */}
                    <div style={{ paddingRight: '16px' }}>
                      <MealDishesList
                        label="Bữa chính"
                        dishes={day.mainMeals}
                        onChange={(newDishes) =>
                          handleDayChange(idx, { ...day, mainMeals: newDishes })
                        }
                        availableDishes={availableDishes}
                        placeholder="Thêm món ăn..."
                      />
                    </div>

                    {/* Bữa phụ */}
                    <div style={{ borderLeft: '1px solid #e8eef5', paddingLeft: '16px' }}>
                      <MealDishesList
                        label="Bữa phụ"
                        dishes={day.sideMeals}
                        onChange={(newDishes) =>
                          handleDayChange(idx, { ...day, sideMeals: newDishes })
                        }
                        availableDishes={availableDishes}
                        placeholder="Thêm món ăn..."
                      />
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Nút Thêm ngày */}
        <button
          type="button"
          onClick={handleAddDay}
          style={{
            marginTop: '14px',
            width: '100%',
            padding: '10px',
            background: '#ffffff',
            border: '1px dashed #cbd5e1',
            borderRadius: '8px',
            color: '#475569',
            fontSize: '0.85rem',
            fontWeight: 600,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
            transition: 'all 0.15s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = '#0284c7';
            e.currentTarget.style.color = '#0284c7';
            e.currentTarget.style.background = '#f0f9ff';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = '#cbd5e1';
            e.currentTarget.style.color = '#475569';
            e.currentTarget.style.background = '#ffffff';
          }}
        >
          <Plus size={16} />
          <span>Thêm ngày</span>
        </button>
      </div>
    </div>
  );
};
