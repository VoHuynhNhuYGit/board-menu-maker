'use client';

import React, { useState } from 'react';
import { IDishItem } from '@/types';
import { matchVietnamese } from '@/lib/vietnamese';
import { X, Search, Plus, Trash2, Edit2, Check, Utensils, Tag } from 'lucide-react';

interface DishManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  dishes: IDishItem[];
  onRefreshDishes: () => Promise<void>;
  showToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

export const DishManagerModal: React.FC<DishManagerModalProps> = ({
  isOpen,
  onClose,
  dishes,
  onRefreshDishes,
  showToast,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [newName, setNewName] = useState('');
  const [newCategory, setNewCategory] = useState('Món mặn');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Trạng thái đang sửa một món
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editCategory, setEditCategory] = useState('');

  if (!isOpen) return null;

  // Lọc món theo từ khóa (hỗ trợ không dấu)
  const filteredDishes = dishes.filter((d) =>
    matchVietnamese(d.name, searchTerm)
  );

  // Thêm món mới vào MongoDB qua API
  const handleCreateDish = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newName.trim();
    if (!trimmed) {
      showToast('Vui lòng nhập tên món ăn', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/dishes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: trimmed, category: newCategory }),
      });
      const data = await res.json();
      if (data.success) {
        showToast(`Đã thêm món "${trimmed}"`, 'success');
        setNewName('');
        await onRefreshDishes();
      } else {
        showToast(data.error || 'Lỗi thêm món ăn', 'error');
      }
    } catch (err) {
      showToast('Không thể kết nối đến máy chủ', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Bắt đầu sửa món
  const startEdit = (dish: IDishItem) => {
    setEditingId(dish._id || null);
    setEditName(dish.name);
    setEditCategory(dish.category || 'Món mặn');
  };

  // Lưu sửa món vào MongoDB qua API
  const handleSaveEdit = async (id: string) => {
    const trimmed = editName.trim();
    if (!trimmed) {
      showToast('Tên món không được để trống', 'error');
      return;
    }

    try {
      const res = await fetch(`/api/dishes/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: trimmed, category: editCategory }),
      });
      const data = await res.json();
      if (data.success) {
        showToast('Đã cập nhật món ăn', 'success');
        setEditingId(null);
        await onRefreshDishes();
      } else {
        showToast(data.error || 'Lỗi cập nhật', 'error');
      }
    } catch (err) {
      showToast('Không thể kết nối máy chủ', 'error');
    }
  };

  // Xóa món khỏi MongoDB qua API
  const handleDeleteDish = async (id: string, name: string) => {
    if (!window.confirm(`Bạn có chắc chắn muốn xóa món "${name}" khỏi kho dữ liệu?`)) {
      return;
    }

    try {
      const res = await fetch(`/api/dishes/${id}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (data.success) {
        showToast(`Đã xóa món "${name}"`, 'success');
        await onRefreshDishes();
      } else {
        showToast(data.error || 'Lỗi xóa món', 'error');
      }
    } catch (err) {
      showToast('Không thể kết nối máy chủ', 'error');
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content"
        onClick={(e) => e.stopPropagation()}
        style={{ width: '700px' }}
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
            <Utensils size={20} color="#2563eb" />
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#0f172a' }}>
              Quản lý kho món ăn
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
              {dishes.length} món
            </span>
          </div>
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

        {/* Thêm món mới */}
        <div style={{ padding: '16px 20px', background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
          <form
            onSubmit={handleCreateDish}
            style={{ display: 'grid', gridTemplateColumns: '1fr auto auto', gap: '8px' }}
          >
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="Nhập tên món ăn mới cần lưu..."
              style={{
                padding: '8px 12px',
                borderRadius: '8px',
                border: '1px solid #cbd5e1',
                fontSize: '0.88rem',
                background: '#fff',
              }}
            />

            <select
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
              style={{
                padding: '8px 10px',
                borderRadius: '8px',
                border: '1px solid #cbd5e1',
                fontSize: '0.85rem',
                background: '#fff',
              }}
            >
              <option value="Món mặn">Món mặn</option>
              <option value="Món canh">Món canh</option>
              <option value="Rau xào">Rau xào</option>
              <option value="Cơm">Cơm</option>
              <option value="Bữa phụ">Bữa phụ</option>
              <option value="Tráng miệng">Tráng miệng</option>
              <option value="Chung">Khác</option>
            </select>

            <button
              type="submit"
              disabled={isSubmitting}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                background: '#2563eb',
                color: '#fff',
                padding: '8px 16px',
                borderRadius: '8px',
                fontSize: '0.85rem',
                fontWeight: 600,
              }}
            >
              <Plus size={16} />
              <span>Thêm món</span>
            </button>
          </form>
        </div>

        {/* Thanh tìm kiếm món */}
        <div style={{ padding: '12px 20px', borderBottom: '1px solid #f1f5f9' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: '8px',
              padding: '6px 12px',
            }}
          >
            <Search size={15} color="#94a3b8" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Tìm kiếm món ăn (gõ không dấu hoặc có dấu: ga kho sa -> Gà kho sả)..."
              style={{
                border: 'none',
                outline: 'none',
                background: 'transparent',
                width: '100%',
                fontSize: '0.85rem',
              }}
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm('')}
                style={{ background: 'transparent', color: '#94a3b8' }}
              >
                <X size={14} />
              </button>
            )}
          </div>
        </div>

        {/* Danh sách món ăn */}
        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '12px 20px',
            display: 'flex',
            flexDirection: 'column',
            gap: '6px',
            maxHeight: '400px',
          }}
        >
          {filteredDishes.length > 0 ? (
            filteredDishes.map((dish) => {
              const isEditing = editingId === dish._id;

              return (
                <div
                  key={dish._id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    background: '#f8fafc',
                    border: '1px solid #e2e8f0',
                  }}
                >
                  {isEditing ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1 }}>
                      <input
                        type="text"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        style={{
                          padding: '4px 8px',
                          borderRadius: '6px',
                          border: '1px solid #2563eb',
                          fontSize: '0.85rem',
                          flex: 1,
                        }}
                        autoFocus
                      />
                      <select
                        value={editCategory}
                        onChange={(e) => setEditCategory(e.target.value)}
                        style={{
                          padding: '4px 8px',
                          borderRadius: '6px',
                          border: '1px solid #cbd5e1',
                          fontSize: '0.8rem',
                        }}
                      >
                        <option value="Món mặn">Món mặn</option>
                        <option value="Món canh">Món canh</option>
                        <option value="Rau xào">Rau xào</option>
                        <option value="Cơm">Cơm</option>
                        <option value="Bữa phụ">Bữa phụ</option>
                        <option value="Tráng miệng">Tráng miệng</option>
                        <option value="Chung">Khác</option>
                      </select>
                      <button
                        type="button"
                        onClick={() => handleSaveEdit(dish._id!)}
                        style={{
                          background: '#16a34a',
                          color: '#fff',
                          borderRadius: '6px',
                          padding: '4px 8px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                          fontSize: '0.75rem',
                          fontWeight: 600,
                        }}
                      >
                        <Check size={13} />
                        Lưu
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditingId(null)}
                        style={{
                          background: '#e2e8f0',
                          color: '#475569',
                          borderRadius: '6px',
                          padding: '4px 8px',
                          fontSize: '0.75rem',
                        }}
                      >
                        Hủy
                      </button>
                    </div>
                  ) : (
                    <>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span style={{ fontSize: '0.9rem', fontWeight: 600, color: '#1e293b' }}>
                          {dish.name}
                        </span>
                        {dish.category && (
                          <span
                            style={{
                              fontSize: '0.72rem',
                              background: '#e0f2fe',
                              color: '#0369a1',
                              padding: '2px 8px',
                              borderRadius: '4px',
                              fontWeight: 500,
                            }}
                          >
                            {dish.category}
                          </span>
                        )}
                        <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>
                          (dùng {dish.usageCount || 1} lần)
                        </span>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <button
                          type="button"
                          onClick={() => startEdit(dish)}
                          title="Sửa món"
                          style={{
                            padding: '5px',
                            borderRadius: '6px',
                            background: '#ffffff',
                            border: '1px solid #cbd5e1',
                            color: '#475569',
                          }}
                        >
                          <Edit2 size={13} />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteDish(dish._id!, dish.name)}
                          title="Xóa món khỏi cơ sở dữ liệu"
                          style={{
                            padding: '5px',
                            borderRadius: '6px',
                            background: '#ffffff',
                            border: '1px solid #fecaca',
                            color: '#dc2626',
                          }}
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </>
                  )}
                </div>
              );
            })
          ) : (
            <div style={{ padding: '30px', textAlign: 'center', color: '#94a3b8', fontSize: '0.9rem' }}>
              Không có món ăn nào phù hợp với từ khóa &ldquo;{searchTerm}&rdquo;
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
    </div>
  );
};
