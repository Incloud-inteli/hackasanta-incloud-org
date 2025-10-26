import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../services/supabaseClient';
import './Login.css';

const Login = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [errorModal, setErrorModal] = useState(null);

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
  setErrorModal(`Erro ao entrar: ${error.message}`);
  return;
      }

      if (!data || !data.user) {
        console.warn('[LOGIN] Usuário não encontrado ou email não confirmado.');
  setErrorModal('Usuário não encontrado ou e-mail não confirmado.');
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
  setErrorModal('Ocorreu um erro inesperado. Veja o console para mais detalhes.');
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

        {errorModal && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            background: 'rgba(0,0,0,0.35)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999
          }} onClick={() => setErrorModal(null)}>
            <div style={{
              background: '#fff',
              borderRadius: 16,
              boxShadow: '0 4px 24px rgba(0,0,0,0.18)',
              padding: '2.5rem 2rem',
              maxWidth: 350,
              textAlign: 'center',
              color: '#234',
              fontFamily: 'inherit',
              animation: 'fadeIn .3s',
              cursor: 'pointer'
            }}>
              <svg width="48" height="48" fill="none" viewBox="0 0 24 24" style={{marginBottom: 12}}><circle cx="12" cy="12" r="12" fill="#ffeaea"/><path d="M8 8l8 8M16 8l-8 8" stroke="#e74c3c" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/></svg>
              <h2 style={{margin: '0 0 0.5rem 0', color: '#e74c3c'}}>Erro</h2>
              <div style={{fontSize: 16, marginBottom: 8}}>{errorModal}</div>
              <div style={{fontSize: 13, color: '#555'}}>Clique para fechar</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Login;