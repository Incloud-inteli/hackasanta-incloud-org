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

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
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

      const response = await fetch('http://localhost:3001/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(registerPayload),
      });

      if (!response.ok) {
        const json = await response.json().catch(() => null);
        const text = json?.error || json?.message || (await response.text());
        console.error('[CADASTRO] Erro do backend:', text);
        alert(`Erro ao cadastrar: ${text}`);
        setLoading(false);
        return;
      }

      const resBody = await response.json();
      console.log('[CADASTRO] Usuário criado via backend:', resBody);

      alert('Usuário cadastrado com sucesso! Verifique seu email se for necessário confirmar.');

      navigate('/login');
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
            />
          </div>

          <div className="form-group">
            <label>CPF</label>
            <input
              type="text"
              name="cpf"
              value={formData.cpf}
              onChange={handleChange}
              placeholder="000.000.000-00"
              required
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
            />
          </div>

          <div className="form-group">
            <label>Telefone</label>
            <input
              type="tel"
              name="telefone"
              value={formData.telefone}
              onChange={handleChange}
              placeholder="(00) 00000-0000"
              required
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
            />
          </div>

          <button type="submit" className="cadastro-btn" disabled={loading}>
            {loading ? 'Criando...' : 'Criar conta'}
          </button>

          <div className="cadastro-footer">
            <a href="/login" className="voltar-link">← Voltar</a>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Cadastro;