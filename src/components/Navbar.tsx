'use client';

import React from 'react';
import Link from 'next/link';
import { IMenuData } from '@/types';
import {
  UtensilsCrossed,
  Save,
  FolderOpen,
  Database,
  PlusCircle,
  RotateCcw,
  Sparkles,
  School,
  ChefHat,
  LayoutGrid,
} from 'lucide-react';

interface NavbarProps {
  currentMenu: IMenuData;
  onNewMenu: () => void;
  onLoadSampleWeek3: () => void;
  onOpenDishManager: () => void;
  onOpenSavedMenus: () => void;
  onSaveMenu: () => void;
  isSaving: boolean;
  dbStatus: 'connected' | 'connecting' | 'error';
}

export const Navbar: React.FC<NavbarProps> = ({
  currentMenu,
  onNewMenu,
  onLoadSampleWeek3,
  onOpenDishManager,
  onOpenSavedMenus,
  onSaveMenu,
  isSaving,
  dbStatus,
}) => {
  return (
    <header
      style={{
        background: '#ffffff',
        borderBottom: '1px solid #e2e8f0',
        padding: '12px 24px',
        position: 'sticky',
        top: 0,
        zIndex: 50,
        boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
      }}
    >
      <div
        style={{
          maxWidth: '1600px',
          margin: '0 auto',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px',
        }}
      >
        {/* Brand / Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '10px',
              background: 'linear-gradient(135deg, #2563eb, #1d4ed8)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              boxShadow: '0 4px 10px rgba(37, 99, 235, 0.3)',
            }}
          >
            <UtensilsCrossed size={22} />
          </div>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Link href="/" style={{ textDecoration: 'none', color: 'inherit' }}>
                <h1 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.3px', margin: 0 }}>
                  School Menu Maker
                </h1>
              </Link>
              {/* Trạng thái MongoDB */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px',
                  background: dbStatus === 'connected' ? '#ecfdf5' : '#fef2f2',
                  border: `1px solid ${dbStatus === 'connected' ? '#a7f3d0' : '#fecaca'}`,
                  borderRadius: '12px',
                  padding: '2px 8px',
                  fontSize: '0.72rem',
                  fontWeight: 600,
                  color: dbStatus === 'connected' ? '#047857' : '#b91c1c',
                }}
              >
                <Database size={11} />
                <span>{dbStatus === 'connected' ? 'MongoDB OK' : 'Đang kết nối...'}</span>
              </div>
            </div>
            <p style={{ fontSize: '0.75rem', color: '#64748b' }}>
              Tạo ảnh & PDF thực đơn trường học theo tuần • Lưu trữ NoSQL
            </p>
          </div>
        </div>

        {/* Các liên kết trang chính */}
        <nav style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Link
            href="/"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 12px',
              borderRadius: '8px',
              fontSize: '0.82rem',
              fontWeight: 700,
              textDecoration: 'none',
              background: '#eff6ff',
              color: '#1d4ed8',
              border: '1px solid #bfdbfe',
            }}
          >
            <LayoutGrid size={15} />
            <span>Tạo thực đơn</span>
          </Link>

          <Link
            href="/schools"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 12px',
              borderRadius: '8px',
              fontSize: '0.82rem',
              fontWeight: 600,
              textDecoration: 'none',
              background: '#f8fafc',
              color: '#334155',
              border: '1px solid #e2e8f0',
            }}
          >
            <School size={15} color="#2563eb" />
            <span>Trường học</span>
          </Link>

          <Link
            href="/dishes"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 12px',
              borderRadius: '8px',
              fontSize: '0.82rem',
              fontWeight: 600,
              textDecoration: 'none',
              background: '#f8fafc',
              color: '#334155',
              border: '1px solid #e2e8f0',
            }}
          >
            <ChefHat size={15} color="#059669" />
            <span>Kho món ăn</span>
          </Link>
        </nav>

        {/* Trạng thái thực đơn đang sửa */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span
            style={{
              fontSize: '0.8rem',
              color: '#475569',
              background: '#f1f5f9',
              padding: '4px 12px',
              borderRadius: '8px',
            }}
          >
            {currentMenu._id ? (
              <>
                Đang sửa: <strong>Tuần {currentMenu.weekNumber}</strong> (ID: {currentMenu._id.slice(-6)})
              </>
            ) : (
              <>
                Bản nháp mới: <strong>Tuần {currentMenu.weekNumber}</strong>
              </>
            )}
          </span>
        </div>

        {/* Các nút hành động chính */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          {/* Nút Tạo mới */}
          <button
            type="button"
            onClick={onNewMenu}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              background: '#f8fafc',
              border: '1px solid #cbd5e1',
              color: '#334155',
              padding: '7px 12px',
              borderRadius: '8px',
              fontSize: '0.82rem',
              fontWeight: 600,
            }}
            title="Tạo thực đơn tuần mới"
          >
            <PlusCircle size={15} color="#2563eb" />
            <span>Tạo mới</span>
          </button>

          {/* Nạp mẫu Tuần 3 */}
          <button
            type="button"
            onClick={onLoadSampleWeek3}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              background: '#eff6ff',
              border: '1px solid #bfdbfe',
              color: '#1d4ed8',
              padding: '7px 12px',
              borderRadius: '8px',
              fontSize: '0.82rem',
              fontWeight: 600,
            }}
            title="Nạp lại thực đơn mẫu Tuần 3 - Trường Tiểu học Trưng Vương"
          >
            <RotateCcw size={14} />
            <span>Mẫu Tuần 3</span>
          </button>

          {/* Quản lý món ăn */}
          <button
            type="button"
            onClick={onOpenDishManager}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              background: '#f8fafc',
              border: '1px solid #cbd5e1',
              color: '#334155',
              padding: '7px 12px',
              borderRadius: '8px',
              fontSize: '0.82rem',
              fontWeight: 600,
            }}
            title="Xem và quản lý kho món ăn đã lưu"
          >
            <Sparkles size={15} color="#d97706" />
            <span>Kho món ăn</span>
          </button>

          {/* Danh sách thực đơn đã lưu */}
          <button
            type="button"
            onClick={onOpenSavedMenus}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              background: '#f8fafc',
              border: '1px solid #cbd5e1',
              color: '#334155',
              padding: '7px 12px',
              borderRadius: '8px',
              fontSize: '0.82rem',
              fontWeight: 600,
            }}
            title="Mở danh sách các thực đơn đã lưu"
          >
            <FolderOpen size={15} color="#059669" />
            <span>Thực đơn đã lưu</span>
          </button>

          {/* NÚT LƯU THỰC ĐƠN */}
          <button
            type="button"
            onClick={onSaveMenu}
            disabled={isSaving}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              background: '#16a34a',
              color: '#ffffff',
              padding: '8px 18px',
              borderRadius: '8px',
              fontSize: '0.85rem',
              fontWeight: 700,
              boxShadow: '0 2px 6px rgba(22, 163, 74, 0.3)',
              opacity: isSaving ? 0.7 : 1,
            }}
          >
            <Save size={16} />
            <span>{isSaving ? 'Đang lưu MongoDB...' : 'Lưu thực đơn'}</span>
          </button>
        </div>
      </div>
    </header>
  );
};
