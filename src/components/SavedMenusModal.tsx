'use client';

import React, { useState, useEffect } from 'react';
import { IMenuData } from '@/types';
import { X, Calendar, Building, Hash, Copy, Edit3, Trash2, FolderOpen, RefreshCw } from 'lucide-react';

interface SavedMenusModalProps {
  isOpen: boolean;
  embedded?: boolean;
  onClose: () => void;
  onLoadMenu: (menu: IMenuData, isClone?: boolean) => void;
  showToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

export const SavedMenusModal: React.FC<SavedMenusModalProps> = ({
  isOpen,
  embedded = false,
  onClose,
  onLoadMenu,
  showToast,
}) => {
  const [menus, setMenus] = useState<IMenuData[]>([]);
  const [loading, setLoading] = useState(false);
  const [filterSchool, setFilterSchool] = useState('');

  const fetchMenus = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/menus');
      const data = await res.json();
      if (data.success) {
        setMenus(data.data || []);
      } else {
        showToast(data.error || 'Lỗi tải danh sách thực đơn', 'error');
      }
    } catch (err) {
      showToast('Không thể kết nối đến máy chủ', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchMenus();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const filteredMenus = menus.filter((m) =>
    filterSchool.trim()
      ? (m.schoolName || '').toLowerCase().includes(filterSchool.toLowerCase())
      : true
  );

  const formatDate = (value?: string) => {
    if (!value) return '—';
    const iso = value.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (iso) return `${Number(iso[3])}/${Number(iso[2])}/${iso[1]}`;
    return value;
  };

  const handleDeleteMenu = async (id: string, schoolName: string, week: any) => {
    if (!window.confirm(`Bạn có chắc chắn muốn xóa thực đơn ${schoolName} - Tuần ${week}?`)) {
      return;
    }

    try {
      const res = await fetch(`/api/menus/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        showToast('Đã xóa thực đơn', 'success');
        fetchMenus();
      } else {
        showToast(data.error || 'Lỗi xóa thực đơn', 'error');
      }
    } catch (err) {
      showToast('Không thể kết nối máy chủ', 'error');
    }
  };

  const content = (
    <div
      className="modal-content"
      onClick={(e) => e.stopPropagation()}
      style={{
        width: '100%',
        maxWidth: embedded ? 'none' : '740px',
        maxHeight: embedded ? 'none' : '90vh',
        borderRadius: embedded ? '10px' : undefined,
      }}
    >
        {/* Header Modal */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '16px 20px',
            borderBottom: '1px solid #e2e8f0',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FolderOpen size={20} color="#2563eb" />
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#0f172a' }}>
              Danh sách thực đơn đã lưu
            </h3>
            <span
              style={{
                fontSize: '0.75rem',
                fontWeight: 600,
                background: '#eff6ff',
                color: '#2563eb',
                padding: '2px 8px',
                borderRadius: '12px',
              }}
            >
              {menus.length} thực đơn
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              onClick={fetchMenus}
              title="Tải lại danh sách"
              style={{
                padding: '6px',
                borderRadius: '6px',
                background: '#f1f5f9',
                color: '#475569',
              }}
            >
              <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
            </button>
            <button
              onClick={onClose}
              style={{
                padding: '6px',
                borderRadius: '6px',
                background: '#f1f5f9',
                color: '#64748b',
              }}
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Lọc theo tên trường */}
        <div style={{ padding: '12px 20px', borderBottom: '1px solid #f1f5f9', background: '#f8fafc' }}>
          <input
            type="text"
            value={filterSchool}
            onChange={(e) => setFilterSchool(e.target.value)}
            placeholder="Lọc theo tên trường..."
            style={{
              width: '100%',
              padding: '8px 12px',
              borderRadius: '8px',
              border: '1px solid #cbd5e1',
              fontSize: '0.85rem',
              background: '#fff',
            }}
          />
        </div>

        {/* Danh sách các thực đơn */}
        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '16px 20px',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
            maxHeight: embedded ? 'calc(100vh - 260px)' : '440px',
          }}
        >
          {loading ? (
            <div style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>
              Đang tải danh sách...
            </div>
          ) : filteredMenus.length > 0 ? (
            filteredMenus.map((m) => (
              <div
                key={m._id}
                style={{
                  background: '#ffffff',
                  border: '1px solid #e2e8f0',
                  borderRadius: '12px',
                  padding: '14px 16px',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.02)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '12px',
                  transition: 'border-color 0.15s, box-shadow 0.15s',
                }}
              >
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a' }}>
                      {m.schoolName}
                    </span>
                    <span
                      style={{
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        background: '#eff6ff',
                        color: '#1d4ed8',
                        padding: '2px 8px',
                        borderRadius: '6px',
                      }}
                    >
                      Tuần {m.weekNumber}
                    </span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: '#64748b', fontSize: '0.82rem' }}>
                    <span>
                      Từ <strong>{formatDate(m.startDate)}</strong> đến <strong>{formatDate(m.endDate)}</strong>
                    </span>
                    <span>•</span>
                    <span>{m.days?.length || 0} ngày</span>
                  </div>

                  {/* Tóm tắt nhanh món */}
                  <div
                    style={{
                      fontSize: '0.78rem',
                      color: '#94a3b8',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      maxWidth: '440px',
                    }}
                  >
                    Món tiêu biểu:{' '}
                    {m.days
                      ?.flatMap((d) => d.mainMeals)
                      .slice(0, 4)
                      .join(', ')}
                    ...
                  </div>
                </div>

                {/* Các nút hành động */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  {/* Mở chỉnh sửa */}
                  <button
                    type="button"
                    onClick={() => {
                      onLoadMenu(m, false);
                      onClose();
                      showToast(`Đã tải thực đơn Tuần ${m.weekNumber}`, 'success');
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      background: '#2563eb',
                      color: '#ffffff',
                      padding: '6px 12px',
                      borderRadius: '8px',
                      fontSize: '0.8rem',
                      fontWeight: 600,
                    }}
                    title="Mở thực đơn này để chỉnh sửa và cập nhật"
                  >
                    <Edit3 size={13} />
                    <span>Mở sửa</span>
                  </button>

                  {/* Nhân bản / Tạo mới từ bản này */}
                  <button
                    type="button"
                    onClick={() => {
                      onLoadMenu(m, true);
                      onClose();
                      showToast(`Đã tạo bản sao từ Tuần ${m.weekNumber}`, 'info');
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      background: '#f8fafc',
                      color: '#334155',
                      border: '1px solid #cbd5e1',
                      padding: '6px 10px',
                      borderRadius: '8px',
                      fontSize: '0.8rem',
                      fontWeight: 600,
                    }}
                    title="Nhân bản thực đơn này thành bản nháp mới để tạo tuần tiếp theo"
                  >
                    <Copy size={13} />
                    <span>Nhân bản</span>
                  </button>

                  {/* Xóa */}
                  <button
                    type="button"
                    onClick={() => handleDeleteMenu(m._id!, m.schoolName, m.weekNumber)}
                    style={{
                      padding: '6px 8px',
                      borderRadius: '8px',
                      background: '#fef2f2',
                      border: '1px solid #fecaca',
                      color: '#dc2626',
                    }}
                    title="Xóa thực đơn"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div style={{ padding: '40px', textAlign: 'center', color: '#94a3b8', fontSize: '0.9rem' }}>
              Chưa có thực đơn nào được lưu.
            </div>
          )}
        </div>

        {/* Footer Modal */}
        <div
          style={{
            padding: '12px 20px',
            borderTop: '1px solid #e2e8f0',
            display: 'flex',
            justifyContent: 'flex-end',
            background: '#fafbfc',
          }}
        >
          <button
            type="button"
            onClick={onClose}
            style={{
              padding: '8px 16px',
              borderRadius: '8px',
              background: '#e2e8f0',
              color: '#334155',
              fontSize: '0.85rem',
              fontWeight: 600,
            }}
          >
            Đóng
          </button>
        </div>
      </div>
  );

  return embedded ? (
    <div style={{ width: '100%', maxWidth: '1200px', margin: '0 auto', animation: 'fadeIn 0.2s ease-out' }}>
      {content}
    </div>
  ) : (
    <div className="modal-overlay" onClick={onClose}>
      {content}
    </div>
  );
};
