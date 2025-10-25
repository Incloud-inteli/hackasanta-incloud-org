import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import pacienteService from '../../../services/pacienteService';
import prontuarioService from '../../../services/prontuarioService';
import { supabase } from '../../../services/supabaseClient';
import './FichaCadastro.css';

// Estrutura inicial e completa do nosso formulário, refletindo o banco
const initialState = {
    userId: null,
    formType: 'euMesmo',
    parentesco: '',
    dadosPessoais: {
        nomeCompleto: '',
        dataNascimento: '',
        cpf: '',
        email: '',
        telefone: '',
        genero: '',
        endereco: '',
        estadoCivil: '',
        raca: '',
        profissao: '',
        tipoSanguineo: ''
    },
    historicoMedico: { historicoSaude: '', cirurgias: '', alergias: '', internacoes: '', doencasCronicas: '', problemasNascimento: '', medicamentos: '', tratamentos: '' },
    historicoFamiliar: { possuiCancer: '', tipoCancer: '' },
    contatosEmergencia: [{ id: 1, nome: '', telefone: '' }],
};

const FichaCadastro = () => {
    const navigate = useNavigate();
    const [pacienteId, setPacienteId] = useState(null);
    // ÚNICO ESTADO PARA O FORMULÁRIO INTEIRO
    const [formData, setFormData] = useState(initialState);

    useEffect(() => {
        const carregarFichaDoUsuarioLogado = async () => {
            try {
                const { data: { session } } = await supabase.auth.getSession();
                if (!session) {
                    navigate('/login');
                    return;
                }
                const user = session.user;
                
                const pacientes = await pacienteService.getByUserId(user.id);
                const paciente = pacientes && pacientes.length > 0 ? pacientes[0] : null;

                if (paciente) {
                    setPacienteId(paciente._id);
                    // Preenche o formulário garantindo que todas as chaves existam
                    setFormData(prev => ({
                        ...initialState,
                        ...prev,
                        ...paciente,
                        userId: user.id, // Garante que o userId está atualizado
                        dadosPessoais: {
                            ...initialState.dadosPessoais,
                            ...(paciente.dadosPessoais || {}),
                            dataNascimento: paciente.dadosPessoais?.dataNascimento ? new Date(paciente.dadosPessoais.dataNascimento).toISOString().split('T')[0] : '',
                        }
                    }));
                } else {
                    // Prepara um formulário em branco para um novo usuário
                    setFormData({ ...initialState, userId: user.id });
                }
            } catch (error) {
                if (error.response?.status === 404) {
                    const { data: { user } } = await supabase.auth.getSession();
                    setFormData({ ...initialState, userId: user?.id }); // Garante o userId mesmo para novos
                } else {
                    console.error('Erro ao carregar dados do paciente:', error);
                }
            }
        };
        carregarFichaDoUsuarioLogado();
    }, [navigate]);

    const handleChange = (section, field, value) => {
        setFormData(prev => ({
            ...prev,
            [section]: {
                ...prev[section],
                [field]: value
            }
        }));
    };

    const handleContatoChange = (id, field, value) => {
        const updatedContatos = formData.contatosEmergencia.map(contato =>
            contato.id === id ? { ...contato, [field]: value } : contato
        );
        setFormData(prev => ({ ...prev, contatosEmergencia: updatedContatos }));
    };
    
    const handleSave = async () => {
        try {
            // Garante que o userId está presente
            let userId = formData.userId;
            if (!userId) {
                // Tenta recuperar do localStorage
                userId = localStorage.getItem('userId');
            }
            if (!userId) throw new Error("ID de autenticação não encontrado!");

            const dadosParaSalvar = { ...formData, userId };
            // Limpa o objeto de campos temporários do frontend
            delete dadosParaSalvar._id; 
            dadosParaSalvar.contatosEmergencia = dadosParaSalvar.contatosEmergencia.map(({id, ...rest}) => rest); // Remove o 'id' temporário

            if (pacienteId) {
                await pacienteService.update(pacienteId, dadosParaSalvar);
            } else {
                const result = await pacienteService.create(dadosParaSalvar);
                // Cria prontuário apenas na criação do paciente
                await prontuarioService.create({ pacienteId: result.insertedId });
            }

            alert('Ficha médica salva com sucesso!');
            navigate('/prontuario');
        } catch (error) {
            console.error('Erro ao salvar ficha:', error);
            alert('Erro ao salvar ficha. Veja o console para detalhes.');
        }
    };
    
    // Suas outras funções (adicionar/remover contato) aqui, adaptadas para o formData
    const adicionarContato = () => { /* ... */ };
    const removerContato = (id) => { /* ... */ };

    return (
        <main className="ficha-page">
            <h1 className="ficha-title">Ficha de cadastro</h1>

            {/* Quem é você */}
            <div className="who-are-you-section">
                <h2 className="section-subtitle">Quem é você?</h2>
                <div className="who-buttons">
                    <button className={`who-btn ${formData.formType === 'euMesmo' ? 'active' : ''}`} onClick={() => setFormData({...formData, formType: 'euMesmo'})}>Eu mesmo</button>
                    <button className={`who-btn ${formData.formType === 'familiar' ? 'active' : ''}`} onClick={() => setFormData({...formData, formType: 'familiar'})}>Familiar</button>
                </div>
                {formData.formType === 'familiar' && (
                    <div className="parentesco-dropdown">
                        <label className="form-label">Qual o parentesco? *</label>
                        <select className="form-select" value={formData.parentesco} onChange={(e) => setFormData({...formData, parentesco: e.target.value})}>
                            <option value="">Selecione o parentesco</option>
                            <option value="pai">Pai</option>
                            <option value="mae">Mãe</option>
                            <option value="filho">Filho(a)</option>
                            <option value="irmao">Irmão(ã)</option>
                            <option value="conjuge">Cônjuge</option>
                            <option value="avo">Avô/Avó</option>
                            <option value="neto">Neto(a)</option>
                            <option value="tio">Tio(a)</option>
                            <option value="sobrinho">Sobrinho(a)</option>
                            <option value="primo">Primo(a)</option>
                            <option value="outro">Outro</option>
                        </select>
                    </div>
                )}
            </div>
            
            {/* Dados Pessoais (Unificado) */}
            <div className="form-card">
                <h2 className="card-section-title">Dados Pessoais do Paciente</h2>
                <div className="form-grid">
                    {Object.keys(formData.dadosPessoais).map((campo) => (
                        <div className="form-field" key={campo}>
                            <label className="form-label">{campo.charAt(0).toUpperCase() + campo.slice(1).replace(/([A-Z])/g, ' $1')}</label>
                            <input 
                                type={campo === 'dataNascimento' ? 'date' : campo === 'email' ? 'email' : 'text'}
                                className="form-input" 
                                value={formData.dadosPessoais[campo]} 
                                onChange={(e) => handleChange('dadosPessoais', campo, e.target.value)} 
                            />
                        </div>
                    ))}
                </div>
            </div>

            {/* Histórico Médico */}
            <div className="form-card">
                <h2 className="card-section-title">Histórico Médico</h2>
                <div className="form-grid-single">
                    {Object.keys(formData.historicoMedico).map((campo) => (
                        <div className="form-field" key={campo}>
                            <label className="form-label">{campo.charAt(0).toUpperCase() + campo.slice(1).replace(/([A-Z])/g, ' $1')}</label>
                            <input type="text" className="form-input" value={formData.historicoMedico[campo]} onChange={(e) => handleChange('historicoMedico', campo, e.target.value)} />
                        </div>
                    ))}
                </div>
            </div>

            {/* Histórico Familiar */}
            <div className="form-card form-card-compact">
                <h2 className="card-section-title">Histórico Familiar</h2>
                <div className="form-grid-single">
                    {Object.keys(formData.historicoFamiliar).map((campo) => (
                        <div className="form-field" key={campo}>
                            <label className="form-label">{campo.charAt(0).toUpperCase() + campo.slice(1).replace(/([A-Z])/g, ' $1')}</label>
                            <input type="text" className="form-input" value={formData.historicoFamiliar[campo]} onChange={(e) => handleChange('historicoFamiliar', campo, e.target.value)} />
                        </div>
                    ))}
                </div>
            </div>

            {/* Contatos de Emergência */}
            <div className="form-card form-card-compact">
                <h2 className="card-section-title">Contatos de emergência</h2>
                {formData.contatosEmergencia.map((contato) => (
                    <div key={contato.id} className="contact-group">
                        <div className="form-field">
                            <label className="form-label">Nome *</label>
                            <input type="text" className="form-input" value={contato.nome} onChange={(e) => handleContatoChange(contato.id, 'nome', e.target.value)} />
                        </div>
                        <div className="form-field">
                            <label className="form-label">Telefone *</label>
                            <input type="text" className="form-input" value={contato.telefone} onChange={(e) => handleContatoChange(contato.id, 'telefone', e.target.value)} />
                        </div>
                        <button className="btn-remove" onClick={() => removerContato(contato.id)}>Remover</button>
                    </div>
                ))}
                <button className="btn-add" onClick={adicionarContato}>Adicionar contato</button>
            </div>

            <div className="form-actions">
                <button className="btn-save" onClick={handleSave}>Salvar Ficha Médica</button>
            </div>
        </main>
    );
};

export default FichaCadastro;