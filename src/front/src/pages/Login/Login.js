import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../services/supabaseClient';
import './Login.css';

const Login = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    console.log('[LOGIN] Tentando logar com:', formData.email, formData.password);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password
      });

      setLoading(false);
      console.log('[LOGIN] Retorno do Supabase:', data, error);

      if (error) {
        console.error('[LOGIN] Erro ao logar:', error);
        alert(`Erro ao logar: ${error.message}`);
        return;
      }

      if (!data || !data.user) {
        console.warn('[LOGIN] Usuário não encontrado ou email não confirmado.');
        alert('Usuário não encontrado ou email não confirmado.');
        return;
      }

      console.log('[LOGIN] Usuário logado:', data.user);
      console.log('[LOGIN] Sessão:', data.session);

  // Salva token e userId no localStorage
  localStorage.setItem('supabase_token', data.session.access_token);
  localStorage.setItem('userId', data.user.id);
  console.log('[LOGIN] Token e userId salvos no localStorage');

  // Redireciona direto para a FichaCadastro
  console.log('[LOGIN] Redirecionando para /ficha-cadastro');
  navigate('/ficha-cadastro');

    } catch (err) {
      setLoading(false);
      console.error('[LOGIN] Erro inesperado:', err);
      alert('Ocorreu um erro inesperado. Veja o console.');
    }
  };

  return (
    <div 
      className="login-container" 
      style={{ 
        background: `url(/backlogin.png), linear-gradient(135deg, #5672B9, #C2D1F8)`,
        backgroundSize: '100%, cover',
        backgroundPosition: 'center center, center center',
        backgroundRepeat: 'no-repeat, no-repeat'
      }}
    >
      {/* Logo acima do card */}
      <div className="login-logo-container">
        <img src="/logo.png" alt="Logo" className="login-logo" />
        <p className="login-tagline">O poder da prevenção, guiado pela inteligência.</p>
      </div>
      
      <div className="login-card">
        <div className="login-header">
          <h1>LOGIN</h1>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Email</label>
            <input 
              type="email" 
              name="email" 
              value={formData.email} 
              onChange={handleChange} 
              placeholder="Digite seu email" 
              required 
            />
          </div>

          <div className="form-group">
            <label>Senha</label>
            <input 
              type="password" 
              name="password" 
              value={formData.password} 
              onChange={handleChange} 
              placeholder="Digite sua senha" 
              required 
            />
          </div>

          <button type="submit" className="login-btn" disabled={loading}>
            {loading ? 'Entrando...' : 'Entrar'}
          </button>

          <div className="login-footer">
            <p>Não tem uma conta? <a href="/cadastro">Cadastre-se</a></p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;