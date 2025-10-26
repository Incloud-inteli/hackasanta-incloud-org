const { supabase } = require('../services/supabaseClient');

function createPacienteModel() {
  return {
    async create(pacienteData) {
      // Debug: logar valor recebido
      console.log('Recebido para criar paciente:', JSON.stringify(pacienteData, null, 2));
      let dataNascimento = pacienteData.dadosPessoais?.dataNascimento;
      if (typeof dataNascimento === 'string' && dataNascimento.trim() === '') {
        dataNascimento = null;
      }
      const novoPaciente = {
        usuario_id: pacienteData.usuario_id,
        nome_completo: pacienteData.dadosPessoais?.nomeCompleto || '',
        data_nascimento: dataNascimento || '1900-01-01', // Data padrão se não fornecida
        cpf: pacienteData.dadosPessoais?.cpf || '000.000.000-00', // CPF padrão se não fornecido
        email: pacienteData.dadosPessoais?.email || '',
        telefone_contato: pacienteData.dadosPessoais?.telefone || '',
        dados_pessoais: pacienteData.dadosPessoais || {},
        historico_medico: pacienteData.historicoMedico || {},
        historico_familiar: pacienteData.historicoFamiliar || {},
        form_type: pacienteData.formType || 'euMesmo',
        parentesco: pacienteData.parentesco || null
      };

      console.log('Dados a serem inseridos:', JSON.stringify(novoPaciente, null, 2));
      
      const { data, error } = await supabase
        .from('pacientes')
        .insert([novoPaciente])
        .select()
        .single();

      if (error) {
        console.error('Erro detalhado ao inserir paciente:', error);
        
        // Se o erro for de usuário já existente, atualiza o paciente existente
        if (error.code === '23505' && error.message.includes('usuario_id')) {
          console.log('Usuário já tem paciente cadastrado, atualizando...');
          const { data: updatedData, error: updateError } = await supabase
            .from('pacientes')
            .update(novoPaciente)
            .eq('usuario_id', novoPaciente.usuario_id)
            .select()
            .single();
            
          if (updateError) {
            console.error('Erro ao atualizar paciente existente:', updateError);
            throw updateError;
          }
          
          console.log('Paciente atualizado com sucesso:', updatedData);
          return { ...updatedData, _wasUpdated: true };
        }
        
        throw error;
      }
      
      console.log('Paciente criado com sucesso:', data);
      return data;
    },

    async getAll() {
      const { data, error } = await supabase
  .from('pacientes')
        .select('*');

      if (error) throw error;
      return data;
    },
    
    async findByAuthId(userId) {
      // Busca pacientes diretos (onde o usuário é o próprio paciente)
      const { data: pacienteDireto, error: errorPaciente } = await supabase
  .from('pacientes')
        .select('*')
  .eq('usuario_id', userId);

      if (errorPaciente) {
        console.error('Erro ao buscar paciente direto:', errorPaciente);
        throw errorPaciente;
      }

      // Busca pacientes onde o usuário é responsável
      const { data: responsaveis, error: errorResponsaveis } = await supabase
        .from('paciente_responsavel')
        .select(`
          *,
          pacientes (*)
        `)
  .eq('responsavel_id', userId);

      if (errorResponsaveis) {
        console.error('Erro ao buscar pacientes como responsável:', errorResponsaveis);
        throw errorResponsaveis;
      }

      // Debug: logar dados intermediários
      console.log('pacienteDireto:', pacienteDireto);
      console.log('responsaveis:', responsaveis);

      // Combina os resultados
      const pacientes = [
        ...(pacienteDireto || []),
        ...(responsaveis?.map(r => r.pacientes) || [])
      ];

      // Remove duplicatas
      const pacientesUnicos = [...new Map(pacientes.map(item => [item.ID_Paciente, item])).values()];
      console.log('pacientesUnicos:', pacientesUnicos);
      return pacientesUnicos;
    },

    async getById(id) {
      const { data, error } = await supabase
  .from('pacientes')
        .select('*')
        .eq('ID_Paciente', id)
        .single();

      if (error) throw error;
      return data;
    },

    async updateById(id, updateData) {
      // Atualiza os campos JSON principais
      // Extrai dados principais dos objetos aninhados
      const dadosPessoais = updateData.dadosPessoais || {};
      const historicoMedico = updateData.historicoMedico || {};
      const historicoFamiliar = updateData.historicoFamiliar || {};
      const formType = updateData.formType || null;
      const parentesco = updateData.parentesco || null;

      const { data, error } = await supabase
        .from('pacientes')
        .update({
          nome_completo: dadosPessoais.nomeCompleto || '',
          data_nascimento: dadosPessoais.dataNascimento || null,
          cpf: dadosPessoais.cpf || '',
          email: dadosPessoais.email || '',
          telefone_contato: dadosPessoais.telefone || '',
          cep: dadosPessoais.cep || '',
          dados_pessoais: dadosPessoais,
          historico_medico: historicoMedico,
          historico_familiar: historicoFamiliar,
          form_type: formType,
          parentesco: parentesco
        })
        .eq('id', id)
        .select();

      if (error) throw error;
      return data;
    },

    async deleteById(id) {
      const { error } = await supabase
  .from('pacientes')
        .delete()
        .eq('ID_Paciente', id);

      if (error) throw error;
      return { success: true };
    },
  };
}

module.exports = createPacienteModel;