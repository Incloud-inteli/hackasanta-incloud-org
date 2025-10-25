import React from 'react';
import SidebarAdmin from '../components/SidebarAdmin/SidebarAdmin';

const AdminLayout = ({ children }) => {
  return (
    <div style={{ display: 'flex' }}>
      <SidebarAdmin />
      <div style={{ flex: 1 }}>
        {children}
      </div>
    </div>
  );
};

export default AdminLayout;
