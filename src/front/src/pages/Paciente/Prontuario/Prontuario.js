import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Edit2, Save, X } from 'lucide-react';
import pacienteService from '../../../services/pacienteService';
import { supabase } from '../../../services/supabaseClient';
import './Prontuario.css';

const Prontuario = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    
    // Estado principal que guarda o paciente que veio do banco ("fonte da verdade")
    const [paciente, setPaciente] = useState(null);
    // Backup para a função de cancelar a edição
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
                    navigate('/ficha-cadastro');
                    return;
                }
                
                const pacienteCarregado = pacientes[0];
                setPaciente(pacienteCarregado);

            } catch (error) {
                console.error('Erro ao carregar prontuário:', error);
                if (error.response?.status === 404) {
                    alert('Ficha de paciente não encontrada. Por favor, complete seu cadastro.');
                    navigate('/ficha-cadastro');
                }
            } finally {
                setLoading(false);
            }
        };

        carregarProntuario();
    }, [navigate]);
    
    const handleEditClick = () => {
        // Guarda uma cópia exata do estado atual antes de começar a editar
        setBackupPaciente(JSON.parse(JSON.stringify(paciente)));
        setIsEditing(true);
    };

    const handleCancel = () => {
        // Restaura o backup e sai do modo de edição
        setPaciente(backupPaciente);
        setIsEditing(false);
    };

    // Handler único para alterar os campos dentro de 'dadosPessoais'
    const handleDadosPessoaisChange = (e) => {
        const { name, value } = e.target;
        setPaciente(prev => ({
            ...prev,
            dadosPessoais: {
                ...prev.dadosPessoais,
                [name]: value,
            }
        }));
    };

    const handleSave = async () => {
        try {
            const { _id, userId, ...updateData } = paciente; // Pega tudo do estado 'paciente', exceto o _id e userId
            
            await pacienteService.update(paciente._id, updateData);
            
            setIsEditing(false);
            setBackupPaciente(null); // Limpa o backup
            alert('Dados atualizados com sucesso!');
        } catch (error) {
            console.error('Erro ao salvar:', error);
            alert('Erro ao salvar dados. Tente novamente.');
        }
    };

    if (loading) {
        return <main className="prontuario-page"><p>Carregando prontuário...</p></main>;
    }

    if (!paciente) {
        return <main className="prontuario-page"><p>Nenhum paciente encontrado.</p></main>;
    }
    
    const progressoCadastro = 75;

    return (
        <main className="prontuario-page">
            <h1 className="prontuario-title">Prontuário</h1>

            {/* Progress Bar ... */}
            <div className="progress-section">{/* ... */}</div>

            <div className="prontuario-card">
                <div className="card-header-with-button">
                    <h2 className="card-title">Dados pessoais</h2>
                    {!isEditing ? (
                        <button className="btn-edit-toggle" onClick={handleEditClick}><Edit2 size={18} /> Editar</button>
                    ) : (
                        <div className="edit-actions">
                            <button className="btn-save-edit" onClick={handleSave}><Save size={18} /> Salvar</button>
                            <button className="btn-cancel-edit" onClick={handleCancel}><X size={18} /> Cancelar</button>
                        </div>
                    )}
                </div>
                <div className="card-content">
                    {!isEditing ? (
                        <>
                            <div className="data-row"><span className="data-label">Nome:</span> {paciente.dadosPessoais?.nomeCompleto}</div>
                            <div className="data-row"><span className="data-label">Data de nascimento:</span> {paciente.dadosPessoais?.dataNascimento ? new Date(paciente.dadosPessoais.dataNascimento).toLocaleDateString('pt-BR') : 'Não informado'}</div>
                            <div className="data-row"><span className="data-label">CPF:</span> {paciente.dadosPessoais?.cpf}</div>
                            <div className="data-row"><span className="data-label">Telefone:</span> {paciente.dadosPessoais?.telefone}</div>
                            <div className="data-row"><span className="data-label">Email:</span> {paciente.dadosPessoais?.email || 'Não informado'}</div>
                        </>
                    ) : (
                        <>
                            <div className="data-row-edit"><label className="data-label">Nome:</label><input type="text" className="data-input" name="nomeCompleto" value={paciente.dadosPessoais?.nomeCompleto || ''} onChange={handleDadosPessoaisChange} /></div>
                            <div className="data-row-edit"><label className="data-label">CPF:</label><input type="text" className="data-input" name="cpf" value={paciente.dadosPessoais?.cpf || ''} onChange={handleDadosPessoaisChange} /></div>
                            <div className="data-row-edit"><label className="data-label">Telefone:</label><input type="text" className="data-input" name="telefone" value={paciente.dadosPessoais?.telefone || ''} onChange={handleDadosPessoaisChange} /></div>
                            <div className="data-row-edit"><label className="data-label">Email:</label><input type="text" className="data-input" name="email" value={paciente.dadosPessoais?.email || ''} onChange={handleDadosPessoaisChange} /></div>
                        </>
                    )}
                     {!isEditing && (
                        <button className="btn-complete-profile" onClick={() => navigate('/ficha-cadastro')}>Completar Ficha</button>
                    )}
                </div>
            </div>

            {/* Os outros cards agora também usam o 'paciente' como fonte da verdade */}
            <div className="prontuario-card">
                <h2 className="card-title">Histórico Médico</h2>
                <div className="card-content">
                    <div className="data-row"><span className="data-label">Resumo:</span> {paciente.prontuario?.resumoGeralSaude || 'Não informado'}</div>
                </div>
            </div>

            <div className="prontuario-card">
                <h2 className="card-title">Histórico Familiar</h2>
                <div className="card-content">
                    <div className="data-row"><span className="data-label">Possui Câncer na Família:</span> {paciente.historicoFamiliar?.possuiCancer || 'Não informado'}</div>
                    <div className="data-row"><span className="data-label">Tipo de Câncer:</span> {paciente.historicoFamiliar?.tipoCancer || 'Não informado'}</div>
                </div>
            </div>
        </main>
    );
};

export default Prontuario;