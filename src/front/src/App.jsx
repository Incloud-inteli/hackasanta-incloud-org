import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import AdminLayout from './layouts/AdminLayout';

// Importar páginas
import Login from './pages/Login/Login';
import Cadastro from './pages/Cadastro/Cadastro';
import Menu from './pages/Paciente/Menu/Menu';
import Chat from './pages/Paciente/Chat/Chat';
import Consultas from './pages/Paciente/Consultas/Consultas';
import Prontuario from './pages/Paciente/Prontuario/Prontuario';
import Locais from './pages/Paciente/Locais/Locais';
import FichaCadastro from './pages/Paciente/FichaCadastro/FichaCadastro';

// Importar páginas Admin
import Dashboard from './pages/Admin/Dashboard/Dashboard';
import Relatorios from './pages/Admin/Relatorios/Relatorios';

// Componente para rotas protegidas
const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('supabase_token'); // <--- corrigido para o token real
  if (!token) {
    console.log('[ProtectedRoute] Token não encontrado. Redirecionando para login.');
    return <Navigate to="/login" />;
  }
  return children;
};

function App() {
  return (
    <Routes>
      {/* Rotas públicas */}
      <Route path="/login" element={<Login />} />
      <Route path="/cadastro" element={<Cadastro />} />

      {/* Rotas Admin */}
      <Route
        path="/admin/dashboard"
        element={
          <ProtectedRoute>
            <AdminLayout>
              <Dashboard />
            </AdminLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/relatorios"
        element={
          <ProtectedRoute>
            <AdminLayout>
              <Relatorios />
            </AdminLayout>
          </ProtectedRoute>
        }
      />

      {/* Rotas Paciente */}
      <Route
        path="/menu"
        element={
          <ProtectedRoute>
            <MainLayout>
              <Menu />
            </MainLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/chat"
        element={
          <ProtectedRoute>
            <MainLayout>
              <Chat />
            </MainLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/consultas"
        element={
          <ProtectedRoute>
            <MainLayout>
              <Consultas />
            </MainLayout>
          </ProtectedRoute>
        }
      />
      {/* Redirecionamento das rotas antigas */}
      <Route path="/historico" element={<Navigate to="/consultas" />} />
      <Route path="/agendamentos" element={<Navigate to="/consultas" />} />
      <Route
        path="/prontuario"
        element={
          <ProtectedRoute>
            <MainLayout>
              <Prontuario />
            </MainLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/locais"
        element={
          <ProtectedRoute>
            <MainLayout>
              <Locais />
            </MainLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/ficha-cadastro"
        element={
          <ProtectedRoute>
            <MainLayout>
              <FichaCadastro />
            </MainLayout>
          </ProtectedRoute>
        }
      />

      {/* Rota padrão */}
      <Route path="*" element={<Navigate to="/login" />} />
    </Routes>
  );
}

export default App;