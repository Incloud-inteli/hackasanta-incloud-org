import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
// Registration now goes through our backend to use the service role safely
import './Cadastro.css';

const Cadastro = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    nomeCompleto: '',
    cpf: '',
    email: '',
    telefone: '',
    senha: '',
    confirmarSenha: ''
  });
  const [loading, setLoading] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);


  // Máscara automática para CPF
  function formatCPF(value) {
    return value
      .replace(/\D/g, '')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d{1,2})$/, '$1-$2')
      .slice(0, 14);
  }

  // Máscara automática para telefone
  function formatTelefone(value) {
    return value
      .replace(/\D/g, '')
      .replace(/(\d{2})(\d)/, '($1) $2')
      .replace(/(\d{5})(\d)/, '$1-$2')
      .slice(0, 15);
  }

  const handleChange = (e) => {
    let { name, value } = e.target;
    if (name === 'cpf') {
      value = formatCPF(value);
    }
    if (name === 'telefone') {
      value = formatTelefone(value);
    }
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.senha !== formData.confirmarSenha) {
      alert('As senhas não coincidem!');
      return;
    }

    setLoading(true);
    console.log('[CADASTRO] Iniciando cadastro...', formData.email);

    try {
      // 1️⃣ Envia os dados para o backend, que cria o usuário via Service Role Key
      const registerPayload = {
        email: formData.email,
        password: formData.senha,
        nomeCompleto: formData.nomeCompleto,
        cpf: formData.cpf,
        telefone: formData.telefone
      };

  const response = await fetch(`${import.meta.env.VITE_API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(registerPayload),
      });

      if (!response.ok) {
        let errorMessage = 'Erro desconhecido';
        try {
          const json = await response.json();
          errorMessage = json?.error || json?.message || `Erro ${response.status}`;
        } catch {
          errorMessage = `Erro ${response.status}: ${response.statusText}`;
        }
        console.error('[CADASTRO] Erro do backend:', errorMessage);
        alert(`Erro ao cadastrar: ${errorMessage}`);
        setLoading(false);
        return;
      }

      const resBody = await response.json();
      console.log('[CADASTRO] Usuário criado via backend:', resBody);

      setShowSuccessModal(true);
      setTimeout(() => {
        setShowSuccessModal(false);
        navigate('/login');
      }, 3500);
    } catch (err) {
      console.error('[CADASTRO] Erro geral:', err);
      alert('Erro inesperado ao cadastrar. Veja o console.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="cadastro-container"
      style={{
        background: `url(/backlogin.png), linear-gradient(135deg, #5672B9, #C2D1F8)`,
        backgroundSize: '100%, cover',
        backgroundPosition: 'center center, center center',
        backgroundRepeat: 'no-repeat, no-repeat'
      }}
    >
      <div className="cadastro-logo-container">
        <img src="/logo.png" alt="Logo" className="cadastro-logo" />
        <p className="cadastro-tagline">O poder da prevenção, guiado pela inteligência.</p>
      </div>

      <div className="cadastro-card">
        <div className="cadastro-header">
          <h1>Crie sua conta</h1>
          <p>Preencha os dados abaixo para se cadastrar.</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Nome Completo</label>
            <input
              type="text"
              name="nomeCompleto"
              value={formData.nomeCompleto}
              onChange={handleChange}
              required
              placeholder="Ex: Maria da Silva"
            />
          </div>

          <div className="form-group">
            <label>CPF</label>
            <input
              type="text"
              name="cpf"
              value={formData.cpf}
              onChange={handleChange}
              placeholder="Ex: 123.456.789-00"
              pattern="\d{3}\.\d{3}\.\d{3}-\d{2}"
              title="Digite o CPF no formato 000.000.000-00"
              required
              maxLength={14}
            />
          </div>

          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              placeholder="Ex: usuario@email.com"
            />
          </div>

          <div className="form-group">
            <label>Telefone</label>
            <input
              type="tel"
              name="telefone"
              value={formData.telefone}
              onChange={handleChange}
              placeholder="Ex: (11) 91234-5678"
              pattern="\(\d{2}\) \d{5}-\d{4}"
              title="Digite o telefone no formato (11) 91234-5678"
              required
              maxLength={15}
            />
          </div>

          <div className="form-group">
            <label>Senha</label>
            <input
              type="password"
              name="senha"
              value={formData.senha}
              onChange={handleChange}
              required
              placeholder="Mínimo 6 caracteres"
            />
          </div>

          <div className="form-group">
            <label>Confirmar senha</label>
            <input
              type="password"
              name="confirmarSenha"
              value={formData.confirmarSenha}
              onChange={handleChange}
              required
              placeholder="Repita a senha"
            />
          </div>

          <button type="submit" className="cadastro-btn" disabled={loading}>
            {loading ? 'Criando...' : 'Criar conta'}
          </button>

          <div className="cadastro-footer">
            <a href="/login" className="voltar-link">← Voltar</a>
          </div>
        </form>

        {showSuccessModal && (
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
          }}>
            <div style={{
              background: '#fff',
              borderRadius: 16,
              boxShadow: '0 4px 24px rgba(0,0,0,0.18)',
              padding: '2.5rem 2rem',
              maxWidth: 350,
              textAlign: 'center',
              color: '#234',
              fontFamily: 'inherit',
              animation: 'fadeIn .3s'
            }}>
              <svg width="48" height="48" fill="none" viewBox="0 0 24 24" style={{marginBottom: 12}}><circle cx="12" cy="12" r="12" fill="#e6f7ee"/><path d="M8 12.5l3 3 5-5" stroke="#2ecc71" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/></svg>
              <h2 style={{margin: '0 0 0.5rem 0', color: '#2ecc71'}}>Cadastro realizado!</h2>
              <div style={{fontSize: 16, marginBottom: 8}}>Sua conta foi criada com sucesso.</div>
              <div style={{fontSize: 14, color: '#555'}}>Confira sua caixa de entrada (e também o spam) para ativar o acesso pelo link enviado por email.</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Cadastro;