'use client';

import React from 'react';
import {
  BookOpen,
  FileText,
  Folder,
  Soup,
  School,
  Database,
} from 'lucide-react';

interface SidebarProps {
  activeTab: 'menu' | 'saved' | 'schools' | 'dishes';
  onTabChange: (tab: 'menu' | 'saved' | 'schools' | 'dishes') => void;
  dbStatus: 'connected' | 'connecting' | 'error';
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onTabChange,
  dbStatus,
}) => {
  return (
    <aside
      style={{
        width: '212px',
        minWidth: '212px',
        backgroundColor: '#0256c4',
        backgroundImage: 'linear-gradient(180deg, #0256c4 0%, #0045a5 100%)',
        color: '#ffffff',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: '24px 0',
        minHeight: '100vh',
        position: 'sticky',
        top: 0,
        zIndex: 40,
        boxShadow: '2px 0 10px rgba(0,0,0,0.08)',
        userSelect: 'none',
      }}
    >
      <div>
        {/* Logo / Brand matching the image */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '14px',
            marginBottom: '28px',
            padding: '0 20px',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
            }}
          >
            <BookOpen size={38} strokeWidth={1.8} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span
              style={{
                fontSize: '1.1rem',
                fontWeight: 800,
                lineHeight: 1.15,
                letterSpacing: '-0.3px',
                color: '#ffffff',
              }}
            >
              Thực đơn
            </span>
            <span
              style={{
                fontSize: '1.05rem',
                fontWeight: 800,
                lineHeight: 1.15,
                letterSpacing: '-0.3px',
                color: '#ffffff',
              }}
            >
              trường học
            </span>
          </div>
        </div>

        {/* Navigation list matching the image */}
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
          {/* Tạo thực đơn */}
          <button
            type="button"
            onClick={() => onTabChange('menu')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '14px',
              padding: '14px 20px',
              borderRadius: '0',
              border: 'none',
              borderLeft: activeTab === 'menu' ? '3px solid #ffd21f' : '3px solid transparent',
              background: activeTab === 'menu' ? 'rgba(24, 144, 255, 0.9)' : 'transparent',
              color: '#ffffff',
              fontSize: '0.92rem',
              fontWeight: activeTab === 'menu' ? 700 : 500,
              cursor: 'pointer',
              textAlign: 'left',
              width: '100%',
              transition: 'background 0.15s ease',
            }}
            onMouseEnter={(e) => {
              if (activeTab !== 'menu') e.currentTarget.style.background = 'rgba(255,255,255,0.1)';
            }}
            onMouseLeave={(e) => {
              if (activeTab !== 'menu') e.currentTarget.style.background = 'transparent';
            }}
          >
            <FileText size={22} strokeWidth={1.9} />
            <span>Tạo thực đơn</span>
          </button>

          {/* Thực đơn đã lưu */}
          <button
            type="button"
            onClick={() => onTabChange('saved')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '14px',
              padding: '14px 20px',
              borderRadius: '0',
              border: 'none',
              borderLeft: activeTab === 'saved' ? '3px solid #ffd21f' : '3px solid transparent',
              background: activeTab === 'saved' ? 'rgba(24, 144, 255, 0.9)' : 'transparent',
              color: '#ffffff',
              fontSize: '0.92rem',
              fontWeight: activeTab === 'saved' ? 700 : 500,
              cursor: 'pointer',
              textAlign: 'left',
              width: '100%',
              transition: 'background 0.15s ease',
            }}
            onMouseEnter={(e) => {
              if (activeTab !== 'saved') e.currentTarget.style.background = 'rgba(255,255,255,0.1)';
            }}
            onMouseLeave={(e) => {
              if (activeTab !== 'saved') e.currentTarget.style.background = 'transparent';
            }}
          >
            <Folder size={22} strokeWidth={1.9} />
            <span>Thực đơn đã lưu</span>
          </button>

          {/* Kho món ăn */}
          <button
            type="button"
            onClick={() => onTabChange('dishes')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '14px',
              padding: '14px 20px',
              borderRadius: '0',
              border: 'none',
              borderLeft: activeTab === 'dishes' ? '3px solid #ffd21f' : '3px solid transparent',
              background: activeTab === 'dishes' ? 'rgba(24, 144, 255, 0.9)' : 'transparent',
              color: '#ffffff',
              fontSize: '0.92rem',
              fontWeight: activeTab === 'dishes' ? 700 : 500,
              cursor: 'pointer',
              textAlign: 'left',
              width: '100%',
              transition: 'background 0.15s ease',
            }}
            onMouseEnter={(e) => {
              if (activeTab !== 'dishes') e.currentTarget.style.background = 'rgba(255,255,255,0.1)';
            }}
            onMouseLeave={(e) => {
              if (activeTab !== 'dishes') e.currentTarget.style.background = 'transparent';
            }}
          >
            <Soup size={22} strokeWidth={1.9} />
            <span>Kho món ăn</span>
          </button>

          {/* Quản lý trường học */}
          <button
            type="button"
            onClick={() => onTabChange('schools')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '14px',
              padding: '14px 20px',
              borderRadius: '0',
              border: 'none',
              borderLeft: activeTab === 'schools' ? '3px solid #ffd21f' : '3px solid transparent',
              background: activeTab === 'schools' ? 'rgba(24, 144, 255, 0.9)' : 'transparent',
              color: '#ffffff',
              fontSize: '0.92rem',
              fontWeight: activeTab === 'schools' ? 700 : 500,
              cursor: 'pointer',
              textAlign: 'left',
              width: '100%',
              transition: 'background 0.15s ease',
            }}
            onMouseEnter={(e) => {
              if (activeTab !== 'schools') e.currentTarget.style.background = 'rgba(255,255,255,0.1)';
            }}
            onMouseLeave={(e) => {
              if (activeTab !== 'schools') e.currentTarget.style.background = 'transparent';
            }}
          >
            <School size={22} strokeWidth={1.9} />
            <span>Quản lý trường học</span>
          </button>
        </nav>
      </div>

      {/* Trạng thái kết nối */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
          paddingTop: '16px',
          borderTop: '1px solid rgba(255,255,255,0.15)',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            background: dbStatus === 'connected' ? 'rgba(34, 197, 94, 0.2)' : 'rgba(239, 68, 68, 0.2)',
            border: `1px solid ${dbStatus === 'connected' ? 'rgba(34, 197, 94, 0.4)' : 'rgba(239, 68, 68, 0.4)'}`,
            borderRadius: '20px',
            padding: '4px 10px',
            fontSize: '0.72rem',
            fontWeight: 600,
            color: '#ffffff',
            marginTop: '4px',
          }}
        >
          <Database size={12} color={dbStatus === 'connected' ? '#4ade80' : '#f87171'} />
          <span>{dbStatus === 'connected' ? 'Đã kết nối' : 'Đang kết nối...'}</span>
        </div>
      </div>
    </aside>
  );
};
