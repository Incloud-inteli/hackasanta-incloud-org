// back/seed.js
const { MongoClient, ObjectId } = require('mongodb');
require('dotenv').config();

const NUM_PACIENTES = 50;
const NUM_ATENDIMENTOS_POR_PACIENTE = 5;

function randomDate(start, end) { 
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime())); 
}

function randomChoice(arr) { 
  return arr[Math.floor(Math.random() * arr.length)]; 
}

function gerarCpf() {
  const num = Array.from({ length: 9 }, () => Math.floor(Math.random() * 10));
  let d1 = num.map((v, i) => v * (10 - i)).reduce((acc, v) => acc + v, 0) % 11;
  d1 = d1 < 2 ? 0 : 11 - d1;
  let d2 = num.concat(d1).map((v, i) => v * (11 - i)).reduce((acc, v) => acc + v, 0) % 11;
  d2 = d2 < 2 ? 0 : 11 - d2;
  const cpfArray = num.concat(d1, d2);
  return `${cpfArray.slice(0,3).join('')}.${cpfArray.slice(3,6).join('')}.${cpfArray.slice(6,9).join('')}-${cpfArray.slice(9,11).join('')}`;
}

const nomesMasculinos = ["José","Antônio","João","Francisco","Carlos"];
const nomesFemininos = ["Maria","Ana","Francisca","Antônia","Adriana"];
const sobrenomes = ["Silva","Santos","Oliveira","Souza","Rodrigues"];
function gerarNomeCompleto() {
  const nomes = Math.random() > 0.5 ? nomesMasculinos : nomesFemininos;
  return `${randomChoice(nomes)} ${randomChoice(sobrenomes)} ${randomChoice(sobrenomes)}`;
}

async function seedDB() {
  const client = new MongoClient(process.env.MONGO_URI);

  try {
    await client.connect();
    const db = client.db('previvai');
    console.log("✅ Conectado ao DB 'previvai'");

    // --- Limpeza ---
    const colecoes = ['profissionais','responsaveis','pacientes','atendimentos','alertas','transcritores'];
    for (const c of colecoes) await db.collection(c).deleteMany({});
    console.log("🗑️ Coleções limpas");

    // --- Profissionais ---
    const profissionais = [
      { _id: new ObjectId(), nomeCompleto: "Ana Souza", especialidade: "Enfermeira", registroProfissional: "COREN-SP 123456" },
      { _id: new ObjectId(), nomeCompleto: "Beatriz Lima", especialidade: "Assistente Social", registroProfissional: "CRESS-SP 654321" },
      { _id: new ObjectId(), nomeCompleto: "Lucas Mendes", especialidade: "Técnico de Enfermagem", registroProfissional: "COREN-SP 789012" }
    ];
    await db.collection('profissionais').insertMany(profissionais);

    // --- Responsáveis ---
    const responsaveis = Array.from({ length: 15 }).map(() => ({
      _id: new ObjectId(),
      nomeCompleto: gerarNomeCompleto(),
      telefoneContato: `+55${Math.floor(1000000000 + Math.random() * 9000000000)}`,
      email: `${Math.random().toString(36).slice(2,8)}@example.com`
    }));
    await db.collection('responsaveis').insertMany(responsaveis);

    // --- Pacientes ---
    const parentescos = ["Filho(a)","Neto(a)","Cuidador(a)"];
    const pacientes = Array.from({ length: NUM_PACIENTES }).map(() => {
      const resp = randomChoice(responsaveis);
      const pacienteId = new ObjectId();
      return {
        _id: pacienteId,
        nomeCompleto: gerarNomeCompleto(),
        dataNascimento: randomDate(new Date(1935,0,1), new Date(1965,0,1)),
        cpf: gerarCpf(),
        dataCadastro: randomDate(new Date(2024,0,1), new Date()),
        responsaveis: [{ responsavelId: resp._id, parentesco: randomChoice(parentescos) }],
        prontuario: {
          resumoGeralSaude: randomChoice(["Estável","Hipertenso","Diabético"]),
          dataUltimaAtualizacao: new Date(),
        }
      };
    });
    await db.collection('pacientes').insertMany(pacientes);

    // --- Atendimentos ---
    const tiposAtendimento = ["WhatsApp","Chamada de Voz","Visita Domiciliar"];
    const atendimentos = [];
    const transcritores = [];
    const alertas = [];

    for (const paciente of pacientes) {
      const qtd = Math.floor(Math.random() * NUM_ATENDIMENTOS_POR_PACIENTE) + 1;
      for (let i=0;i<qtd;i++) {
        const status = Math.random() > 0.15 ? "Realizado":"Agendado";
        const dataHora = randomDate(new Date(paciente.dataCadastro), new Date());
        const atendimentoId = new ObjectId();

        const atendimento = {
          _id: atendimentoId,
          pacienteId: paciente._id,
          profissionalId: randomChoice(profissionais)._id,
          dataHoraAgendamento: dataHora,
          status,
          tipo: randomChoice(tiposAtendimento)
        };
        atendimentos.push(atendimento);

        if(status==="Realizado") {
          const transcricao = {
            _id: new ObjectId(),
            ID_Atendimento: atendimentoId,
            Conteudo: randomChoice(["Paciente bem.","Monitoramento feito.","Relatou cansaço."]),
            DataHoraRegistro: new Date(dataHora.getTime()+5*60000),
            Tipo: randomChoice(["consulta","exame","observacao"]),
            ID_Profissional: atendimento.profissionalId
          };
          transcritores.push(transcricao);

          if(Math.random()<0.2) {
            alertas.push({
              _id: new ObjectId(),
              pacienteId: paciente._id,
              atendimentoId: atendimentoId,
              motivo: randomChoice(["Alteração no humor.","Aumento de pressão."]),
              nivelRisco: randomChoice(["Baixo","Médio","Alto"]),
              status: "Pendente",
              dataHoraGeracao: new Date(dataHora.getTime()+10*60000)
            });
          }
        }
      }
    }

    await db.collection('atendimentos').insertMany(atendimentos);
    await db.collection('transcritores').insertMany(transcritores);
    await db.collection('alertas').insertMany(alertas);

    console.log("🎉 Seed finalizado!");
    console.log(`Pacientes: ${pacientes.length}, Atendimentos: ${atendimentos.length}, Transcrições: ${transcritores.length}, Alertas: ${alertas.length}`);

  } catch(err) {
    console.error("❌ Erro no seed:", err);
  } finally {
    await client.close();
    console.log("🔒 Conexão encerrada.");
  }
}

seedDB();