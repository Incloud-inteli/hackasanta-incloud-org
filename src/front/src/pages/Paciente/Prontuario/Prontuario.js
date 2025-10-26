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
                    // Só redireciona se realmente não existe paciente
                    alert('Nenhuma ficha encontrada. Complete seu cadastro.');
                    navigate('/ficha-cadastro');
                    return;
                }
                // Mapeia snake_case do backend para camelCase do frontend
                const p = pacientes[0];
                const pacienteCarregado = {
                    ...p,
                    dadosPessoais: p.dadosPessoais || p.dados_pessoais || {},
                    historicoMedico: p.historicoMedico || p.historico_medico || {},
                    historicoFamiliar: p.historicoFamiliar || p.historico_familiar || {},
                    dadosContato: p.dadosContato || p.dados_contato || {},
                    dadosEndereco: p.dadosEndereco || p.dados_endereco || {},
                };
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


    // Handler genérico para campos aninhados
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
            // Monta objeto aninhado para update
            const updateData = {
                usuario_id: paciente.usuario_id,
                dadosPessoais: paciente.dadosPessoais,
                historicoMedico: paciente.historicoMedico,
                historicoFamiliar: paciente.historicoFamiliar,
                dadosContato: paciente.dadosContato,
                dadosEndereco: paciente.dadosEndereco,
                formType: paciente.formType,
                parentesco: paciente.parentesco,
                // Adicione outros campos se necessário
            };
            await pacienteService.update(paciente.id, updateData);
            setIsEditing(false);
            setBackupPaciente(null);
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
    
    return (
        <main className="prontuario-page">
            <h1 className="prontuario-title">Prontuário</h1>

            {/* Dados Pessoais */}
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
                            <div className="data-row"><span className="data-label">Gênero:</span> {paciente.dadosPessoais?.genero || 'Não informado'}</div>
                            <div className="data-row"><span className="data-label">CEP:</span> {paciente.dadosPessoais?.cep || 'Não informado'}</div>
                            <div className="data-row"><span className="data-label">Estado Civil:</span> {paciente.dadosPessoais?.estadoCivil || 'Não informado'}</div>
                            <div className="data-row"><span className="data-label">Raça:</span> {paciente.dadosPessoais?.raca || 'Não informado'}</div>
                            <div className="data-row"><span className="data-label">Profissão:</span> {paciente.dadosPessoais?.profissao || 'Não informado'}</div>
                            <div className="data-row"><span className="data-label">Tipo Sanguíneo:</span> {paciente.dadosPessoais?.tipoSanguineo || 'Não informado'}</div>
                        </>
                    ) : (
                        <>
                            <div className="data-row-edit"><label className="data-label">Nome:</label><input type="text" className="data-input" value={paciente.dadosPessoais?.nomeCompleto || ''} onChange={e => handleFieldChange('dadosPessoais', 'nomeCompleto', e.target.value)} /></div>
                            <div className="data-row-edit"><label className="data-label">Data de nascimento:</label><input type="date" className="data-input" value={paciente.dadosPessoais?.dataNascimento || ''} onChange={e => handleFieldChange('dadosPessoais', 'dataNascimento', e.target.value)} /></div>
                            <div className="data-row-edit"><label className="data-label">CPF:</label><input type="text" className="data-input" value={paciente.dadosPessoais?.cpf || ''} onChange={e => handleFieldChange('dadosPessoais', 'cpf', e.target.value)} /></div>
                            <div className="data-row-edit"><label className="data-label">Telefone:</label><input type="text" className="data-input" value={paciente.dadosPessoais?.telefone || ''} onChange={e => handleFieldChange('dadosPessoais', 'telefone', e.target.value)} /></div>
                            <div className="data-row-edit"><label className="data-label">Email:</label><input type="text" className="data-input" value={paciente.dadosPessoais?.email || ''} onChange={e => handleFieldChange('dadosPessoais', 'email', e.target.value)} /></div>
                            <div className="data-row-edit"><label className="data-label">Gênero:</label><input type="text" className="data-input" value={paciente.dadosPessoais?.genero || ''} onChange={e => handleFieldChange('dadosPessoais', 'genero', e.target.value)} /></div>
                            <div className="data-row-edit"><label className="data-label">CEP:</label><input type="text" className="data-input" value={paciente.dadosPessoais?.cep || ''} onChange={e => {
                                const valor = e.target.value.replace(/\D/g, '');
                                if (valor.length <= 8) {
                                    const cepFormatado = valor.length > 5 
                                        ? `${valor.slice(0, 5)}-${valor.slice(5)}`
                                        : valor;
                                    handleFieldChange('dadosPessoais', 'cep', cepFormatado);
                                }
                            }} placeholder="00000-000" maxLength="9" /></div>
                            <div className="data-row-edit"><label className="data-label">Estado Civil:</label><input type="text" className="data-input" value={paciente.dadosPessoais?.estadoCivil || ''} onChange={e => handleFieldChange('dadosPessoais', 'estadoCivil', e.target.value)} /></div>
                            <div className="data-row-edit"><label className="data-label">Raça:</label><input type="text" className="data-input" value={paciente.dadosPessoais?.raca || ''} onChange={e => handleFieldChange('dadosPessoais', 'raca', e.target.value)} /></div>
                            <div className="data-row-edit"><label className="data-label">Profissão:</label><input type="text" className="data-input" value={paciente.dadosPessoais?.profissao || ''} onChange={e => handleFieldChange('dadosPessoais', 'profissao', e.target.value)} /></div>
                            <div className="data-row-edit"><label className="data-label">Tipo Sanguíneo:</label><input type="text" className="data-input" value={paciente.dadosPessoais?.tipoSanguineo || ''} onChange={e => handleFieldChange('dadosPessoais', 'tipoSanguineo', e.target.value)} /></div>
                        </>
                    )}
                    {!isEditing && (
                        <button className="btn-complete-profile" onClick={() => navigate('/ficha-cadastro')}>Completar Ficha</button>
                    )}
                </div>
            </div>

            {/* Histórico Médico */}
            <div className="prontuario-card">
                <h2 className="card-title">Histórico Médico</h2>
                <div className="card-content">
                    {!isEditing ? (
                        <>
                            <div className="data-row"><span className="data-label">Histórico de Saúde:</span> {paciente.historicoMedico?.historicoSaude || 'Não informado'}</div>
                            <div className="data-row"><span className="data-label">Cirurgias:</span> {paciente.historicoMedico?.cirurgias || 'Não informado'}</div>
                            <div className="data-row"><span className="data-label">Alergias:</span> {paciente.historicoMedico?.alergias || 'Não informado'}</div>
                            <div className="data-row"><span className="data-label">Internações:</span> {paciente.historicoMedico?.internacoes || 'Não informado'}</div>
                            <div className="data-row"><span className="data-label">Doenças Crônicas:</span> {paciente.historicoMedico?.doencasCronicas || 'Não informado'}</div>
                            <div className="data-row"><span className="data-label">Problemas no Nascimento:</span> {paciente.historicoMedico?.problemasNascimento || 'Não informado'}</div>
                            <div className="data-row"><span className="data-label">Medicamentos:</span> {paciente.historicoMedico?.medicamentos || 'Não informado'}</div>
                            <div className="data-row"><span className="data-label">Tratamentos:</span> {paciente.historicoMedico?.tratamentos || 'Não informado'}</div>
                        </>
                    ) : (
                        <>
                            <div className="data-row-edit"><label className="data-label">Histórico de Saúde:</label><input type="text" className="data-input" value={paciente.historicoMedico?.historicoSaude || ''} onChange={e => handleFieldChange('historicoMedico', 'historicoSaude', e.target.value)} /></div>
                            <div className="data-row-edit"><label className="data-label">Cirurgias:</label><input type="text" className="data-input" value={paciente.historicoMedico?.cirurgias || ''} onChange={e => handleFieldChange('historicoMedico', 'cirurgias', e.target.value)} /></div>
                            <div className="data-row-edit"><label className="data-label">Alergias:</label><input type="text" className="data-input" value={paciente.historicoMedico?.alergias || ''} onChange={e => handleFieldChange('historicoMedico', 'alergias', e.target.value)} /></div>
                            <div className="data-row-edit"><label className="data-label">Internações:</label><input type="text" className="data-input" value={paciente.historicoMedico?.internacoes || ''} onChange={e => handleFieldChange('historicoMedico', 'internacoes', e.target.value)} /></div>
                            <div className="data-row-edit"><label className="data-label">Doenças Crônicas:</label><input type="text" className="data-input" value={paciente.historicoMedico?.doencasCronicas || ''} onChange={e => handleFieldChange('historicoMedico', 'doencasCronicas', e.target.value)} /></div>
                            <div className="data-row-edit"><label className="data-label">Problemas no Nascimento:</label><input type="text" className="data-input" value={paciente.historicoMedico?.problemasNascimento || ''} onChange={e => handleFieldChange('historicoMedico', 'problemasNascimento', e.target.value)} /></div>
                            <div className="data-row-edit"><label className="data-label">Medicamentos:</label><input type="text" className="data-input" value={paciente.historicoMedico?.medicamentos || ''} onChange={e => handleFieldChange('historicoMedico', 'medicamentos', e.target.value)} /></div>
                            <div className="data-row-edit"><label className="data-label">Tratamentos:</label><input type="text" className="data-input" value={paciente.historicoMedico?.tratamentos || ''} onChange={e => handleFieldChange('historicoMedico', 'tratamentos', e.target.value)} /></div>
                        </>
                    )}
                </div>
            </div>

            {/* Histórico Familiar */}
            <div className="prontuario-card">
                <h2 className="card-title">Histórico Familiar</h2>
                <div className="card-content">
                    {!isEditing ? (
                        <>
                            <div className="data-row"><span className="data-label">Possui Câncer na Família:</span> {paciente.historicoFamiliar?.possuiCancer || 'Não informado'}</div>
                            <div className="data-row"><span className="data-label">Tipo de Câncer:</span> {paciente.historicoFamiliar?.tipoCancer || 'Não informado'}</div>
                        </>
                    ) : (
                        <>
                            <div className="data-row-edit"><label className="data-label">Possui Câncer na Família:</label><input type="text" className="data-input" value={paciente.historicoFamiliar?.possuiCancer || ''} onChange={e => handleFieldChange('historicoFamiliar', 'possuiCancer', e.target.value)} /></div>
                            <div className="data-row-edit"><label className="data-label">Tipo de Câncer:</label><input type="text" className="data-input" value={paciente.historicoFamiliar?.tipoCancer || ''} onChange={e => handleFieldChange('historicoFamiliar', 'tipoCancer', e.target.value)} /></div>
                        </>
                    )}
                </div>
            </div>
        </main>
    );
};

export default Prontuario;