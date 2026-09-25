'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { IDishItem } from '@/types';
import { matchVietnamese, removeVietnameseTones } from '@/lib/vietnamese';
import {
  UtensilsCrossed,
  Plus,
  Search,
  Trash2,
  Edit2,
  Check,
  X,
  ArrowLeft,
  Sparkles,
  Tag,
  Filter,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';

// Từ điển gợi ý món ăn trường học phổ biến để hỗ trợ Autocomplete khi gõ tay
const COMMON_SCHOOL_DISH_SUGGESTIONS = [
  'Gà kho sả', 'Gà Rôty', 'Ức gà chiên giòn', 'Gà sốt chua ngọt', 'Gà hấp lá chanh', 'Gà kho gừng',
  'Thịt nạc kho đậu hũ', 'Nạc dăm kho trứng cút', 'Nạc dăm rim nước dừa', 'Thịt heo xào chua ngọt',
  'Thịt bò xào rau củ', 'Bò kho cà rốt + khoai tây', 'Nui xào bò băm + chả lụa', 'Bò sốt vang',
  'Phi lê cá điêu hồng chiên giòn', 'Cá basa sốt cà chua', 'Cá lóc kho tộ', 'Chả cá sốt cà',
  'Trứng chiên thịt bằm', 'Trứng cuộn xúc xích', 'Đậu hũ dồn thịt sốt cà', 'Xíu mại sốt cà chua',
  'Canh khoai mỡ thịt bằm', 'Canh cải ngọt thịt băm', 'Canh mồng tơi thịt băm', 'Canh bí đỏ thịt bằm',
  'Canh chua cá điêu hồng', 'Canh rau ngót thịt băm', 'Canh cải bó xôi thịt băm', 'Canh rong biển thịt băm',
  'Canh khổ qua dồn thịt', 'Canh ngũ quả sườn non', 'Canh bầu nấu tôm', 'Canh mướp hương mồng tơi',
  'Rau cải thìa xào tỏi', 'Bông cải cà rốt xào', 'Đậu que xào thịt', 'Dưa leo xào trứng',
  'Su su + cà rốt xào', 'Bắp sú xào cà rốt', 'Cải thảo xào nấm', 'Rau muống xào tỏi',
  'Cơm trắng', 'Cơm chiên dương châu', 'Cơm gạo lứt',
  'Sữa tươi tiệt trùng', 'Sữa đậu nành', 'Sữa chua men sống', 'Yakult',
  'Bánh flan caramen', 'Bánh bông lan trứng muối', 'Bánh mì sandwich kẹp mứt',
  'Chuối sứ', 'Dưa hấu', 'Thanh long ruột đỏ', 'Đu đủ chín', 'Táo đỏ', 'Nho tươi'
];

const CATEGORIES = [
  'Tất cả',
  'Món mặn',
  'Món canh',
  'Rau xào',
  'Cơm',
  'Bữa phụ',
  'Tráng miệng',
  'Chung',
];

export default function DishesPage() {
  const [dishes, setDishes] = useState<IDishItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Tất cả');

  // Form thêm món mới với Autocomplete
  const [dishName, setDishName] = useState('');
  const [category, setCategory] = useState('Món mặn');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showAutocomplete, setShowAutocomplete] = useState(false);
  const [autocompleteHighlight, setAutocompleteHighlight] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const autocompleteRef = useRef<HTMLDivElement>(null);

  // Sửa món
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editCategory, setEditCategory] = useState('');

  // Toast
  const [toast, setToast] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setToast({ text, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchDishes = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/dishes');
      const data = await res.json();
      if (data.success) {
        setDishes(data.data || []);
      }
    } catch (e) {
      console.error(e);
      showToast('Lỗi tải danh sách món ăn', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDishes();
  }, []);

  // Đóng dropdown autocomplete khi click ra ngoài
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        autocompleteRef.current &&
        !autocompleteRef.current.contains(e.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(e.target as Node)
      ) {
        setShowAutocomplete(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Danh sách gợi ý Autocomplete khi người dùng gõ tay
  const combinedSuggestions = Array.from(
    new Set([
      ...dishes.map((d) => d.name),
      ...COMMON_SCHOOL_DISH_SUGGESTIONS,
    ])
  );

  const autocompleteList = dishName.trim()
    ? combinedSuggestions
        .filter((item) => matchVietnamese(item, dishName))
        .slice(0, 10)
    : [];

  const handleSelectAutocomplete = (name: string) => {
    setDishName(name);
    setShowAutocomplete(false);
    setAutocompleteHighlight(-1);
    // Tự động đoán phân loại món nếu có
    if (name.includes('Canh')) setCategory('Món canh');
    else if (name.includes('xào') || name.includes('luộc')) setCategory('Rau xào');
    else if (name.includes('Sữa') || name.includes('Bánh')) setCategory('Bữa phụ');
    else if (name.includes('Chuối') || name.includes('Dưa') || name.includes('Táo')) setCategory('Tráng miệng');
    else if (name.includes('Cơm')) setCategory('Cơm');
    else setCategory('Món mặn');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showAutocomplete || autocompleteList.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setAutocompleteHighlight((prev) =>
        prev < autocompleteList.length - 1 ? prev + 1 : prev
      );
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setAutocompleteHighlight((prev) => (prev > 0 ? prev - 1 : 0));
    } else if (e.key === 'Enter') {
      if (autocompleteHighlight >= 0 && autocompleteHighlight < autocompleteList.length) {
        e.preventDefault();
        handleSelectAutocomplete(autocompleteList[autocompleteHighlight]);
      }
    } else if (e.key === 'Tab') {
      if (autocompleteList.length > 0) {
        e.preventDefault();
        handleSelectAutocomplete(
          autocompleteHighlight >= 0 ? autocompleteList[autocompleteHighlight] : autocompleteList[0]
        );
      }
    } else if (e.key === 'Escape') {
      setShowAutocomplete(false);
    }
  };

  const handleCreateDish = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = dishName.trim();
    if (!trimmed) {
      showToast('Vui lòng nhập tên món ăn', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/dishes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: trimmed, category }),
      });

      const data = await res.json();
      if (data.success) {
        showToast(`Đã thêm món "${trimmed}" vào MongoDB!`, 'success');
        setDishName('');
        setShowAutocomplete(false);
        await fetchDishes();
      } else {
        showToast(data.error || 'Lỗi thêm món', 'error');
      }
    } catch (e) {
      showToast('Không thể kết nối máy chủ', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const startEdit = (d: IDishItem) => {
    setEditingId(d._id || null);
    setEditName(d.name);
    setEditCategory(d.category || 'Món mặn');
  };

  const handleSaveEdit = async (id: string) => {
    if (!editName.trim()) {
      showToast('Tên món không được để trống', 'error');
      return;
    }

    try {
      const res = await fetch(`/api/dishes/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: editName.trim(), category: editCategory }),
      });

      const data = await res.json();
      if (data.success) {
        showToast('Cập nhật món ăn thành công', 'success');
        setEditingId(null);
        await fetchDishes();
      } else {
        showToast(data.error || 'Lỗi cập nhật món', 'error');
      }
    } catch (e) {
      showToast('Không thể kết nối máy chủ', 'error');
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`Bạn có chắc chắn muốn xóa món "${name}" khỏi MongoDB?`)) {
      return;
    }

    try {
      const res = await fetch(`/api/dishes/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        showToast(`Đã xóa món "${name}"`, 'success');
        await fetchDishes();
      } else {
        showToast(data.error || 'Lỗi xóa món', 'error');
      }
    } catch (e) {
      showToast('Không thể kết nối máy chủ', 'error');
    }
  };

  // Lọc theo tìm kiếm và danh mục
  const filteredDishes = dishes.filter((d) => {
    const matchesSearch = matchVietnamese(d.name, searchTerm);
    const matchesCat =
      selectedCategory === 'Tất cả' || d.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', display: 'flex', flexDirection: 'column' }}>
      {/* Header bar */}
      <header
        style={{
          background: '#ffffff',
          borderBottom: '1px solid #e2e8f0',
          padding: '14px 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <Link
            href="/"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              color: '#475569',
              textDecoration: 'none',
              fontSize: '0.85rem',
              fontWeight: 600,
              padding: '6px 12px',
              borderRadius: '8px',
              background: '#f1f5f9',
            }}
          >
            <ArrowLeft size={16} />
            <span>Về trang thực đơn</span>
          </Link>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '8px',
                background: '#059669',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
              }}
            >
              <UtensilsCrossed size={20} />
            </div>
            <div>
              <h1 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0f172a' }}>
                Quản lý Kho Món Ăn Trường Học
              </h1>
              <p style={{ fontSize: '0.75rem', color: '#64748b' }}>
                Lưu trữ NoSQL MongoDB • Hỗ trợ gợi ý Autocomplete thông minh khi gõ tay
              </p>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Link
            href="/schools"
            style={{
              padding: '7px 14px',
              borderRadius: '8px',
              border: '1px solid #cbd5e1',
              color: '#334155',
              textDecoration: 'none',
              fontSize: '0.82rem',
              fontWeight: 600,
              background: '#fff',
            }}
          >
            Đến trang Danh sách trường
          </Link>
          <span
            style={{
              fontSize: '0.8rem',
              fontWeight: 700,
              background: '#ecfdf5',
              color: '#059669',
              padding: '6px 12px',
              borderRadius: '20px',
            }}
          >
            {dishes.length} món ăn
          </span>
        </div>
      </header>

      {/* Main container */}
      <main style={{ maxWidth: '1200px', width: '100%', margin: '0 auto', padding: '24px 20px', flex: 1 }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '24px', alignItems: 'start' }}>
          {/* CỘT TRÁI: FORM THÊM MÓN MỚI CÓ AUTOCOMPLETE */}
          <div
            style={{
              background: '#ffffff',
              borderRadius: '16px',
              padding: '20px',
              boxShadow: '0 4px 20px -2px rgba(0,0,0,0.06)',
              border: '1px solid #e2e8f0',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
              <Sparkles size={18} color="#059669" />
              <h2 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#0f172a' }}>
                Thêm món ăn mới (Hỗ trợ Autocomplete)
              </h2>
            </div>
            <p style={{ fontSize: '0.78rem', color: '#64748b', marginBottom: '16px' }}>
              Gõ chữ cái bất kỳ (ví dụ: <code style={{ background: '#f1f5f9', padding: '1px 4px', borderRadius: '4px' }}>ga</code>, <code style={{ background: '#f1f5f9', padding: '1px 4px', borderRadius: '4px' }}>canh</code>) để chọn nhanh món từ danh mục gợi ý, hoặc gõ tên món mới hoàn toàn.
            </p>

            <form onSubmit={handleCreateDish} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {/* VÙNG NHẬP LIỆU CÓ AUTOCOMPLETE DROPDOWN */}
              <div style={{ position: 'relative' }}>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#475569', marginBottom: '4px' }}>
                  Tên món ăn <span style={{ color: '#dc2626' }}>*</span>
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    ref={inputRef}
                    type="text"
                    value={dishName}
                    onChange={(e) => {
                      setDishName(e.target.value);
                      setShowAutocomplete(true);
                      setAutocompleteHighlight(0);
                    }}
                    onFocus={() => {
                      if (dishName.trim()) setShowAutocomplete(true);
                    }}
                    onKeyDown={handleKeyDown}
                    placeholder="Gõ tên món (Ví dụ: Gà kho sả, Canh bí đỏ...)"
                    required
                    style={{
                      width: '100%',
                      padding: '9px 12px',
                      borderRadius: '8px',
                      border: '1px solid #cbd5e1',
                      fontSize: '0.88rem',
                      background: '#f8fafc',
                    }}
                  />
                  {dishName && (
                    <button
                      type="button"
                      onClick={() => setDishName('')}
                      style={{
                        position: 'absolute',
                        right: '8px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        background: 'transparent',
                        color: '#94a3b8',
                      }}
                    >
                      <X size={14} />
                    </button>
                  )}
                </div>

                {/* Hộp gợi ý Autocomplete khi gõ */}
                {showAutocomplete && autocompleteList.length > 0 && (
                  <div
                    ref={autocompleteRef}
                    style={{
                      position: 'absolute',
                      top: 'calc(100% + 4px)',
                      left: 0,
                      right: 0,
                      background: '#ffffff',
                      border: '1px solid #cbd5e1',
                      borderRadius: '8px',
                      boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)',
                      zIndex: 100,
                      maxHeight: '220px',
                      overflowY: 'auto',
                      padding: '4px',
                    }}
                  >
                    <div style={{ fontSize: '0.7rem', color: '#94a3b8', padding: '4px 8px', fontWeight: 600 }}>
                      Gợi ý tự động (Bấm hoặc nhấn Tab/Enter để chọn):
                    </div>
                    {autocompleteList.map((item, idx) => {
                      const isHigh = idx === autocompleteHighlight;
                      const alreadyInDb = dishes.some(
                        (d) => d.name.toLowerCase() === item.toLowerCase()
                      );

                      return (
                        <div
                          key={item + idx}
                          onClick={() => handleSelectAutocomplete(item)}
                          onMouseEnter={() => setAutocompleteHighlight(idx)}
                          style={{
                            padding: '6px 10px',
                            borderRadius: '6px',
                            background: isHigh ? '#f1f5f9' : 'transparent',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            fontSize: '0.85rem',
                          }}
                        >
                          <span style={{ fontWeight: isHigh ? 600 : 400, color: '#1e293b' }}>
                            {item}
                          </span>
                          {alreadyInDb && (
                            <span style={{ fontSize: '0.7rem', color: '#059669', background: '#ecfdf5', padding: '1px 6px', borderRadius: '4px' }}>
                              Đã có trong DB
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#475569', marginBottom: '4px' }}>
                  Phân loại món
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '9px 12px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    fontSize: '0.88rem',
                    background: '#f8fafc',
                  }}
                >
                  <option value="Món mặn">Món mặn (Thịt, cá, tôm, trứng...)</option>
                  <option value="Món canh">Món canh</option>
                  <option value="Rau xào">Rau xào / Rau luộc</option>
                  <option value="Cơm">Cơm (Cơm trắng, cơm chiên...)</option>
                  <option value="Bữa phụ">Bữa phụ (Sữa, bánh, chè...)</option>
                  <option value="Tráng miệng">Tráng miệng (Trái cây tươi...)</option>
                  <option value="Chung">Phân loại khác</option>
                </select>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  background: '#059669',
                  color: '#ffffff',
                  padding: '10px 16px',
                  borderRadius: '8px',
                  fontWeight: 600,
                  fontSize: '0.9rem',
                  marginTop: '4px',
                  boxShadow: '0 2px 4px rgba(5, 150, 105, 0.25)',
                  cursor: isSubmitting ? 'not-allowed' : 'pointer',
                }}
              >
                <Plus size={16} />
                <span>{isSubmitting ? 'Đang lưu MongoDB...' : 'Thêm món vào MongoDB'}</span>
              </button>
            </form>
          </div>

          {/* CỘT PHẢI: BẢNG DANH SÁCH MÓN ĂN & BỘ LỌC */}
          <div
            style={{
              background: '#ffffff',
              borderRadius: '16px',
              padding: '20px',
              boxShadow: '0 4px 20px -2px rgba(0,0,0,0.06)',
              border: '1px solid #e2e8f0',
              display: 'flex',
              flexDirection: 'column',
              gap: '14px',
            }}
          >
            {/* Thanh tìm kiếm và bộ lọc */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
                <h2 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#0f172a' }}>
                  Danh sách món ăn ({filteredDishes.length})
                </h2>

                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    background: '#f8fafc',
                    border: '1px solid #cbd5e1',
                    borderRadius: '8px',
                    padding: '6px 10px',
                    minWidth: '220px',
                  }}
                >
                  <Search size={14} color="#94a3b8" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Tìm món (ga kho sa -> Gà kho sả)..."
                    style={{
                      border: 'none',
                      outline: 'none',
                      background: 'transparent',
                      fontSize: '0.82rem',
                      width: '100%',
                    }}
                  />
                  {searchTerm && (
                    <button type="button" onClick={() => setSearchTerm('')} style={{ background: 'transparent' }}>
                      <X size={12} color="#94a3b8" />
                    </button>
                  )}
                </div>
              </div>

              {/* Tag phân loại nhanh */}
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setSelectedCategory(cat)}
                    style={{
                      fontSize: '0.75rem',
                      padding: '4px 10px',
                      borderRadius: '16px',
                      fontWeight: 600,
                      background: selectedCategory === cat ? '#059669' : '#f1f5f9',
                      color: selectedCategory === cat ? '#ffffff' : '#475569',
                      border: 'none',
                      cursor: 'pointer',
                    }}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* List món */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '550px', overflowY: 'auto' }}>
              {loading ? (
                <div style={{ padding: '30px', textAlign: 'center', color: '#64748b' }}>Đang tải danh sách món ăn từ MongoDB...</div>
              ) : filteredDishes.length > 0 ? (
                filteredDishes.map((dish) => {
                  const isEditing = editingId === dish._id;

                  return (
                    <div
                      key={dish._id}
                      style={{
                        background: '#fafbfc',
                        border: '1px solid #e2e8f0',
                        borderRadius: '10px',
                        padding: '10px 14px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: '8px',
                      }}
                    >
                      {isEditing ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1 }}>
                          <input
                            type="text"
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                            style={{
                              padding: '5px 8px',
                              borderRadius: '6px',
                              border: '1px solid #059669',
                              fontSize: '0.85rem',
                              flex: 1,
                            }}
                          />
                          <select
                            value={editCategory}
                            onChange={(e) => setEditCategory(e.target.value)}
                            style={{
                              padding: '5px 8px',
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
                              display: 'flex',
                              alignItems: 'center',
                              gap: '4px',
                              background: '#16a34a',
                              color: '#fff',
                              padding: '5px 10px',
                              borderRadius: '6px',
                              fontSize: '0.78rem',
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
                              padding: '5px 8px',
                              borderRadius: '6px',
                              fontSize: '0.78rem',
                            }}
                          >
                            Hủy
                          </button>
                        </div>
                      ) : (
                        <>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{ fontSize: '0.9rem', fontWeight: 600, color: '#1e293b' }}>
                              {dish.name}
                            </span>
                            {dish.category && (
                              <span
                                style={{
                                  fontSize: '0.72rem',
                                  background: '#ecfdf5',
                                  color: '#047857',
                                  padding: '2px 8px',
                                  borderRadius: '6px',
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
                              onClick={() => handleDelete(dish._id!, dish.name)}
                              title="Xóa món"
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
                <div style={{ padding: '30px', textAlign: 'center', color: '#94a3b8', fontSize: '0.85rem' }}>
                  Không tìm thấy món ăn nào.
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Toast */}
      {toast && (
        <div
          style={{
            position: 'fixed',
            bottom: '24px',
            right: '24px',
            background: toast.type === 'success' ? '#065f46' : '#991b1b',
            color: '#fff',
            padding: '10px 18px',
            borderRadius: '8px',
            fontWeight: 600,
            fontSize: '0.88rem',
            boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)',
            zIndex: 9999,
          }}
        >
          {toast.text}
        </div>
      )}
    </div>
  );
}
