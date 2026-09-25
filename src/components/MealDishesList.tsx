'use client';

import React, { useState, useRef, useEffect } from 'react';
import { IDishItem } from '@/types';
import { matchVietnamese } from '@/lib/vietnamese';
import { Search, Plus, X, Soup } from 'lucide-react';

interface MealDishesListProps {
  label: string;
  dishes: string[];
  onChange: (newDishes: string[]) => void;
  availableDishes: IDishItem[];
  placeholder?: string;
}

export const MealDishesList: React.FC<MealDishesListProps> = ({
  label,
  dishes,
  onChange,
  availableDishes,
  placeholder = 'Thêm món ăn...',
}) => {
  const [inputValue, setInputValue] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Lọc món theo từ khóa tìm kiếm
  const filteredDishes = availableDishes
    .filter((dish) => {
      if (!inputValue.trim()) return true;
      return matchVietnamese(dish.name, inputValue);
    })
    .slice(0, 10);

  // Đóng dropdown khi click ra ngoài
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleAddDish = (dishName: string) => {
    const trimmed = dishName.trim();
    if (!trimmed) return;
    onChange([...dishes, trimmed]);
    setInputValue('');
    setIsOpen(false);
    setHighlightedIndex(-1);
  };

  const handleRemoveDish = (indexToRemove: number) => {
    onChange(dishes.filter((_, idx) => idx !== indexToRemove));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (!isOpen) {
        setIsOpen(true);
        setHighlightedIndex(0);
      } else {
        setHighlightedIndex((prev) =>
          prev < filteredDishes.length - 1 ? prev + 1 : prev
        );
      }
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (isOpen && highlightedIndex >= 0 && highlightedIndex < filteredDishes.length) {
        handleAddDish(filteredDishes[highlightedIndex].name);
      } else if (inputValue.trim()) {
        handleAddDish(inputValue);
      }
    } else if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      {/* Label: Bữa chính / Bữa phụ */}
      <div
        style={{
          fontSize: '0.85rem',
          fontWeight: 700,
          color: '#1e293b',
        }}
      >
        {label}
      </div>

      {/* Danh sách Tags (Chips) món ăn đã chọn */}
      {dishes.length > 0 && (
        <div
          className="meal-search-box"
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '6px',
            alignItems: 'center',
          }}
        >
          {dishes.map((dish, idx) => (
            <div
              key={`${dish}-${idx}`}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                background: '#ffffff',
                border: '1px solid #cbd5e1',
                borderRadius: '6px',
                padding: '4px 8px',
                fontSize: '0.82rem',
                color: '#1e293b',
                boxShadow: '0 1px 2px rgba(0,0,0,0.03)',
                maxWidth: '100%',
              }}
            >
              <span
                style={{
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
              >
                {dish}
              </span>
              <button
                type="button"
                onClick={() => handleRemoveDish(idx)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#64748b',
                  padding: '1px',
                  borderRadius: '3px',
                }}
                title={`Xóa món ${dish}`}
                onMouseEnter={(e) => (e.currentTarget.style.color = '#ef4444')}
                onMouseLeave={(e) => (e.currentTarget.style.color = '#64748b')}
              >
                <X size={13} strokeWidth={2.2} />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Ô tìm kiếm / thêm món ăn */}
      <div ref={containerRef} style={{ position: 'relative', width: '100%' }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            background: '#ffffff',
            border: '1px solid #cbd5e1',
            borderRadius: '6px',
            padding: '7px 10px',
            transition: 'border-color 0.15s',
          }}
        >
          <Search size={14} color="#94a3b8" />
          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={(e) => {
              setInputValue(e.target.value);
              setIsOpen(true);
              setHighlightedIndex(0);
            }}
            onFocus={() => setIsOpen(true)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            style={{
              border: 'none',
              outline: 'none',
              background: 'transparent',
              width: '100%',
              fontSize: '0.82rem',
              color: '#1e293b',
            }}
          />
        </div>

        {/* Dropdown gợi ý món ăn */}
        {isOpen && (
          <div
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
              maxHeight: '220px',
              overflowY: 'auto',
              padding: '4px',
            }}
          >
            {filteredDishes.length > 0 ? (
              filteredDishes.map((dish, idx) => {
                const isHighlighted = idx === highlightedIndex;
                return (
                  <div
                    key={dish._id || dish.name + idx}
                    onMouseEnter={() => setHighlightedIndex(idx)}
                    onClick={() => handleAddDish(dish.name)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '7px 10px',
                      borderRadius: '5px',
                      background: isHighlighted ? '#f1f5f9' : 'transparent',
                      cursor: 'pointer',
                      fontSize: '0.82rem',
                      color: '#1e293b',
                    }}
                  >
                    <Soup size={14} color="#64748b" />
                    <span>{dish.name}</span>
                  </div>
                );
              })
            ) : (
              <div
                style={{
                  padding: '8px 10px',
                  fontSize: '0.78rem',
                  color: '#94a3b8',
                }}
              >
                Không có món nào trong kho.
              </div>
            )}

            {/* Mục thêm món mới */}
            <div
              onClick={() => handleAddDish(inputValue.trim() || 'Món mới')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '7px 10px',
                borderRadius: '5px',
                cursor: 'pointer',
                fontSize: '0.82rem',
                fontWeight: 600,
                color: '#0284c7',
                borderTop: '1px solid #f1f5f9',
                marginTop: '2px',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = '#f0f9ff')}
              onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
            >
              <div
                style={{
                  width: '18px',
                  height: '18px',
                  borderRadius: '50%',
                  background: '#0284c7',
                  color: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Plus size={12} strokeWidth={2.5} />
              </div>
              <span>
                {inputValue.trim()
                  ? `Thêm món mới: "${inputValue.trim()}"`
                  : 'Thêm món mới'}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
