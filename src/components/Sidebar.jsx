import React, { useContext } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { 
  LayoutDashboard, 
  Users, 
  UserPlus, 
  Activity, 
  Package, 
  Shield, 
  LogOut,
  Menu,
  HeartPulse
} from 'lucide-react';
import './Sidebar.css';

const Sidebar = ({ isOpen, toggleSidebar }) => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: <LayoutDashboard size={20} /> },
    { name: 'Add Patient', path: '/patients/new', icon: <UserPlus size={20} /> },
    { name: 'Patient List', path: '/patients', icon: <Users size={20} /> },
    { name: 'Diagnoses', path: '/diagnoses', icon: <Activity size={20} /> },
    { name: 'Products', path: '/products', icon: <Package size={20} /> },
    { name: 'Staff', path: '/users', icon: <Shield size={20} />, role: ['doctor', 'staff'] },
    { name: 'Add Staff', path: '/users/new', icon: <UserPlus size={20} />, role: ['doctor'] },
  ];

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && <div className="sidebar-overlay" onClick={toggleSidebar}></div>}
      
      <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <HeartPulse size={28} className="sidebar-logo-icon" />
          <h2 className="sidebar-brand">HospitalPro HMS</h2>
        </div>
        
        <div className="sidebar-user-info">
          <div className="user-avatar">
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <div className="user-details">
            <span className="user-name">{user?.name}</span>
            <span className="user-role">{user?.role}</span>
          </div>
        </div>

        <nav className="sidebar-nav">
          {navItems.map((item, index) => {
            // Hide if user's role is not in the allowed roles array
            if (item.role) {
              const allowedRoles = Array.isArray(item.role) ? item.role : [item.role];
              if (!allowedRoles.includes(user?.role)) return null;
            }

            return (
              <NavLink 
                to={item.path} 
                key={index} 
                className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
                end={item.path === '/dashboard'}
              >
                {item.icon}
                <span>{item.name}</span>
              </NavLink>
            );
          })}
        </nav>

        <div className="sidebar-footer">
          <button className="nav-item logout-btn" onClick={handleLogout}>
            <LogOut size={20} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
