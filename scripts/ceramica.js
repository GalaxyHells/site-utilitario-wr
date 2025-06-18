let metrosSelecionados = null;  // Variável para armazenar a quantidade de metros selecionados
let jaConvertidoParaMetros = false;
let unidadeAtual = 'metros'; // controle do estado atual

document.getElementById('toggleUnidade').addEventListener('click', function() {
  const btn = this;
  
  if (unidadeAtual === 'metros') {
    unidadeAtual = 'caixas';
    btn.innerHTML = '<i class="fas fa-sync"></i> Caixas';
  } else {
    unidadeAtual = 'metros';
    btn.innerHTML = '<i class="fas fa-sync"></i> Metros';
  }
  
  // Mantém o estado para usar na função de cálculo
  jaConvertidoParaMetros = false;
});

function selecionarCeramica(metrosPorCaixa) {
  let metrosDesejados = parseFloat(document.getElementById("metrosDesejados").value);
  const estaEmCaixas = unidadeAtual === 'caixas';

  if (isNaN(metrosDesejados) || metrosDesejados <= 0) {
    alert(`Digite a quantidade de ${estaEmCaixas ? 'caixas' : 'metros'} que o cliente deseja.`);
    return;
  }

  // Só converte se ainda não convertemos
  if (estaEmCaixas && !jaConvertidoParaMetros) {
    metrosDesejados = metrosDesejados * metrosPorCaixa;
    document.getElementById("metrosDesejados").value = metrosDesejados.toFixed(2);
    jaConvertidoParaMetros = true; // Marca que já converteu
  } else if (!estaEmCaixas) {
    jaConvertidoParaMetros = false; // Sempre reseta se estiver em modo metros
  }

  const caixasExatas = metrosDesejados / metrosPorCaixa;
  const caixasBaixo = Math.floor(caixasExatas);
  const caixasCima = Math.ceil(caixasExatas);

  const metrosBaixo = (caixasBaixo * metrosPorCaixa).toFixed(2).replace('.', ',');
  const metrosCima = (caixasCima * metrosPorCaixa).toFixed(2).replace('.', ',');

  document.getElementById("resultadoCeramica").style.display = "block";
  document.getElementById("caixasCalculadas").innerText = `Quantidade arredondada: ${caixasExatas.toFixed(2).replace('.', ',')} cx`;

  const container = document.querySelector("#resultadoCeramica div");
  container.innerHTML = ""; // limpa os botões antigos

  // Botão para menos caixas
  const botaoBaixo = document.createElement("button");
  botaoBaixo.classList.add("primary");
  botaoBaixo.id = "botaoParaBaixo";
  botaoBaixo.innerHTML = `${metrosBaixo} m²<br>(${caixasBaixo} cx)`;
  botaoBaixo.addEventListener("click", () => {
    metrosSelecionados = parseFloat(metrosBaixo.replace(',', '.'));  // Atualiza a variável com o valor selecionado (convertido para número)
    alternarBotao(botaoBaixo, botaoCima, metrosBaixo);
    calcularArgamassa(metrosSelecionados);  // Recalcula a argamassa com base no valor selecionado
  });
  container.appendChild(botaoBaixo);

  // Botão do meio fixo (referência)
  const botaoReferencia = document.createElement("button");
  botaoReferencia.classList.add("primary");
  botaoReferencia.style.backgroundColor = "#cccccc"; // cor neutra
  botaoReferencia.style.cursor = "default";
  const caixasExatasFormatado = caixasExatas.toFixed(2).replace('.', ',');
  botaoReferencia.innerHTML = `${metrosDesejados.toFixed(2).replace('.', ',')} m²<br>(${caixasExatasFormatado} cx)`;
  botaoReferencia.disabled = true; // desabilitar clique
  container.appendChild(botaoReferencia);

  // Botão para mais caixas
  const botaoCima = document.createElement("button");
  botaoCima.classList.add("primary");
  botaoCima.id = "botaoParaCima";
  botaoCima.innerHTML = `${metrosCima} m²<br>(${caixasCima} cx)`;
  botaoCima.addEventListener("click", () => {
    metrosSelecionados = parseFloat(metrosCima.replace(',', '.'));  // Atualiza a variável com o valor selecionado (convertido para número)
    alternarBotao(botaoCima, botaoBaixo, metrosCima);
    calcularArgamassa(metrosSelecionados);  // Recalcula a argamassa com base no valor selecionado
  });
  container.appendChild(botaoCima);

  // Marcar o botão selecionado dentro de #opcoesCeramica
  document.querySelectorAll("#opcoesCeramica button").forEach(btn => {
    btn.classList.remove("clicado");
  });
  const botaoClicado = Array.from(document.querySelectorAll("#opcoesCeramica button"))
    .find(btn => btn.innerText.includes(metrosPorCaixa.toString().replace('.', ',')));
  if (botaoClicado) botaoClicado.classList.add("clicado");

  calcularArgamassa(metrosDesejados);  // Chama o cálculo inicial

  // Mostra o título e as opções de argamassa
  document.getElementById('tituloArgamassa').style.display = 'block';
  document.getElementById('opcoesArgamassa').style.display = 'flex';

  // Mostra o título e as opções de rejunte
  document.getElementById('tituloRejunte').style.display = 'block';
  document.getElementById('opcoesRejunte').style.display = 'flex';
  calcularRejunte(metrosDesejados);
}

// Função para recalcular a argamassa com base na quantidade de metros
function calcularArgamassa(metros) {
  if (isNaN(metros) || metros <= 0) {
    alert("Valor de metros inválido.");
    return;
  }

  // Novos consumos por m²
  const consumoEconomico = metros * 3.5; // 3,5kg por m²
  const consumoIdeal = metros * 4.5;     // 4,5kg por m²
  const consumoSeguro = metros * 6.0;    // 6,0kg por m²
  const pesoPorSaco = 20;                // Cada saco tem 20kg

  const opcoes = [
    { nome: "Menos", peso: consumoEconomico },
    { nome: "Ideal", peso: consumoIdeal },
    { nome: "Mais", peso: consumoSeguro }
  ];

  const container = document.getElementById("opcoesArgamassa");
  container.innerHTML = "";
  container.style.display = "flex";
  container.style.flexDirection = "row";
  container.style.gap = "0.5rem";
  container.style.justifyContent = "center";

  opcoes.forEach(opcao => {
    const sacos = Math.ceil(opcao.peso / pesoPorSaco);
    const button = document.createElement("button");
    button.textContent = `${opcao.nome}: ${sacos} sc`;
    button.classList.add("primary");
    button.type = "button";
    button.addEventListener("click", () => {
      document.querySelectorAll("#opcoesArgamassa button").forEach(btn => btn.classList.remove("clicado"));
      button.classList.add("clicado");
    });
    container.appendChild(button);
  });
}

function calcularRejunte(metros) {
  if (isNaN(metros) || metros <= 0) {
    alert("Valor de metros inválido.");
    return;
  }

  // Novos consumos por m²
  const consumoEconomico = metros * 0.3; // 0,3kg por m²
  const consumoIdeal = metros * 0.5;     // 0,5kg por m²
  const consumoSeguro = metros * 0.8;    // 0,8kg por m²
  const pesoPorSaco = 5;                 // Cada saco tem 5kg

  const opcoes = [
    { nome: "Menos", peso: consumoEconomico },
    { nome: "Ideal", peso: consumoIdeal },
    { nome: "Mais", peso: consumoSeguro }
  ];

  const container = document.getElementById("opcoesRejunte");
  container.innerHTML = "";
  container.style.display = "flex";
  container.style.flexDirection = "row";
  container.style.gap = "0.5rem";
  container.style.justifyContent = "center";
  container.style.alignItems = "center";

  opcoes.forEach(opcao => {
    const sacos = Math.ceil(opcao.peso / pesoPorSaco);
    const button = document.createElement("button");
    button.textContent = `${opcao.nome}: ${sacos} sc`;
    button.classList.add("primary");
    button.type = "button";
    button.addEventListener("click", () => {
      document.querySelectorAll("#opcoesRejunte button").forEach(btn => btn.classList.remove("clicado"));
      button.classList.add("clicado");
    });
    container.appendChild(button);
  });
}

// Função para alternar entre os botões e exibir a quantidade de piso
function alternarBotao(botaoSelecionado, outroBotao, quantidade) {
  botaoSelecionado.classList.add("clicado");
  outroBotao.classList.remove("clicado");

  // Atualiza a quantidade de piso exibida
  document.getElementById("caixasCalculadas").innerText = `Quantidade de piso selecionado: ${quantidade} m²`;
}

document.getElementById('calcularMetroQuadrado').onclick = function() {
  const largura = parseFloat(document.getElementById('largura').value);
  const comprimento = parseFloat(document.getElementById('comprimento').value);
  if (!isNaN(largura) && !isNaN(comprimento)) {
    document.getElementById('metrosDesejados').value = (largura * comprimento).toFixed(2);
  } else {
    alert('Preencha largura e comprimento corretamente!');
  }
};

// document.getElementById('desejaMetros').addEventListener('click', function() {
//   this.classList.add('clicado');
//   document.getElementById('desejaCaixas').classList.remove('clicado');
// });

// document.getElementById('desejaCaixas').addEventListener('click', function() {
//   this.classList.add('clicado');
//   document.getElementById('desejaMetros').classList.remove('clicado');
// });

document.getElementById('resetarCeramica').addEventListener('click', function() {
  // Limpa campos
  document.getElementById('metrosDesejados').value = '';
  document.getElementById('largura').value = '';
  document.getElementById('comprimento').value = '';
  // Reseta botões metros/caixas
  document.getElementById('desejaMetros').classList.add('clicado');
  document.getElementById('desejaCaixas').classList.remove('clicado');
  // Remove seleção dos botões de cerâmica
  document.querySelectorAll('#opcoesCeramica button').forEach(btn => btn.classList.remove('clicado'));
  // Esconde resultados e argamassa
  document.getElementById('resultadoCeramica').style.display = 'none';
  document.getElementById('tituloArgamassa').style.display = 'none';
  document.getElementById('opcoesArgamassa').style.display = 'none';
  document.getElementById('opcoesArgamassa').innerHTML = '';
  document.getElementById('caixasCalculadas').innerText = '';
  document.getElementById('tituloRejunte').style.display = 'none';
  document.getElementById('opcoesRejunte').style.display = 'none';
  document.getElementById('opcoesRejunte').innerHTML = '';
  // Reseta variáveis de controle
  metrosSelecionados = null;
  jaConvertidoParaMetros = false;
});

function calcularRejunte(metros) {
  if (isNaN(metros) || metros <= 0) {
    alert("Valor de metros inválido.");
    return;
  }

  // Novos consumos por m²
  const consumoEconomico = metros * 0.3; // 0,3kg por m²
  const consumoIdeal = metros * 0.5;     // 0,5kg por m²
  const consumoSeguro = metros * 0.8;    // 0,8kg por m²
  const pesoPorSaco = 5;                 // Cada saco tem 5kg

  const opcoes = [
    { nome: "Menos", peso: consumoEconomico },
    { nome: "Ideal", peso: consumoIdeal },
    { nome: "Mais", peso: consumoSeguro }
  ];

  const container = document.getElementById("opcoesRejunte");
  container.innerHTML = ""; // Limpa antes de adicionar novos botões

  opcoes.forEach(opcao => {
    const pesoFormatado = opcao.peso.toFixed(1).replace('.', ',');
    const sacosFormatado = (opcao.peso / pesoPorSaco).toFixed(2).replace('.', ',');

    const button = document.createElement("button");
    button.textContent = `${opcao.nome}: ${sacosFormatado} sc`;
    button.classList.add("primary");
    button.type = "button";

    button.addEventListener("click", () => {
      document.querySelectorAll("#opcoesRejunte button").forEach(btn => btn.classList.remove("clicado"));
      button.classList.add("clicado");
    });

    container.appendChild(button);
  });
}

// Referências dos elementos
const abrirSelecaoCeramicaBtn = document.getElementById('abrirSelecaoCeramica');
const modalSelecaoCeramica = document.getElementById('modalSelecaoCeramica');
const fecharModalCeramicaBtn = document.getElementById('fecharModalCeramica');
const listaCeramicasCards = document.getElementById('listaCeramicasCards');
const abrirAdicionarCeramicaBtn = document.getElementById('abrirAdicionarCeramica');
const modalAdicionarCeramica = document.getElementById('modalAdicionarCeramica');
const fecharModalAdicionarCeramicaBtn = document.getElementById('fecharModalAdicionarCeramica');
const formAdicionarCeramica = document.getElementById('formAdicionarCeramica');

// Dados das cerâmicas mais comuns
const ceramicasComuns = [
  { nome: "Savane Plus", metragem: 1.82 },
  { nome: "Canela", metragem: 2.27 },
  { nome: "Pratik", metragem: 2.5 },
  { nome: "Carvalho", metragem: 3.1 },
  { nome: "HD Madeira", metragem: 2.92 }
];

// Abrir modal de seleção
abrirSelecaoCeramicaBtn.onclick = () => {
  modalSelecaoCeramica.style.display = 'flex';
  carregarCeramicas();
};

// Fechar modal de seleção
fecharModalCeramicaBtn.onclick = () => {
  modalSelecaoCeramica.style.display = 'none';
};

// Abrir modal de adicionar
abrirAdicionarCeramicaBtn.onclick = () => {
  modalAdicionarCeramica.style.display = 'flex';
};

// Fechar modal de adicionar
fecharModalAdicionarCeramicaBtn.onclick = () => {
  modalAdicionarCeramica.style.display = 'none';
};

// Salvar nova cerâmica
formAdicionarCeramica.onsubmit = async (e) => {
  e.preventDefault();
  const nome = document.getElementById('nomeNovaCeramica').value.trim();
  const valor = document.getElementById('valorNovaCeramica').value.trim();
  const metragemCaixa = parseFloat(document.getElementById('metragemCaixaNovaCeramica').value);
  const tamanhoPiso = document.getElementById('tamanhoPisoNovaCeramica').value.trim();
  const lugares = Array.from(formAdicionarCeramica.querySelectorAll('.checkboxes-lugares input:checked')).map(cb => cb.value);
  const fotoInput = document.getElementById('fotoNovaCeramica');
  let fotoURL = "";

  if (!nome || !metragemCaixa) return;

  // Upload da imagem se houver
  if (fotoInput.files && fotoInput.files[0]) {
    const file = fotoInput.files[0];
    const storageRef = firebase.storage().ref();
    const fileRef = storageRef.child('ceramicas/' + Date.now() + '_' + file.name);
    await fileRef.put(file);
    fotoURL = await fileRef.getDownloadURL();
  }

  const novaCeramica = {
    nome,
    valor,
    metragemCaixa,
    tamanhoPiso,
    lugares,
    fotoURL // salva a url da foto (ou string vazia)
  };

  // Salva no Firebase
  const db = firebase.database();
  const ref = db.ref('ceramicas');
  await ref.push(novaCeramica);

  modalAdicionarCeramica.style.display = 'none';
  carregarCeramicas();
  formAdicionarCeramica.reset();
};

// Carregar cerâmicas do Firebase e renderizar cards
async function carregarCeramicas() {
  listaCeramicasCards.innerHTML = '';
  const db = firebase.database();
  const ref = db.ref('ceramicas');
  const snap = await ref.once('value');
  const ceramicas = snap.val() || {};

  Object.entries(ceramicas).forEach(([key, ceramica]) => {
    const card = document.createElement('div');
    card.className = 'card-ceramica';
    const foto = ceramica.fotoURL && ceramica.fotoURL.length > 0
      ? ceramica.fotoURL
      : "../images/image-placeholder.webp"; // Placeholder se não houver foto
    card.innerHTML = `
      <button class="excluir-ceramica-btn" title="Excluir cerâmica">&times;</button>
      <div class="nome" tabindex="0">${ceramica.nome}</div>
      <img src="${foto}" alt="Foto da cerâmica" />
      <div class="info">
        <div class="metragem">${ceramica.metragemCaixa.toLocaleString('pt-BR', {minimumFractionDigits:2})} m²/caixa</div>
        ${ceramica.tamanhoPiso ? `<div class="tamanho-piso">${ceramica.tamanhoPiso}</div>` : ''}
        ${ceramica.valor ? `<div class="valor">${ceramica.valor}</div>` : ''}
        ${ceramica.lugares && ceramica.lugares.length ? `<div class="lugares">${ceramica.lugares.join(', ')}</div>` : ''}
      </div>
      <div style="display:flex;gap:0.5rem;justify-content:center;">
        <button class="selecionar-ceramica" data-metragem="${ceramica.metragemCaixa}">Selecionar</button>
        <button class="editar-ceramica-btn" title="Editar cerâmica"><i class="fas fa-pen"></i></button>
      </div>
    `;
    // Botão excluir
    card.querySelector('.excluir-ceramica-btn').onclick = (ev) => {
      ev.stopPropagation();
      abrirPopupExcluirCeramica(key, ceramica.nome);
    };
    card.querySelector('.selecionar-ceramica').onclick = () => {
      selecionarCeramicaViaCard(ceramica.metragemCaixa);
      modalSelecaoCeramica.style.display = 'none';
    };
    // Botão editar
    card.querySelector('.editar-ceramica-btn').onclick = () => {
      ativarEdicaoInline(card, key, ceramica);
    };
    listaCeramicasCards.appendChild(card);
  });

  // Adiciona o card de adicionar nova cerâmica no final
  listaCeramicasCards.appendChild(abrirAdicionarCeramicaBtn);
}

// Selecionar cerâmica via card (ativa o botão correspondente)
function selecionarCeramicaViaCard(metragem) {
  const opcoes = document.querySelectorAll('#opcoesCeramica button');
  let encontrou = false;
  opcoes.forEach(btn => {
    if (parseFloat(btn.textContent.replace(',', '.')) === parseFloat(metragem)) {
      btn.click();
      encontrou = true;
    }
  });
  // Se não encontrou, chama a função selecionarCeramica diretamente
  if (!encontrou && typeof selecionarCeramica === 'function') {
    selecionarCeramica(metragem);
  }
}

// Fecha modais ao clicar fora
window.addEventListener('click', function(e) {
  if (e.target === modalSelecaoCeramica) modalSelecaoCeramica.style.display = 'none';
  if (e.target === modalAdicionarCeramica) modalAdicionarCeramica.style.display = 'none';
});

// Formatar valor no input para R$ 1.234,56
const valorInput = document.getElementById('valorNovaCeramica');
if (valorInput) {
  valorInput.addEventListener('input', function (e) {
    let v = e.target.value.replace(/\D/g, '');
    v = (parseInt(v, 10) || 0).toString();
    if (v.length === 0) v = '0';
    while (v.length < 3) v = '0' + v;
    let reais = v.slice(0, -2);
    let centavos = v.slice(-2);
    reais = reais.replace(/^0+/, '') || '0';
    reais = reais.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    e.target.value = `R$ ${reais},${centavos}`;
  });

  // Corrige valor ao sair do campo (remove zeros à esquerda)
  valorInput.addEventListener('blur', function (e) {
    if (!e.target.value) return;
    let v = e.target.value.replace(/\D/g, '');
    v = (parseInt(v, 10) || 0).toString();
    while (v.length < 3) v = '0' + v;
    let reais = v.slice(0, -2);
    let centavos = v.slice(-2);
    reais = reais.replace(/^0+/, '') || '0';
    reais = reais.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    e.target.value = `R$ ${reais},${centavos}`;
  });
}

const popupExcluir = document.getElementById('popupExcluirCeramica');
const textoExcluir = document.getElementById('textoExcluirCeramica');
const btnConfirmarExcluir = document.getElementById('confirmarExcluirCeramica');
const btnCancelarExcluir = document.getElementById('cancelarExcluirCeramica');
let idCeramicaParaExcluir = null;

function abrirPopupExcluirCeramica(key, nome) {
  idCeramicaParaExcluir = key;
  textoExcluir.textContent = `Tem certeza que deseja excluir a cerâmica "${nome}"?`;
  popupExcluir.style.display = 'block';
}

btnCancelarExcluir.onclick = () => {
  popupExcluir.style.display = 'none';
  idCeramicaParaExcluir = null;
};

btnConfirmarExcluir.onclick = async () => {
  if (!idCeramicaParaExcluir) return;
  const db = firebase.database();
  await db.ref('ceramicas/' + idCeramicaParaExcluir).remove();
  popupExcluir.style.display = 'none';
  idCeramicaParaExcluir = null;
  carregarCeramicas();
};

document.addEventListener('DOMContentLoaded', function() {
  // Adicionar evento ao botão
  document.getElementById('abrirSelecaoCeramica').addEventListener('click', function() {
    document.getElementById('modalSelecaoCeramica').style.display = 'flex';
    carregarCeramicas(); // Essa função só mexe em #listaCeramicasCards
  });

  // Remova eventos antigos dos botões que não existem mais
  // const btnMetros = document.getElementById('desejaMetros');
  // const btnCaixas = document.getElementById('desejaCaixas');

  // Inicialização da unidade
  let unidadeAtual = 'metros';
  const toggleUnidade = document.getElementById('toggleUnidade');
  
  function atualizarCalculo() {
      const entrada = parseFloat(document.getElementById('metrosDesejados').value) || 0;
      if (!metrosSelecionados) return;

      let resultado;
      if (unidadeAtual === 'metros') {
          resultado = Math.ceil(entrada / metrosSelecionados);
      } else {
          resultado = (entrada * metrosSelecionados).toFixed(2);
      }

      document.getElementById('caixasCalculadas').innerText = 
          unidadeAtual === 'metros' ? 
          `${resultado} caixas para ${entrada}m²` :
          `${resultado}m² em ${entrada} caixas`;
  }

  // Novo evento para o toggle
  if (toggleUnidade) {
      toggleUnidade.addEventListener('click', function() {
          if (unidadeAtual === 'metros') {
              unidadeAtual = 'caixas';
              this.innerHTML = '<i class="fas fa-sync"></i> Caixas';
          } else {
              unidadeAtual = 'metros';
              this.innerHTML = '<i class="fas fa-sync"></i> Metros';
          }
          atualizarCalculo();
      });
  }

  // Atualizar evento do input
  const inputMetros = document.getElementById('metrosDesejados');
  if (inputMetros) {
      inputMetros.addEventListener('input', atualizarCalculo);
  }
});


function selecionarMetragem(metros) {
  // Remove classe 'clicado' de todos os botões
  document.querySelectorAll('.grid-opcoes-ceramica button').forEach(btn => {
    btn.classList.remove('clicado');
  });

  // Adiciona classe 'clicado' ao botão atual
  const botoes = document.querySelectorAll('.grid-opcoes-ceramica button');
  const botaoAtual = Array.from(botoes).find(btn => 
    btn.textContent.includes(metros.toString().replace('.', ','))
  );
  if (botaoAtual) botaoAtual.classList.add('clicado');

  // Atualiza a metragem selecionada e recalcula
  metrosSelecionados = metros;
  calcularCaixas();
}

function ativarEdicaoInline(card, key, ceramica) {
  // Campos editáveis
  const campos = [
    { seletor: '.nome', prop: 'nome', tipo: 'text' },
    { seletor: '.metragem', prop: 'metragemCaixa', tipo: 'number' },
    { seletor: '.tamanho-piso', prop: 'tamanhoPiso', tipo: 'text' },
    { seletor: '.valor', prop: 'valor', tipo: 'text' }
  ];

  campos.forEach(({ seletor, prop, tipo }) => {
    const el = card.querySelector(seletor);
    if (el) {
      // Pega valor atual
      let valorAtual = el.innerText.replace(' m²/caixa','');
      // Cria input
      const input = document.createElement('input');
      input.type = tipo;
      input.value = valorAtual;
      input.style.width = (valorAtual.length + 2) + 'ch';
      input.className = 'input-edicao-inline';
      input.setAttribute('data-prop', prop); // Adiciona o atributo data-prop
      el.replaceWith(input);
      input.focus();

      // Salva ao pressionar Enter ou sair do campo
      input.addEventListener('keydown', async (e) => {
        if (e.key === 'Enter') {
          await salvarEdicaoInline(card, key, campos);
        }
      });
      input.addEventListener('blur', async () => {
        await salvarEdicaoInline(card, key, campos);
      });
    }
  });
}

async function salvarEdicaoInline(card, key, campos) {
  const db = firebase.database();
  const updates = {};
  let erro = false;

  campos.forEach(({ seletor, prop, tipo }) => {
    // Pegue o input correto para cada campo
    const input = card.querySelector(`input.input-edicao-inline[data-prop="${prop}"]`);
    if (input) {
      let valor = input.value;
      if (tipo === 'number') {
        valor = parseFloat(valor.replace(',', '.'));
        if (isNaN(valor) || valor <= 0) {
          erro = true;
          input.classList.add('erro-edicao');
        } else {
          input.classList.remove('erro-edicao');
        }
      }
      updates[prop] = valor;
    }
  });

  if (erro) {
    alert('Digite um valor numérico válido e maior que zero para a metragem!');
    return;
  }

  if (Object.keys(updates).length) {
    await db.ref('ceramicas/' + key).update(updates);
    await carregarCeramicas();
  }
}