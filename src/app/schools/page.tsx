'use client';

import React from 'react';
import Link from 'next/link';
import { SchoolsView } from '@/components/SchoolsView';
import { ArrowLeft } from 'lucide-react';

export default function SchoolsPage() {
  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', display: 'flex', flexDirection: 'column' }}>
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
      </header>

      <main style={{ padding: '24px 20px', flex: 1 }}>
        <SchoolsView />
      </main>
    </div>
  );
}
