import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import pacienteService from '../../../services/pacienteService';
import { supabase } from '../../../services/supabaseClient';
import './FichaCadastro.css';

// Estrutura inicial e completa do nosso formulário, refletindo o banco
const initialState = {
    usuario_id: null,
    formType: 'euMesmo',
    parentesco: '',
    dadosPessoais: {
        nomeCompleto: '',
        dataNascimento: '',
        cpf: '',
        email: '',
        telefone: '',
        genero: '',
        cep: '',
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
        const [emailError, setEmailError] = useState('');

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
                    setFormData(prev => ({
                        ...initialState,
                        ...prev,
                        ...paciente,
                        usuario_id: user.id, // Garante que o usuario_id está atualizado
                        dadosPessoais: {
                            ...initialState.dadosPessoais,
                            ...(paciente.dadosPessoais || {}),
                            dataNascimento: paciente.dadosPessoais?.dataNascimento ? new Date(paciente.dadosPessoais.dataNascimento).toISOString().split('T')[0] : '',
                        }
                    }));
                } else {
                    setFormData({ ...initialState, usuario_id: user.id });
                }
            } catch (error) {
                if (error.response?.status === 404) {
                    const { data: { user } } = await supabase.auth.getSession();
                    setFormData({ ...initialState, usuario_id: user?.id }); // Garante o usuario_id mesmo para novos
                } else {
                    console.error('Erro ao carregar dados do paciente:', error);
                }
            }
        };
        carregarFichaDoUsuarioLogado();
    }, [navigate]);


    // Limita o CPF a 11 dígitos numéricos
    const limitarCPF = (cpf) => {
        return cpf.replace(/\D/g, '').slice(0, 11);
    };

    const handleChange = (section, field, value) => {
        // Limita o CPF a 11 dígitos numéricos
        if (section === 'dadosPessoais' && field === 'cpf') {
            value = limitarCPF(value);
        }
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
            let usuario_id = formData.usuario_id;
            if (!usuario_id) {
                usuario_id = localStorage.getItem('userId');
            }
            if (!usuario_id) throw new Error("ID de autenticação não encontrado!");

            // Validação: dataNascimento obrigatória
            const dataNascimento = formData.dadosPessoais?.dataNascimento;
            if (!dataNascimento) {
                alert('Por favor, preencha a data de nascimento.');
                return;
            }


            // Monta objeto aninhado conforme esperado pelo backend
            const dadosParaSalvar = {
                usuario_id,
                dadosPessoais: formData.dadosPessoais || {},
                historicoMedico: formData.historicoMedico || {},
                historicoFamiliar: formData.historicoFamiliar || {},
                dadosContato: formData.dadosContato || {},
                dadosEndereco: formData.dadosEndereco || {},
                contatosEmergencia: (formData.contatosEmergencia || []).map(({id, ...rest}) => rest),
                formType: formData.formType,
                parentesco: formData.parentesco,
                // Adicione outros campos aninhados conforme necessário
            };

            if (pacienteId) {
                await pacienteService.update(pacienteId, dadosParaSalvar);
            } else {
                const result = await pacienteService.create(dadosParaSalvar);
            }

            alert('Ficha médica salva com sucesso!');
            navigate('/prontuario');
        } catch (error) {
            console.error('Erro ao salvar ficha:', error);
            console.error('Erro completo:', error.response);
            alert('Erro ao salvar ficha. Veja o console para detalhes.');
        }
    };
    
    // Suas outras funções (adicionar/remover contato) aqui, adaptadas para o formData
    const adicionarContato = () => {
        setFormData(prev => ({
            ...prev,
            contatosEmergencia: [
                ...prev.contatosEmergencia,
                { id: Date.now(), nome: '', telefone: '' }
            ]
        }));
    };
    const removerContato = (id) => {
        setFormData(prev => ({
            ...prev,
            contatosEmergencia: prev.contatosEmergencia.filter(contato => contato.id !== id)
        }));
    };

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
            
            {/* Dados Pessoais (Formatado e com selects) */}
            <div className="form-card">
                <h2 className="card-section-title">Dados Pessoais do Paciente</h2>
                <div className="form-grid">
                    {/* Nome Completo */}
                    <div className="form-field">
                        <label className="form-label">Nome Completo</label>
                        <input type="text" className="form-input" value={formData.dadosPessoais.nomeCompleto} onChange={e => handleChange('dadosPessoais', 'nomeCompleto', e.target.value)} />
                    </div>
                    {/* Data de Nascimento */}
                    <div className="form-field">
                        <label className="form-label">Data de Nascimento</label>
                        <input type="date" className="form-input" value={formData.dadosPessoais.dataNascimento} onChange={e => handleChange('dadosPessoais', 'dataNascimento', e.target.value)} />
                    </div>
                    {/* Email */}
                    <div className="form-field">
                        <label className="form-label">Email</label>
                        <input
                            type="email"
                            className={`form-input${emailError ? ' input-error' : ''}`}
                            value={formData.dadosPessoais.email}
                            onChange={e => {
                                handleChange('dadosPessoais', 'email', e.target.value);
                                if (emailError) setEmailError('');
                            }}
                            onBlur={e => {
                                if (e.target.value && !e.target.value.includes('@')) {
                                    setEmailError('O email deve conter o caractere @');
                                } else {
                                    setEmailError('');
                                }
                            }}
                            required
                        />
                        {emailError && <span style={{ color: '#b91c1c', fontSize: '0.95rem', marginTop: '0.25rem' }}>{emailError}</span>}
                    </div>
                    {/* Telefone */}
                    <div className="form-field">
                        <label className="form-label">Telefone</label>
                        <input type="text" className="form-input" value={formData.dadosPessoais.telefone} onChange={e => handleChange('dadosPessoais', 'telefone', e.target.value)} />
                    </div>
                    {/* Estado Civil */}
                    <div className="form-field">
                        <label className="form-label">Estado Civil</label>
                        <select className="form-select" value={formData.dadosPessoais.estadoCivil} onChange={e => handleChange('dadosPessoais', 'estadoCivil', e.target.value)}>
                            <option value="">Selecione</option>
                            <option value="solteira">Solteira(o)</option>
                            <option value="casada">Casada(o)</option>
                            <option value="divorciada">Divorciada(o)</option>
                            <option value="viuva">Viúva(o)</option>
                            <option value="outro">Outro</option>
                        </select>
                        {formData.dadosPessoais.estadoCivil === 'outro' && (
                            <input type="text" className="form-input" placeholder="Informe o estado civil" value={formData.dadosPessoais.estadoCivilOutro || ''} onChange={e => handleChange('dadosPessoais', 'estadoCivilOutro', e.target.value)} />
                        )}
                    </div>
                    {/* Raça */}
                    <div className="form-field">
                        <label className="form-label">Raça</label>
                        <select className="form-select" value={formData.dadosPessoais.raca} onChange={e => handleChange('dadosPessoais', 'raca', e.target.value)}>
                            <option value="">Selecione</option>
                            <option value="branca">Branca</option>
                            <option value="preta">Preta</option>
                            <option value="parda">Parda</option>
                            <option value="amarela">Amarela</option>
                            <option value="indigena">Indígena</option>
                            <option value="outro">Outro</option>
                        </select>
                        {formData.dadosPessoais.raca === 'outro' && (
                            <input type="text" className="form-input" placeholder="Informe a raça" value={formData.dadosPessoais.racaOutro || ''} onChange={e => handleChange('dadosPessoais', 'racaOutro', e.target.value)} />
                        )}
                    </div>
                    {/* Profissão */}
                    <div className="form-field">
                        <label className="form-label">Profissão</label>
                        <input type="text" className="form-input" value={formData.dadosPessoais.profissao} onChange={e => handleChange('dadosPessoais', 'profissao', e.target.value)} />
                    </div>
                    {/* CEP */}
                    <div className="form-field">
                        <label className="form-label">CEP</label>
                        <input 
                            type="text" 
                            className="form-input" 
                            value={formData.dadosPessoais.cep} 
                            onChange={e => {
                                const valor = e.target.value.replace(/\D/g, '');
                                if (valor.length <= 8) {
                                    const cepFormatado = valor.length > 5 
                                        ? `${valor.slice(0, 5)}-${valor.slice(5)}`
                                        : valor;
                                    handleChange('dadosPessoais', 'cep', cepFormatado);
                                }
                            }}
                            placeholder="00000-000"
                            maxLength="9"
                        />
                    </div>
                    {/* Tipo Sanguíneo */}
                    <div className="form-field">
                        <label className="form-label">Tipo Sanguíneo</label>
                        <select className="form-select" value={formData.dadosPessoais.tipoSanguineo} onChange={e => handleChange('dadosPessoais', 'tipoSanguineo', e.target.value)}>
                            <option value="">Selecione</option>
                            <option value="a">A</option>
                            <option value="b">B</option>
                            <option value="ab">AB</option>
                            <option value="o">O</option>
                            <option value="outro">Outro</option>
                        </select>
                        {formData.dadosPessoais.tipoSanguineo === 'outro' && (
                            <input type="text" className="form-input" placeholder="Informe o tipo sanguíneo" value={formData.dadosPessoais.tipoSanguineoOutro || ''} onChange={e => handleChange('dadosPessoais', 'tipoSanguineoOutro', e.target.value)} />
                        )}
                    </div>
                </div>
            </div>


            {/* Histórico Médico */}
            <div className="form-card">
                <h2 className="card-section-title">Histórico Médico</h2>
                <div className="form-grid-single">
                    {/* Alergias */}
                    <div className="form-field">
                        <label className="form-label">Alergias</label>
                        <select className="form-select" value={formData.historicoMedico.alergias} onChange={e => handleChange('historicoMedico', 'alergias', e.target.value)}>
                            <option value="">Selecione</option>
                            <option value="nenhum">Nenhum</option>
                            <option value="medicamentos">Medicamentos</option>
                            <option value="alimentos">Alimentos</option>
                            <option value="outro">Outro</option>
                        </select>
                        {formData.historicoMedico.alergias === 'outro' && (
                            <input type="text" className="form-input" placeholder="Informe a alergia" value={formData.historicoMedico.alergiasOutro || ''} onChange={e => handleChange('historicoMedico', 'alergiasOutro', e.target.value)} />
                        )}
                    </div>
                    {/* Cirurgias */}
                    <div className="form-field">
                        <label className="form-label">Cirurgias</label>
                        <select className="form-select" value={formData.historicoMedico.cirurgias} onChange={e => handleChange('historicoMedico', 'cirurgias', e.target.value)}>
                            <option value="">Selecione</option>
                            <option value="nenhum">Nenhuma</option>
                            <option value="sim">Sim</option>
                        </select>
                    </div>
                    {/* Internações */}
                    <div className="form-field">
                        <label className="form-label">Internações</label>
                        <select className="form-select" value={formData.historicoMedico.internacoes} onChange={e => handleChange('historicoMedico', 'internacoes', e.target.value)}>
                            <option value="">Selecione</option>
                            <option value="nenhum">Nenhuma</option>
                            <option value="sim">Sim</option>
                        </select>
                    </div>
                    {/* Doenças Crônicas */}
                    <div className="form-field">
                        <label className="form-label">Doenças Crônicas</label>
                        <select className="form-select" value={formData.historicoMedico.doencasCronicas} onChange={e => handleChange('historicoMedico', 'doencasCronicas', e.target.value)}>
                            <option value="">Selecione</option>
                            <option value="nenhum">Nenhuma</option>
                            <option value="diabetes">Diabetes</option>
                            <option value="hipertensao">Hipertensão</option>
                            <option value="cardiopatia">Cardiopatia</option>
                            <option value="outro">Outro</option>
                        </select>
                        {formData.historicoMedico.doencasCronicas === 'outro' && (
                            <input type="text" className="form-input" placeholder="Informe a doença crônica" value={formData.historicoMedico.doencasCronicasOutro || ''} onChange={e => handleChange('historicoMedico', 'doencasCronicasOutro', e.target.value)} />
                        )}
                    </div>
                    {/* Problemas no Nascimento */}
                    <div className="form-field">
                        <label className="form-label">Problemas no Nascimento</label>
                        <select className="form-select" value={formData.historicoMedico.problemasNascimento} onChange={e => handleChange('historicoMedico', 'problemasNascimento', e.target.value)}>
                            <option value="">Selecione</option>
                            <option value="nenhum">Nenhum</option>
                            <option value="prematuro">Prematuro</option>
                            <option value="baixoPeso">Baixo peso</option>
                            <option value="outro">Outro</option>
                        </select>
                        {formData.historicoMedico.problemasNascimento === 'outro' && (
                            <input type="text" className="form-input" placeholder="Informe o problema" value={formData.historicoMedico.problemasNascimentoOutro || ''} onChange={e => handleChange('historicoMedico', 'problemasNascimentoOutro', e.target.value)} />
                        )}
                    </div>
                    {/* Medicamentos */}
                    <div className="form-field">
                        <label className="form-label">Medicamentos</label>
                        <select className="form-select" value={formData.historicoMedico.medicamentos} onChange={e => handleChange('historicoMedico', 'medicamentos', e.target.value)}>
                            <option value="">Selecione</option>
                            <option value="nenhum">Nenhum</option>
                            <option value="usoContinuo">Uso contínuo</option>
                            <option value="eventual">Eventual</option>
                            <option value="outro">Outro</option>
                        </select>
                        {formData.historicoMedico.medicamentos === 'outro' && (
                            <input type="text" className="form-input" placeholder="Informe o medicamento" value={formData.historicoMedico.medicamentosOutro || ''} onChange={e => handleChange('historicoMedico', 'medicamentosOutro', e.target.value)} />
                        )}
                    </div>
                    {/* Tratamentos */}
                    <div className="form-field">
                        <label className="form-label">Tratamentos</label>
                        <select className="form-select" value={formData.historicoMedico.tratamentos} onChange={e => handleChange('historicoMedico', 'tratamentos', e.target.value)}>
                            <option value="">Selecione</option>
                            <option value="nenhum">Nenhum</option>
                            <option value="fisioterapia">Fisioterapia</option>
                            <option value="psicoterapia">Psicoterapia</option>
                            <option value="outro">Outro</option>
                        </select>
                        {formData.historicoMedico.tratamentos === 'outro' && (
                            <input type="text" className="form-input" placeholder="Informe o tratamento" value={formData.historicoMedico.tratamentosOutro || ''} onChange={e => handleChange('historicoMedico', 'tratamentosOutro', e.target.value)} />
                        )}
                    </div>
                    {/* Histórico de Saúde (campo livre) */}
                    <div className="form-field">
                        <label className="form-label">Histórico de Saúde</label>
                        <input type="text" className="form-input" value={formData.historicoMedico.historicoSaude} onChange={e => handleChange('historicoMedico', 'historicoSaude', e.target.value)} />
                    </div>
                </div>
            </div>

            {/* Histórico Familiar + Contatos de Emergência lado a lado */}
            <div className="two-column-grid">
                <div className="form-card form-card-compact">
                    <h2 className="card-section-title">Histórico Familiar</h2>
                    <div className="form-grid-single">
                        {/* Possui câncer na família? */}
                        <div className="form-field">
                            <label className="form-label">Possui câncer na família?</label>
                            <select className="form-select" value={formData.historicoFamiliar.possuiCancer} onChange={e => handleChange('historicoFamiliar', 'possuiCancer', e.target.value)}>
                                <option value="">Selecione</option>
                                <option value="sim">Sim</option>
                                <option value="nao">Não</option>
                            </select>
                        </div>
                        {/* Tipo de câncer */}
                        <div className="form-field">
                            <label className="form-label">Tipo de câncer</label>
                            <select className="form-select" value={formData.historicoFamiliar.tipoCancer} onChange={e => handleChange('historicoFamiliar', 'tipoCancer', e.target.value)}>
                                <option value="">Selecione</option>
                                <option value="nenhum">Nenhum</option>
                                <option value="mama">Mama</option>
                                <option value="prostata">Próstata</option>
                                <option value="pulmao">Pulmão</option>
                                <option value="pele">Pele</option>
                                <option value="outro">Outro</option>
                            </select>
                            {formData.historicoFamiliar.tipoCancer === 'outro' && (
                                <input type="text" className="form-input" placeholder="Informe o tipo de câncer" value={formData.historicoFamiliar.tipoCancerOutro || ''} onChange={e => handleChange('historicoFamiliar', 'tipoCancerOutro', e.target.value)} />
                            )}
                        </div>
                    </div>
                </div>
                <div className="form-card form-card-compact">
                    <h2 className="card-section-title">Contatos de emergência</h2>
                    {formData.contatosEmergencia.map((contato, idx) => (
                        <div key={contato.id} className="contact-group">
                            <div className="contact-header">
                                <span className="contact-number">Contato {idx + 1}</span>
                                {formData.contatosEmergencia.length > 1 && (
                                    <button type="button" className="btn-remove-contact" onClick={() => removerContato(contato.id)}>
                                        Remover
                                    </button>
                                )}
                            </div>
                            <div className="form-grid">
                                <div className="form-field">
                                    <label className="form-label">Nome *</label>
                                    <input type="text" className="form-input" value={contato.nome} onChange={e => handleContatoChange(contato.id, 'nome', e.target.value)} />
                                </div>
                                <div className="form-field">
                                    <label className="form-label">Telefone *</label>
                                    <input type="text" className="form-input" value={contato.telefone} onChange={e => handleContatoChange(contato.id, 'telefone', e.target.value)} />
                                </div>
                            </div>
                            {idx < formData.contatosEmergencia.length - 1 && <div className="contact-divider"></div>}
                        </div>
                    ))}
                    <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1rem' }}>
                        <button type="button" className="btn-add-contact" onClick={adicionarContato}>+ Adicionar contato</button>
                    </div>
                </div>
            </div>

            <div className="form-actions">
                <button className="btn-save" onClick={handleSave}>Salvar Ficha Médica</button>
            </div>
        </main>
    );
};

export default FichaCadastro;