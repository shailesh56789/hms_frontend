import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import { Menu } from 'lucide-react';
import './Sidebar.css';

const Layout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className="app-layout">
      <Sidebar isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />
      
      <div className="main-content">
        <header className="top-header">
          <button className="mobile-menu-btn" onClick={toggleSidebar}>
            <Menu size={24} />
          </button>
        </header>
        
        <main className="page-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;
