'use client';

import React, { useState, useEffect } from 'react';
import { ISchoolItem } from '@/types';
import { matchVietnamese } from '@/lib/vietnamese';
import {
  Building2,
  Plus,
  Search,
  Trash2,
  Edit2,
  Check,
  X,
  Phone,
  MapPin,
  Calendar,
  School as SchoolIcon,
} from 'lucide-react';

interface SchoolsViewProps {
  onSelectSchoolForMenu?: (schoolName: string) => void;
  showToast?: (text: string, type?: 'success' | 'error' | 'info') => void;
}

export const SchoolsView: React.FC<SchoolsViewProps> = ({
  onSelectSchoolForMenu,
  showToast = () => {},
}) => {
  const [schools, setSchools] = useState<ISchoolItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Form thêm mới
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Trạng thái sửa
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editAddress, setEditAddress] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editNotes, setEditNotes] = useState('');

  const fetchSchools = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/schools');
      const data = await res.json();
      if (data.success) {
        setSchools(data.data || []);
      }
    } catch (e) {
      console.error(e);
      showToast('Lỗi tải danh sách trường', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSchools();
  }, []);

  const handleCreateSchool = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      showToast('Vui lòng nhập tên trường', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/schools', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          address: address.trim(),
          phone: phone.trim(),
          notes: notes.trim(),
        }),
      });

      const data = await res.json();
      if (data.success) {
        showToast('Thêm trường học thành công!', 'success');
        setName('');
        setAddress('');
        setPhone('');
        setNotes('');
        await fetchSchools();
      } else {
        showToast(data.error || 'Lỗi thêm trường', 'error');
      }
    } catch (e) {
      showToast('Không thể kết nối máy chủ', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const startEdit = (s: ISchoolItem) => {
    setEditingId(s._id || null);
    setEditName(s.name);
    setEditAddress(s.address || '');
    setEditPhone(s.phone || '');
    setEditNotes(s.notes || '');
  };

  const handleSaveEdit = async (id: string) => {
    if (!editName.trim()) {
      showToast('Tên trường không được để trống', 'error');
      return;
    }

    try {
      const res = await fetch(`/api/schools/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: editName.trim(),
          address: editAddress.trim(),
          phone: editPhone.trim(),
          notes: editNotes.trim(),
        }),
      });

      const data = await res.json();
      if (data.success) {
        showToast('Cập nhật trường học thành công', 'success');
        setEditingId(null);
        await fetchSchools();
      } else {
        showToast(data.error || 'Lỗi cập nhật', 'error');
      }
    } catch (e) {
      showToast('Không thể kết nối máy chủ', 'error');
    }
  };

  const handleDelete = async (id: string, schoolName: string) => {
    if (!window.confirm(`Bạn có chắc muốn xóa trường "${schoolName}" khỏi MongoDB?`)) {
      return;
    }

    try {
      const res = await fetch(`/api/schools/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        showToast(`Đã xóa trường "${schoolName}"`, 'success');
        await fetchSchools();
      } else {
        showToast(data.error || 'Lỗi xóa trường', 'error');
      }
    } catch (e) {
      showToast('Không thể kết nối máy chủ', 'error');
    }
  };

  const filteredSchools = schools.filter((s) =>
    matchVietnamese(s.name, searchTerm) || (s.address && matchVietnamese(s.address, searchTerm))
  );

  return (
    <div style={{ maxWidth: '1200px', width: '100%', margin: '0 auto', animation: 'fadeIn 0.2s ease-out' }}>
      {/* Tiêu đề phần quản lý */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '20px',
          background: '#ffffff',
          padding: '16px 20px',
          borderRadius: '16px',
          border: '1px solid #e2e8f0',
          boxShadow: '0 2px 10px rgba(0,0,0,0.03)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '10px',
              background: '#2563eb',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
            }}
          >
            <SchoolIcon size={22} />
          </div>
          <div>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
              Quản lý Danh Sách Trường Học
            </h2>
            <p style={{ fontSize: '0.78rem', color: '#64748b', margin: 0 }}>
              Dữ liệu NoSQL MongoDB • Tự động gợi ý tên trường khi tạo thực đơn
            </p>
          </div>
        </div>

        <span
          style={{
            fontSize: '0.82rem',
            fontWeight: 700,
            background: '#eff6ff',
            color: '#2563eb',
            padding: '6px 14px',
            borderRadius: '20px',
          }}
        >
          {schools.length} trường trong cơ sở dữ liệu
        </span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '24px', alignItems: 'start' }}>
        {/* CỘT TRÁI: FORM THÊM TRƯỜNG */}
        <div
          style={{
            background: '#ffffff',
            borderRadius: '16px',
            padding: '22px',
            boxShadow: '0 4px 20px -2px rgba(0,0,0,0.06)',
            border: '1px solid #e2e8f0',
          }}
        >
          <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#0f172a', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Plus size={18} color="#2563eb" />
            <span>Thêm trường học mới</span>
          </h3>

          <form onSubmit={handleCreateSchool} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#475569', marginBottom: '4px' }}>
                Tên trường học <span style={{ color: '#dc2626' }}>*</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ví dụ: Trường Tiểu học Trưng Vương"
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
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#475569', marginBottom: '4px' }}>
                Địa chỉ
              </label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Ví dụ: 260 Hai Bà Trưng, Quận 1, TP.HCM"
                style={{
                  width: '100%',
                  padding: '9px 12px',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  fontSize: '0.88rem',
                  background: '#f8fafc',
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#475569', marginBottom: '4px' }}>
                Số điện thoại liên hệ
              </label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Ví dụ: 028 3829 1234"
                style={{
                  width: '100%',
                  padding: '9px 12px',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  fontSize: '0.88rem',
                  background: '#f8fafc',
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#475569', marginBottom: '4px' }}>
                Ghi chú
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Ghi chú về khối lớp, bán trú..."
                rows={2}
                style={{
                  width: '100%',
                  padding: '9px 12px',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  fontSize: '0.88rem',
                  background: '#f8fafc',
                }}
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                background: '#2563eb',
                color: '#ffffff',
                padding: '10px 16px',
                borderRadius: '8px',
                fontWeight: 600,
                fontSize: '0.9rem',
                marginTop: '6px',
                boxShadow: '0 2px 4px rgba(37, 99, 235, 0.25)',
                cursor: isSubmitting ? 'not-allowed' : 'pointer',
              }}
            >
              <Plus size={16} />
              <span>{isSubmitting ? 'Đang lưu vào MongoDB...' : 'Lưu trường vào MongoDB'}</span>
            </button>
          </form>
        </div>

        {/* CỘT PHẢI: DANH SÁCH TRƯỜNG */}
        <div
          style={{
            background: '#ffffff',
            borderRadius: '16px',
            padding: '22px',
            boxShadow: '0 4px 20px -2px rgba(0,0,0,0.06)',
            border: '1px solid #e2e8f0',
            display: 'flex',
            flexDirection: 'column',
            gap: '14px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>
              Danh sách ({filteredSchools.length})
            </h3>

            {/* Ô tìm kiếm */}
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
                placeholder="Tìm trường (có/không dấu)..."
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

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '550px', overflowY: 'auto' }}>
            {loading ? (
              <div style={{ padding: '30px', textAlign: 'center', color: '#64748b' }}>Đang tải danh sách từ MongoDB...</div>
            ) : filteredSchools.length > 0 ? (
              filteredSchools.map((s) => {
                const isEditing = editingId === s._id;

                return (
                  <div
                    key={s._id}
                    style={{
                      background: '#fafbfc',
                      border: '1px solid #e2e8f0',
                      borderRadius: '10px',
                      padding: '12px 14px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '6px',
                    }}
                  >
                    {isEditing ? (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <input
                          type="text"
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          placeholder="Tên trường..."
                          style={{ padding: '6px 10px', borderRadius: '6px', border: '1px solid #2563eb', fontSize: '0.88rem' }}
                        />
                        <input
                          type="text"
                          value={editAddress}
                          onChange={(e) => setEditAddress(e.target.value)}
                          placeholder="Địa chỉ..."
                          style={{ padding: '6px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.82rem' }}
                        />
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                          <input
                            type="text"
                            value={editPhone}
                            onChange={(e) => setEditPhone(e.target.value)}
                            placeholder="Số điện thoại..."
                            style={{ padding: '6px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.82rem' }}
                          />
                          <input
                            type="text"
                            value={editNotes}
                            onChange={(e) => setEditNotes(e.target.value)}
                            placeholder="Ghi chú..."
                            style={{ padding: '6px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.82rem' }}
                          />
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '6px' }}>
                          <button
                            type="button"
                            onClick={() => handleSaveEdit(s._id!)}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '4px',
                              background: '#16a34a',
                              color: '#fff',
                              padding: '6px 12px',
                              borderRadius: '6px',
                              fontSize: '0.78rem',
                              fontWeight: 600,
                            }}
                          >
                            <Check size={14} />
                            Lưu
                          </button>
                          <button
                            type="button"
                            onClick={() => setEditingId(null)}
                            style={{
                              background: '#e2e8f0',
                              color: '#475569',
                              padding: '6px 10px',
                              borderRadius: '6px',
                              fontSize: '0.78rem',
                            }}
                          >
                            Hủy
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                          <span style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0f172a' }}>
                            {s.name}
                          </span>
                          {s.address && (
                            <span style={{ fontSize: '0.78rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '4px' }}>
                              <MapPin size={12} color="#94a3b8" />
                              {s.address}
                            </span>
                          )}
                          {s.phone && (
                            <span style={{ fontSize: '0.78rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '4px' }}>
                              <Phone size={12} color="#94a3b8" />
                              {s.phone}
                            </span>
                          )}
                          {s.notes && (
                            <span style={{ fontSize: '0.75rem', color: '#94a3b8', fontStyle: 'italic' }}>
                              {s.notes}
                            </span>
                          )}
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', flexShrink: 0 }}>
                          {onSelectSchoolForMenu && (
                            <button
                              type="button"
                              onClick={() => onSelectSchoolForMenu(s.name)}
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '4px',
                                background: '#eff6ff',
                                color: '#2563eb',
                                padding: '6px 10px',
                                borderRadius: '6px',
                                fontSize: '0.75rem',
                                fontWeight: 600,
                                border: '1px solid #bfdbfe',
                              }}
                              title="Tạo thực đơn ngay cho trường này (không load lại trang)"
                            >
                              <Calendar size={13} />
                              Lập thực đơn
                            </button>
                          )}

                          <button
                            type="button"
                            onClick={() => startEdit(s)}
                            title="Sửa thông tin trường"
                            style={{
                              padding: '6px',
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
                            onClick={() => handleDelete(s._id!, s.name)}
                            title="Xóa trường"
                            style={{
                              padding: '6px',
                              borderRadius: '6px',
                              background: '#fef2f2',
                              border: '1px solid #fecaca',
                              color: '#dc2626',
                            }}
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })
            ) : (
              <div style={{ padding: '30px', textAlign: 'center', color: '#94a3b8', fontSize: '0.85rem' }}>
                Không tìm thấy trường nào phù hợp.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
