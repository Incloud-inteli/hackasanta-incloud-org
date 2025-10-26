// front/src/pages/Paciente/Menu/Menu.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import userService from '../../../services/userService';
import atendimentoService from '../../../services/atendimentoService';
import alertaService from '../../../services/alertaService';
import { supabase } from '../../../services/supabaseClient';
import './Menu.css';

const Menu = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [paciente, setPaciente] = useState(null);
  const [proximoAtendimento, setProximoAtendimento] = useState(null);
  const [ultimaAvaliacao, setUltimaAvaliacao] = useState(null);
  const [progressoCadastro, setProgressoCadastro] = useState(0);

  useEffect(() => {
    carregarDados();
  }, []);

  const carregarDados = async () => {
    try {
      setLoading(true);

      // Pegar usuário logado via Supabase
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate('/login');
        return;
      }

      // Buscar dados completos do usuário no backend
      const usuario = await userService.getById(user.id); // user.id do Supabase
      if (!usuario) {
        console.error('Usuário não encontrado no backend');
        return;
      }
      setPaciente(usuario);

  // Buscar atendimentos do paciente
  let atendimentos = await atendimentoService.getByPacienteId(usuario._id);
  if (!Array.isArray(atendimentos)) atendimentos = [];
  const agendados = atendimentos.filter(a => a.status === 'Agendado');
  if (agendados.length > 0) setProximoAtendimento(agendados[0]);

      // Buscar alertas do paciente
      const alertas = await alertaService.getByPacienteId(usuario._id);
      if (alertas.length > 0) setUltimaAvaliacao(alertas[0]);

      // Calcular progresso do cadastro
      const progresso = calcularProgressoCadastro(usuario);
      setProgressoCadastro(progresso);

    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setLoading(false);
    }
  };

  const calcularProgressoCadastro = (paciente) => {
    let campos = 0;
    let preenchidos = 0;

    // Dados pessoais
    const dados = paciente.dadosPessoais || paciente.dados_pessoais || {};
    const camposPessoais = [
      'nomeCompleto', 'dataNascimento', 'cpf', 'telefone', 'email', 'genero', 'cep', 'estadoCivil', 'raca', 'profissao', 'tipoSanguineo'
    ];
    campos += camposPessoais.length;
    camposPessoais.forEach(campo => {
      if (dados[campo]) preenchidos++;
    });

    // Histórico médico
    const historico = paciente.historicoMedico || paciente.historico_medico || {};
    const camposHistorico = [
      'historicoSaude', 'cirurgias', 'alergias', 'internacoes', 'doencasCronicas', 'problemasNascimento', 'medicamentos', 'tratamentos'
    ];
    campos += camposHistorico.length;
    camposHistorico.forEach(campo => {
      if (historico[campo]) preenchidos++;
    });

    // Histórico familiar
    const historicoFamiliar = paciente.historicoFamiliar || paciente.historico_familiar || {};
    const camposFamiliar = ['possuiCancer', 'tipoCancer'];
    campos += camposFamiliar.length;
    camposFamiliar.forEach(campo => {
      if (historicoFamiliar[campo]) preenchidos++;
    });

    // Contatos de emergência
    if (Array.isArray(paciente.contatosEmergencia) && paciente.contatosEmergencia.length > 0) {
      campos += 2; // nome e telefone do contato principal
      if (paciente.contatosEmergencia[0].nome) preenchidos++;
      if (paciente.contatosEmergencia[0].telefone) preenchidos++;
    }

    // Considera cadastro completo se mais de 80% preenchido
    return Math.round((preenchidos / campos) * 100);
  };

  const formatarData = (data) => {
    if (!data) return 'N/A';
    const date = new Date(data);
    return date.toLocaleDateString('pt-BR');
  };

  const formatarDataHora = (data) => {
    if (!data) return 'N/A';
    const date = new Date(data);
    return `${date.toLocaleDateString('pt-BR')} às ${date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`;
  };

  if (loading) {
    return (
      <main className="menu-page">
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <p>Carregando dados...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="menu-page">
      <h1 className="welcome-header">
        Bem-vindo{paciente && paciente.nomeCompleto ? `, ${paciente.nomeCompleto.split(' ')[0]}` : ''}!
      </h1>

      {/* Cards Grid */}
      <div className="cards-grid">
        {/* Meu prontuário Card */}
        <Card className="dashboard-card">
          <CardHeader>
            <CardTitle className="card-title-custom">Meu prontuário</CardTitle>
          </CardHeader>
          <CardContent className="card-content-spacing">
            <p className="card-text">Mantenha seu histórico médico atualizado</p>
            <p className="card-text">
              <span className="text-bold">Últimas atualizações:</span>{' '}
              {/* Mostra a data de atualização se houver, senão 'Nunca atualizado' */}
              {paciente?.updatedAt || paciente?.atualizado_em
                ? formatarData(paciente.updatedAt || paciente.atualizado_em)
                : 'Nunca atualizado'}
            </p>
            {/* Só mostra o botão se o paciente NÃO existir (ou seja, cadastro incompleto) */}
            {!(paciente && (paciente._id || paciente.id)) && (
              <Button
                className="btn-primary"
                onClick={() => navigate('/ficha-cadastro')}
              >
                Preencher Ficha
              </Button>
            )}
          </CardContent>
        </Card>

        {/* Próximo contato Card */}
        <Card className="dashboard-card">
          <CardHeader>
            <CardTitle className="card-title-custom">Próximo contato</CardTitle>
          </CardHeader>
          <CardContent className="card-content-spacing">
            {proximoAtendimento ? (
              <>
                <p className="card-text">
                  <span className="text-bold">Data:</span>{' '}
                  {formatarDataHora(proximoAtendimento.dataHoraAgendamento)}
                </p>
                <p className="card-text">
                  <span className="text-bold">Tipo:</span> {proximoAtendimento.tipo}
                </p>
                <p className="card-note">
                  O agente de IA fará contato para verificar atualizações.
                </p>
              </>
            ) : (
              <p className="card-text">Nenhum atendimento agendado no momento.</p>
            )}
          </CardContent>
        </Card>

        {/* Última avaliação Card */}
        <Card className="dashboard-card">
          <CardHeader>
            <CardTitle className="card-title-custom">Última avaliação</CardTitle>
          </CardHeader>
          <CardContent className="card-content-spacing">
            {ultimaAvaliacao ? (
              <>
                <p className="card-text">
                  <span className="text-bold">Data:</span>{' '}
                  {formatarData(ultimaAvaliacao.dataHoraGeracao)}
                </p>
                <p className="card-text">
                  <span className="text-bold">Risco:</span>{' '}
                  <span className={`text-warning`}>{ultimaAvaliacao.nivelRisco}</span>
                </p>
                <p className="card-text">
                  <span className="text-bold">Motivo:</span> {ultimaAvaliacao.motivo}
                </p>
              </>
            ) : (
              <p className="card-text">Nenhuma avaliação registrada ainda.</p>
            )}
          </CardContent>
        </Card>

        {/* Locais próximos Card */}
        <Card className="dashboard-card">
          <CardHeader>
            <CardTitle className="card-title-custom">Locais próximos</CardTitle>
          </CardHeader>
          <CardContent className="card-content-spacing">
            <p className="card-text">Encontre hospitais e clínicas especializadas</p>
            <p className="card-text">
              <span className="text-bold">Próximos:</span> 3 locais recomendados
            </p>
            <Button
              className="btn-primary"
              onClick={() => navigate('/locais')}
            >
              Ver Locais
            </Button>
          </CardContent>
        </Card>
      </div>
    </main>
  );
};

export default Menu;