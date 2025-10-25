import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  User, 
  Menu,
  MessageSquare,
  History,
  FileText,
  MapPin,
  CalendarDays,
  LogOut,
  X
} from 'lucide-react';
import './Sidebar.css';

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);

  const menuItems = [
    { path: '/menu', icon: Menu, label: 'Menu' },
    { path: '/chat', icon: MessageSquare, label: 'Chat' },
    { path: '/consultas', icon: CalendarDays, label: 'Consultas' },
    { path: '/prontuario', icon: FileText, label: 'Prontuário' },
    { path: '/locais', icon: MapPin, label: 'Locais' }
  ];

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userType');
    navigate('/login');
  };

  const handleNavigate = (path) => {
    navigate(path);
    setIsOpen(false); // Fecha o menu ao navegar
  };

  return (
    <>
      {/* Botão hambúrguer para mobile */}
      <button className="sidebar-toggle" onClick={() => setIsOpen(!isOpen)}>
        <Menu size={24} />
      </button>

      {/* Overlay */}
      {isOpen && <div className="sidebar-overlay" onClick={() => setIsOpen(false)} />}

      {/* Sidebar */}
      <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
        {/* Botão de fechar (mobile) */}
        <button className="sidebar-close" onClick={() => setIsOpen(false)}>
          <X size={24} />
        </button>

        <div className="sidebar-content">
        {/* Header */}
        <div className="sidebar-header">
          <span className="header-text previvai-logo">PREVIVAI</span>
        </div>

        {/* Navigation Items */}
        <nav className="sidebar-nav">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            
            return (
              <button
                key={item.path}
                className={`nav-item ${isActive ? 'active' : ''}`}
                onClick={() => handleNavigate(item.path)}
              >
                <Icon size={20} className="nav-icon" />
                <span className="nav-label">{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Exit Button */}
      <div className="sidebar-footer">
        <button className="logout-btn" onClick={handleLogout}>
          <LogOut className="logout-icon" />
          <span>Sair</span>
        </button>
      </div>
    </aside>
    </>
  );
};

export default Sidebar;
