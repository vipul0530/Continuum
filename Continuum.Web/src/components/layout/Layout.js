import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar.js';
import Header from './Header.js';

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--color-bg)' }}>
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        marginLeft: sidebarOpen ? 'var(--sidebar-width)' : 0,
        transition: 'margin-left 0.25s ease',
        minWidth: 0,
      }}>
        <Header onMenuClick={() => setSidebarOpen(o => !o)} sidebarOpen={sidebarOpen} />
        <main style={{
          flex: 1,
          padding: '24px',
          marginTop: 'var(--header-height)',
          maxWidth: '1400px',
          width: '100%',
          margin: 'var(--header-height) auto 0',
          paddingLeft: '24px',
          paddingRight: '24px',
          paddingBottom: '40px',
        }}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
