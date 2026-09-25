'use client';

import React, { useState, useRef, useEffect } from 'react';
import { matchVietnamese } from '@/lib/vietnamese';
import { IDishItem } from '@/types';
import { Plus, Search, Check } from 'lucide-react';

interface DishInputProps {
  onAddDish: (dishName: string) => void;
  availableDishes: IDishItem[];
  placeholder?: string;
}

export const DishInput: React.FC<DishInputProps> = ({
  onAddDish,
  availableDishes,
  placeholder = 'Nhập hoặc chọn món ăn...',
}) => {
  const [inputValue, setInputValue] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Lọc món theo từ khóa tìm kiếm (hỗ trợ không dấu tiếng Việt)
  const filteredDishes = availableDishes
    .filter((dish) => {
      if (!inputValue.trim()) return true;
      return matchVietnamese(dish.name, inputValue);
    })
    .slice(0, 15); // Lấy tối đa 15 kết quả gợi ý nhanh

  // Kiểm tra xem món đang gõ có trùng khớp hoàn toàn với món nào chưa
  const exactMatch = availableDishes.find(
    (d) => d.name.trim().toLowerCase() === inputValue.trim().toLowerCase()
  );

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

  const handleSelectDish = (name: string) => {
    const trimmed = name.trim();
    if (!trimmed) return;
    onAddDish(trimmed);
    setInputValue('');
    setIsOpen(false);
    setHighlightedIndex(-1);
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
        handleSelectDish(filteredDishes[highlightedIndex].name);
      } else if (inputValue.trim()) {
        handleSelectDish(inputValue);
      }
    } else if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  return (
    <div
      ref={containerRef}
      style={{
        position: 'relative',
        width: '100%',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          background: '#f8fafc',
          border: '1px solid #cbd5e1',
          borderRadius: '8px',
          padding: '4px 8px',
          transition: 'border-color 0.15s, box-shadow 0.15s',
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
            fontSize: '0.85rem',
            color: '#1e293b',
          }}
        />
        {inputValue.trim() && (
          <button
            type="button"
            onClick={() => handleSelectDish(inputValue)}
            title="Thêm món này"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: '#2563eb',
              color: '#ffffff',
              borderRadius: '6px',
              padding: '4px 8px',
              fontSize: '0.75rem',
              fontWeight: 600,
              gap: '4px',
              flexShrink: 0,
            }}
          >
            <Plus size={12} />
            <span>Thêm</span>
          </button>
        )}
      </div>

      {isOpen && (
        <div
          style={{
            position: 'absolute',
            top: 'calc(100% + 4px)',
            left: 0,
            right: 0,
            background: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: '8px',
            boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -4px rgba(0,0,0,0.1)',
            zIndex: 100,
            maxHeight: '220px',
            overflowY: 'auto',
            padding: '4px',
          }}
        >
          {inputValue.trim() && !exactMatch && (
            <div
              onClick={() => handleSelectDish(inputValue)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 10px',
                borderRadius: '6px',
                background: '#eff6ff',
                color: '#1d4ed8',
                fontSize: '0.85rem',
                fontWeight: 600,
                cursor: 'pointer',
                marginBottom: '4px',
              }}
            >
              <Plus size={14} />
              <span>Thêm món mới: &ldquo;{inputValue.trim()}&rdquo;</span>
            </div>
          )}

          {filteredDishes.length > 0 ? (
            filteredDishes.map((dish, idx) => {
              const isHighlighted = idx === highlightedIndex;
              return (
                <div
                  key={dish._id || dish.name + idx}
                  onMouseEnter={() => setHighlightedIndex(idx)}
                  onClick={() => handleSelectDish(dish.name)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '7px 10px',
                    borderRadius: '6px',
                    background: isHighlighted ? '#f1f5f9' : 'transparent',
                    cursor: 'pointer',
                    fontSize: '0.85rem',
                    color: '#334155',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontWeight: isHighlighted ? 600 : 400 }}>
                      {dish.name}
                    </span>
                    {dish.category && (
                      <span
                        style={{
                          fontSize: '0.7rem',
                          background: '#f1f5f9',
                          color: '#64748b',
                          padding: '2px 6px',
                          borderRadius: '4px',
                        }}
                      >
                        {dish.category}
                      </span>
                    )}
                  </div>
                  {isHighlighted && <Check size={14} color="#2563eb" />}
                </div>
              );
            })
          ) : (
            <div
              style={{
                padding: '10px',
                textAlign: 'center',
                color: '#94a3b8',
                fontSize: '0.8rem',
              }}
            >
              Không tìm thấy món ăn phù hợp. Bấm Enter để thêm mới.
            </div>
          )}
        </div>
      )}
    </div>
  );
};
