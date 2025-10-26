import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Edit2, Save, X } from 'lucide-react';
import pacienteService from '../../../services/pacienteService';
import { supabase } from '../../../services/supabaseClient';
import './Prontuario.css';

// ==========================
// FUNÇÃO: GERA RESUMO E ALERTAS
// ==========================
const gerarResumoEAlertas = (paciente) => {
    const alertas = [];
    const resumos = [];
    const dadosPessoais = paciente.dadosPessoais || {};
    const historicoMedico = paciente.historicoMedico || {};
    const historicoFamiliar = paciente.historicoFamiliar || {};

    // === INFORMAÇÕES BÁSICAS ===
    resumos.push(`Paciente: ${dadosPessoais.nomeCompleto || 'Nome não informado'}`);

    if (dadosPessoais.dataNascimento) {
        const idade = calcularIdade(dadosPessoais.dataNascimento);
        resumos.push(`Idade: ${idade} anos`);
    }

    // === ALERTAS CLÍNICOS ===
    if (dadosPessoais.tipoSanguineo) {
        alertas.push(`⚠️ TIPO SANGUÍNEO: ${dadosPessoais.tipoSanguineo.toUpperCase()}`);
    }

    if (historicoMedico.alergias && historicoMedico.alergias !== 'nenhum') {
        alertas.push(`🚨 ALERGIAS: ${historicoMedico.alergias}${historicoMedico.alergiasOutro ? ` - ${historicoMedico.alergiasOutro}` : ''}`);
    }

    if (historicoMedico.doencasCronicas && historicoMedico.doencasCronicas !== 'nenhum') {
        alertas.push(`⚠️ DOENÇAS CRÔNICAS: ${historicoMedico.doencasCronicas}${historicoMedico.doencasCronicasOutro ? ` - ${historicoMedico.doencasCronicasOutro}` : ''}`);
    }

    if (historicoMedico.medicamentos && historicoMedico.medicamentos !== 'nenhum') {
        alertas.push(`⚠️ MEDICAMENTOS EM USO: ${historicoMedico.medicamentos}${historicoMedico.medicamentosOutro ? ` - ${historicoMedico.medicamentosOutro}` : ''}`);
    }

    // === HISTÓRICO FAMILIAR DE CÂNCER (ALERTA DE DIAGNÓSTICO PRECOCE) ===
    if (historicoFamiliar.possuiCancer === 'sim') {
        alertas.push(`⚠️ HISTÓRICO FAMILIAR DE CÂNCER: ${historicoFamiliar.tipoCancer || 'Tipo não especificado'}${historicoFamiliar.tipoCancerOutro ? ` - ${historicoFamiliar.tipoCancerOutro}` : ''}`);
        resumos.push('🔍 Recomendação: acompanhamento médico regular e exames preventivos conforme faixa etária.');
    }

    // === CONDIÇÕES RELACIONADAS AO RISCO ONCOLÓGICO ===
    if (historicoMedico.doencasCronicas?.toLowerCase().includes('hormonal') ||
        historicoMedico.doencasCronicas?.toLowerCase().includes('hepática') ||
        historicoMedico.doencasCronicas?.toLowerCase().includes('intestinal')) {
        alertas.push('⚠️ Condições que podem aumentar risco oncológico. Avaliação preventiva recomendada.');
    }

    if (historicoMedico.tratamentos?.toLowerCase().includes('radioterapia') ||
        historicoMedico.tratamentos?.toLowerCase().includes('quimioterapia')) {
        resumos.push('📋 Paciente com histórico de tratamento oncológico. Manter acompanhamento periódico.');
    }

    // === INFORMAÇÕES ADICIONAIS ===
    if (historicoMedico.cirurgias === 'sim') resumos.push('Possui histórico de cirurgias.');
    if (historicoMedico.internacoes === 'sim') resumos.push('Possui histórico de internações.');
    if (historicoMedico.problemasNascimento && historicoMedico.problemasNascimento !== 'nenhum') {
        resumos.push(`Problemas no nascimento: ${historicoMedico.problemasNascimento}`);
    }
    if (historicoMedico.historicoSaude) resumos.push(`Histórico de saúde: ${historicoMedico.historicoSaude}`);

    // === ALERTA FINAL: MONITORAMENTO ===
    if (historicoFamiliar.possuiCancer === 'sim' || historicoMedico.doencasCronicas) {
        alertas.push('🧭 ALERTA: Dados indicam possível necessidade de diagnóstico precoce e acompanhamento preventivo.');
    }

    return `=== ALERTAS IMPORTANTES ===\n${alertas.join('\n')}\n\n=== RESUMO GERAL ===\n${resumos.join('\n')}`;
};

// ==========================
// FUNÇÃO: CALCULAR IDADE
// ==========================
const calcularIdade = (dataNascimento) => {
    const hoje = new Date();
    const nascimento = new Date(dataNascimento);
    let idade = hoje.getFullYear() - nascimento.getFullYear();
    const mesAtual = hoje.getMonth();
    const mesNascimento = nascimento.getMonth();

    if (mesAtual < mesNascimento || (mesAtual === mesNascimento && hoje.getDate() < nascimento.getDate())) {
        idade--;
    }

    return idade;
};

// ==========================
// COMPONENTE PRINCIPAL
// ==========================
const Prontuario = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [paciente, setPaciente] = useState(null);
    const [backupPaciente, setBackupPaciente] = useState(null);

    useEffect(() => {
        const carregarProntuario = async () => {
            try {
                setLoading(true);
                const { data: { user } } = await supabase.auth.getUser();
                if (!user) {
                    navigate('/login');
                    return;
                }

                const pacientes = await pacienteService.getByUserId(user.id);
                if (!pacientes || pacientes.length === 0) {
                    alert('Nenhuma ficha encontrada. Complete seu cadastro.');
                    navigate('/ficha-cadastro');
                    return;
                }

                const p = pacientes[0];
                const { data: prontuario } = await supabase
                    .from('Prontuarios')
                    .select('*')
                    .eq('ID_Paciente', p.id)
                    .single();

                const pacienteCarregado = {
                    ...p,
                    dadosPessoais: p.dadosPessoais || p.dados_pessoais || {},
                    historicoMedico: p.historicoMedico || p.historico_medico || {},
                    historicoFamiliar: p.historicoFamiliar || p.historico_familiar || {},
                    prontuario: prontuario || null,
                };

                // 🔥 Gera resumo e alertas com foco em diagnóstico precoce
                const resumoGerado = gerarResumoEAlertas(pacienteCarregado);
                const resumoSalvo = prontuario?.ResumoGeralSaude || prontuario?.resumo_geral_saude;

                pacienteCarregado.prontuario = {
                    ...pacienteCarregado.prontuario,
                    ResumoGeralSaude: resumoSalvo || resumoGerado,
                };

                setPaciente(pacienteCarregado);
            } catch (error) {
                console.error('Erro ao carregar prontuário:', error);
                alert('Erro ao carregar prontuário.');
            } finally {
                setLoading(false);
            }
        };

        carregarProntuario();
    }, [navigate]);

    // ==========================
    // HANDLERS
    // ==========================
    const handleEditClick = () => {
        setBackupPaciente(JSON.parse(JSON.stringify(paciente)));
        setIsEditing(true);
    };

    const handleCancel = () => {
        setPaciente(backupPaciente);
        setIsEditing(false);
    };

    const handleFieldChange = (section, field, value) => {
        setPaciente(prev => ({
            ...prev,
            [section]: {
                ...prev[section],
                [field]: value,
            }
        }));
    };

    const handleSave = async () => {
        try {
            const updateData = {
                usuario_id: paciente.usuario_id,
                dadosPessoais: paciente.dadosPessoais,
                historicoMedico: paciente.historicoMedico,
                historicoFamiliar: paciente.historicoFamiliar,
            };
            await pacienteService.update(paciente.id, updateData);
            setIsEditing(false);
            alert('Dados atualizados com sucesso!');
        } catch (error) {
            console.error('Erro ao salvar:', error);
            alert('Erro ao salvar dados. Tente novamente.');
        }
    };

    // ==========================
    // RENDERIZAÇÃO
    // ==========================
    if (loading) return <main className="prontuario-page"><p>Carregando prontuário...</p></main>;
    if (!paciente) return <main className="prontuario-page"><p>Nenhum paciente encontrado.</p></main>;

    return (
        <main className="prontuario-page">
            <h1 className="prontuario-title">Prontuário</h1>

            {/* DADOS PESSOAIS */}
            {/* (Mantém sua renderização atual igual) */}

            {/* === RESUMO E ALERTAS === */}
            <div className="prontuario-card alerts-card">
                <h2 className="card-title">Resumo e Alertas</h2>
                <div className="card-content">
                    {paciente.prontuario?.ResumoGeralSaude ? (
                        <div className="prontuario-resumo">
                            {paciente.prontuario.ResumoGeralSaude.split('\n').map((linha, index) => {
                                const className = linha.includes('🚨')
                                    ? 'alerta-critico'
                                    : linha.includes('⚠️')
                                    ? 'alerta-importante'
                                    : linha.includes('🔍')
                                    ? 'alerta-prevencao'
                                    : linha.includes('===')
                                    ? 'secao-titulo'
                                    : 'texto-normal';
                                return (
                                    <div key={index} className={className}>
                                        {linha}
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <p>Nenhum resumo ou alerta disponível.</p>
                    )}
                </div>
            </div>
        </main>
    );
};

export default Prontuario;
