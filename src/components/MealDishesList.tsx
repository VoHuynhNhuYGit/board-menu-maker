'use client';

import React, { useState } from 'react';
import { IDishItem } from '@/types';
import { DishInput } from './DishInput';
import { ArrowUp, ArrowDown, X, Edit2, Check } from 'lucide-react';

interface MealDishesListProps {
  label: string;
  dishes: string[];
  onChange: (newDishes: string[]) => void;
  availableDishes: IDishItem[];
  badgeColor?: string;
  quickSuggestions?: string[];
}

export const MealDishesList: React.FC<MealDishesListProps> = ({
  label,
  dishes,
  onChange,
  availableDishes,
  badgeColor = '#3b82f6',
  quickSuggestions = [],
}) => {
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editValue, setEditValue] = useState('');

  const handleAddDish = (dishName: string) => {
    onChange([...dishes, dishName]);
  };

  const handleRemoveDish = (index: number) => {
    const updated = dishes.filter((_, i) => i !== index);
    onChange(updated);
  };

  const handleMoveUp = (index: number) => {
    if (index === 0) return;
    const updated = [...dishes];
    const temp = updated[index - 1];
    updated[index - 1] = updated[index];
    updated[index] = temp;
    onChange(updated);
  };

  const handleMoveDown = (index: number) => {
    if (index === dishes.length - 1) return;
    const updated = [...dishes];
    const temp = updated[index + 1];
    updated[index + 1] = updated[index];
    updated[index] = temp;
    onChange(updated);
  };

  const startEdit = (index: number) => {
    setEditingIndex(index);
    setEditValue(dishes[index]);
  };

  const saveEdit = (index: number) => {
    const trimmed = editValue.trim();
    if (trimmed) {
      const updated = [...dishes];
      updated[index] = trimmed;
      onChange(updated);
    }
    setEditingIndex(null);
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '6px',
        background: '#ffffff',
        border: '1px solid #f1f5f9',
        borderRadius: '8px',
        padding: '10px',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <span
          style={{
            fontSize: '0.8rem',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
            color: badgeColor,
          }}
        >
          {label} ({dishes.length})
        </span>

        {/* Gợi ý món nhanh nếu danh sách đang rỗng */}
        {quickSuggestions.length > 0 && (
          <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
            {quickSuggestions.map((sug) => (
              <button
                key={sug}
                type="button"
                onClick={() => handleAddDish(sug)}
                style={{
                  fontSize: '0.7rem',
                  padding: '2px 6px',
                  borderRadius: '4px',
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  color: '#475569',
                  cursor: 'pointer',
                }}
                title={`Thêm nhanh ${sug}`}
              >
                + {sug}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Danh sách các món ăn đã thêm */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '4px',
        }}
      >
        {dishes.map((dish, idx) => (
          <div
            key={idx}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: '6px',
              padding: '4px 8px',
              fontSize: '0.85rem',
            }}
          >
            {editingIndex === idx ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', flex: 1 }}>
                <input
                  type="text"
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') saveEdit(idx);
                    if (e.key === 'Escape') setEditingIndex(null);
                  }}
                  autoFocus
                  style={{
                    padding: '2px 6px',
                    borderRadius: '4px',
                    border: '1px solid #2563eb',
                    fontSize: '0.85rem',
                    width: '100%',
                  }}
                />
                <button
                  type="button"
                  onClick={() => saveEdit(idx)}
                  style={{
                    background: '#16a34a',
                    color: '#fff',
                    borderRadius: '4px',
                    padding: '3px',
                    display: 'flex',
                  }}
                >
                  <Check size={12} />
                </button>
              </div>
            ) : (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  flex: 1,
                  overflow: 'hidden',
                }}
              >
                <span
                  style={{
                    color: '#94a3b8',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    minWidth: '16px',
                  }}
                >
                  {idx + 1}.
                </span>
                <span
                  style={{
                    color: '#1e293b',
                    fontWeight: 500,
                    textOverflow: 'ellipsis',
                    overflow: 'hidden',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {dish}
                </span>
              </div>
            )}

            {/* Các nút điều khiển thứ tự, sửa, xóa */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '2px', marginLeft: '6px' }}>
              <button
                type="button"
                onClick={() => handleMoveUp(idx)}
                disabled={idx === 0}
                title="Di chuyển lên"
                style={{
                  padding: '2px',
                  borderRadius: '4px',
                  background: 'transparent',
                  color: idx === 0 ? '#cbd5e1' : '#64748b',
                  cursor: idx === 0 ? 'not-allowed' : 'pointer',
                  display: 'flex',
                }}
              >
                <ArrowUp size={13} />
              </button>
              <button
                type="button"
                onClick={() => handleMoveDown(idx)}
                disabled={idx === dishes.length - 1}
                title="Di chuyển xuống"
                style={{
                  padding: '2px',
                  borderRadius: '4px',
                  background: 'transparent',
                  color: idx === dishes.length - 1 ? '#cbd5e1' : '#64748b',
                  cursor: idx === dishes.length - 1 ? 'not-allowed' : 'pointer',
                  display: 'flex',
                }}
              >
                <ArrowDown size={13} />
              </button>
              <button
                type="button"
                onClick={() => startEdit(idx)}
                title="Sửa tên món"
                style={{
                  padding: '2px',
                  borderRadius: '4px',
                  background: 'transparent',
                  color: '#64748b',
                  cursor: 'pointer',
                  display: 'flex',
                }}
              >
                <Edit2 size={12} />
              </button>
              <button
                type="button"
                onClick={() => handleRemoveDish(idx)}
                title="Xóa món"
                style={{
                  padding: '2px',
                  borderRadius: '4px',
                  background: 'transparent',
                  color: '#ef4444',
                  cursor: 'pointer',
                  display: 'flex',
                }}
              >
                <X size={13} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Input để thêm món tiếp theo */}
      <DishInput
        onAddDish={handleAddDish}
        availableDishes={availableDishes}
        placeholder={`+ Thêm món cho ${label.toLowerCase()}...`}
      />
    </div>
  );
};
