const { supabase } = require('./supabaseClient');

async function criarOuAtualizarProntuario(pacienteId, dadosPaciente) {
    try {
        // Gerar resumo detalhado
        const resumoGeralSaude = gerarResumoGeralSaude(dadosPaciente);
        
        // Criar ou atualizar prontuário
        const { data, error } = await supabase
            .from('prontuarios')
            .upsert({
                ID_Paciente: pacienteId,
                ResumoGeralSaude: resumoGeralSaude,
                DataUltimaAtualizacao: new Date().toISOString()
            });

        if (error) {
            console.error('Erro ao criar/atualizar prontuário:', error);
            throw error;
        }

        return data;
    } catch (error) {
        console.error('Erro no serviço de prontuário:', error);
        throw error;
    }
}

function gerarResumoGeralSaude(pacienteData) {
    const alertas = [];
    const resumos = [];
    const dadosPessoais = pacienteData.dadosPessoais || {};
    const historicoMedico = pacienteData.historicoMedico || {};
    const historicoFamiliar = pacienteData.historicoFamiliar || {};

    // Informações básicas
    resumos.push(`Paciente: ${dadosPessoais.nomeCompleto || 'Nome não informado'}`);
    
    if (dadosPessoais.dataNascimento) {
        const idade = calcularIdade(dadosPessoais.dataNascimento);
        resumos.push(`Idade: ${idade} anos`);
    }

    // Tipo Sanguíneo (ALERTA IMPORTANTE)
    if (dadosPessoais.tipoSanguineo) {
        alertas.push(`⚠️ TIPO SANGUÍNEO: ${dadosPessoais.tipoSanguineo.toUpperCase()}`);
    }

    // Alergias (ALERTA CRÍTICO)
    if (historicoMedico.alergias && historicoMedico.alergias !== 'nenhum') {
        alertas.push(`🚨 ALERGIAS: ${historicoMedico.alergias}${historicoMedico.alergiasOutro ? ` - ${historicoMedico.alergiasOutro}` : ''}`);
    }

    // Doenças Crônicas (ALERTA IMPORTANTE)
    if (historicoMedico.doencasCronicas && historicoMedico.doencasCronicas !== 'nenhum') {
        alertas.push(`⚠️ DOENÇAS CRÔNICAS: ${historicoMedico.doencasCronicas}${historicoMedico.doencasCronicasOutro ? ` - ${historicoMedico.doencasCronicasOutro}` : ''}`);
    }

    // Medicamentos em uso (ALERTA IMPORTANTE)
    if (historicoMedico.medicamentos && historicoMedico.medicamentos !== 'nenhum') {
        alertas.push(`⚠️ MEDICAMENTOS: ${historicoMedico.medicamentos}${historicoMedico.medicamentosOutro ? ` - ${historicoMedico.medicamentosOutro}` : ''}`);
    }

    // Histórico de cirurgias
    if (historicoMedico.cirurgias === 'sim') {
        resumos.push('Possui histórico de cirurgias');
    }

    // Histórico de internações
    if (historicoMedico.internacoes === 'sim') {
        resumos.push('Possui histórico de internações');
    }

    // Problemas no nascimento
    if (historicoMedico.problemasNascimento && historicoMedico.problemasNascimento !== 'nenhum') {
        resumos.push(`Problemas no nascimento: ${historicoMedico.problemasNascimento}${historicoMedico.problemasNascimentoOutro ? ` - ${historicoMedico.problemasNascimentoOutro}` : ''}`);
    }

    // Tratamentos em andamento
    if (historicoMedico.tratamentos && historicoMedico.tratamentos !== 'nenhum') {
        resumos.push(`Em tratamento: ${historicoMedico.tratamentos}${historicoMedico.tratamentosOutro ? ` - ${historicoMedico.tratamentosOutro}` : ''}`);
    }

    // Histórico familiar de câncer (ALERTA)
    if (historicoFamiliar.possuiCancer === 'sim') {
        alertas.push(`⚠️ HISTÓRICO FAMILIAR DE CÂNCER: ${historicoFamiliar.tipoCancer || 'Tipo não especificado'}${historicoFamiliar.tipoCancerOutro ? ` - ${historicoFamiliar.tipoCancerOutro}` : ''}`);
    }

    // Contatos de emergência
    if (pacienteData.contatosEmergencia && pacienteData.contatosEmergencia.length > 0) {
        const contatosEmergencia = pacienteData.contatosEmergencia.map(contato => 
            `${contato.nome}: ${contato.telefone}`
        );
        alertas.push(`📞 CONTATOS DE EMERGÊNCIA:\n${contatosEmergencia.join('\n')}`);
    }

    // Histórico geral de saúde
    if (historicoMedico.historicoSaude) {
        resumos.push(`Histórico de saúde: ${historicoMedico.historicoSaude}`);
    }

    // Monta o resumo final
    return `=== ALERTAS IMPORTANTES ===\n${alertas.join('\n')}\n\n=== RESUMO GERAL ===\n${resumos.join('\n')}`;
}

function calcularIdade(dataNascimento) {
    const hoje = new Date();
    const nascimento = new Date(dataNascimento);
    let idade = hoje.getFullYear() - nascimento.getFullYear();
    const mesAtual = hoje.getMonth();
    const mesNascimento = nascimento.getMonth();
    
    if (mesAtual < mesNascimento || (mesAtual === mesNascimento && hoje.getDate() < nascimento.getDate())) {
        idade--;
    }
    
    return idade;
}

module.exports = {
    criarOuAtualizarProntuario
};