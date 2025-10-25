import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { LayoutDashboard, BarChart3, LogOut, Settings, Menu, X } from 'lucide-react';
import './SidebarAdmin.css';

const SidebarAdmin = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userType');
    navigate('/login');
  };

  const handleNavigate = (path) => {
    navigate(path);
    setIsOpen(false);
  };

  const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/admin/dashboard' },
    { icon: BarChart3, label: 'Relatórios', path: '/admin/relatorios' }
  ];

  return (
    <>
      {/* Botão hambúrguer para mobile */}
      <button className="sidebar-admin-toggle" onClick={() => setIsOpen(!isOpen)}>
        <Menu size={24} />
      </button>

      {/* Overlay */}
      {isOpen && <div className="sidebar-admin-overlay" onClick={() => setIsOpen(false)} />}

      {/* Sidebar */}
      <div className={`sidebar-admin ${isOpen ? 'open' : ''}`}>
        {/* Botão de fechar (mobile) */}
        <button className="sidebar-admin-close" onClick={() => setIsOpen(false)}>
          <X size={24} />
        </button>

        <div className="sidebar-admin-header">
  <span className="previvai-logo">PREVIVAI</span>
      </div>

      <nav className="sidebar-admin-nav">
        {menuItems.map((item, index) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          
          return (
            <button
              key={index}
              className={`sidebar-admin-item ${isActive ? 'active' : ''}`}
              onClick={() => handleNavigate(item.path)}
            >
              <Icon size={20} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      <button className="sidebar-admin-logout" onClick={handleLogout}>
        <LogOut size={20} />
        <span>Sair</span>
      </button>
    </div>
    </>
  );
};

export default SidebarAdmin;
