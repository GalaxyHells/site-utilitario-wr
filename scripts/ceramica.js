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

// Função para selecionar metragem fixa (botões)
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

// Função para calcular caixas e exibir resultado
function calcularCaixas() {
  const metrosDesejados = parseFloat(document.getElementById("metrosDesejados").value);
  if (isNaN(metrosDesejados) || metrosDesejados <= 0 || !metrosSelecionados) {
    document.getElementById("resultadoCeramica").style.display = "none";
    document.getElementById("caixasCalculadas").innerText = "";
    document.getElementById('tituloArgamassa').style.display = 'none';
    document.getElementById('opcoesArgamassa').style.display = 'none';
    document.getElementById('tituloRejunte').style.display = 'none';
    document.getElementById('opcoesRejunte').style.display = 'none';
    return;
  }

  const caixasExatas = metrosDesejados / metrosSelecionados;
  const caixasBaixo = Math.floor(caixasExatas);
  const caixasCima = Math.ceil(caixasExatas);

  const metrosBaixo = (caixasBaixo * metrosSelecionados).toFixed(2).replace('.', ',');
  const metrosCima = (caixasCima * metrosSelecionados).toFixed(2).replace('.', ',');

  document.getElementById("resultadoCeramica").style.display = "block";
  document.getElementById("caixasCalculadas").innerText = `Quantidade arredondada: ${caixasExatas.toFixed(2).replace('.', ',')} cx`;

  const container = document.querySelector("#resultadoCeramica .botoes-ajuste");
  if (container) {
    container.innerHTML = "";
    // Botão para menos caixas
    const botaoBaixo = document.createElement("button");
    botaoBaixo.classList.add("primary");
    botaoBaixo.id = "botaoParaBaixo";
    botaoBaixo.innerHTML = `<i class="fas fa-minus"></i> ${metrosBaixo} m² (${caixasBaixo} cx)`;
    botaoBaixo.addEventListener("click", () => {
      alternarBotao(botaoBaixo, botaoCima, metrosBaixo);
      calcularArgamassa(parseFloat(metrosBaixo.replace(',', '.')));
      calcularRejunte(parseFloat(metrosBaixo.replace(',', '.')));
    });
    container.appendChild(botaoBaixo);

    // Botão para mais caixas
    const botaoCima = document.createElement("button");
    botaoCima.classList.add("primary");
    botaoCima.id = "botaoParaCima";
    botaoCima.innerHTML = `<i class="fas fa-plus"></i> ${metrosCima} m² (${caixasCima} cx)`;
    botaoCima.addEventListener("click", () => {
      alternarBotao(botaoCima, botaoBaixo, metrosCima);
      calcularArgamassa(parseFloat(metrosCima.replace(',', '.')));
      calcularRejunte(parseFloat(metrosCima.replace(',', '.')));
    });
    container.appendChild(botaoCima);
  }

  calcularArgamassa(metrosDesejados);
  calcularRejunte(metrosDesejados);

  document.getElementById('tituloArgamassa').style.display = 'block';
  document.getElementById('opcoesArgamassa').style.display = 'flex';
  document.getElementById('tituloRejunte').style.display = 'block';
  document.getElementById('opcoesRejunte').style.display = 'flex';
}

// Função para alternar entre os botões e exibir a quantidade de piso
function alternarBotao(botaoSelecionado, outroBotao, quantidade) {
  botaoSelecionado.classList.add("clicado");
  outroBotao.classList.remove("clicado");
  document.getElementById("caixasCalculadas").innerText = `Quantidade de piso selecionado: ${quantidade} m²`;
}

// Argamassa
function calcularArgamassa(metros) {
  if (isNaN(metros) || metros <= 0) {
    document.getElementById('opcoesArgamassa').innerHTML = '';
    return;
  }
  const consumoEconomico = metros * 3.5;
  const consumoIdeal = metros * 4.5;
  const consumoSeguro = metros * 6.0;
  const pesoPorSaco = 20;

  const opcoes = [
    { nome: "Menos", peso: consumoEconomico },
    { nome: "Ideal", peso: consumoIdeal },
    { nome: "Mais", peso: consumoSeguro }
  ];

  const container = document.getElementById("opcoesArgamassa");
  container.innerHTML = "";
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
    button.innerHTML = `<span class="btn-calc-qtd">${sacos} sacos</span><br><span class="btn-calc-tipo">(${opcao.nome})</span>`;
    container.appendChild(button);
  });
}

// Rejunte
function calcularRejunte(metros) {
  if (isNaN(metros) || metros <= 0) {
    document.getElementById('opcoesRejunte').innerHTML = '';
    return;
  }
  const consumoEconomico = metros * 0.3;
  const consumoIdeal = metros * 0.5;
  const consumoSeguro = metros * 0.8;
  const pesoPorSaco = 5;

  const opcoes = [
    { nome: "Menos", peso: consumoEconomico },
    { nome: "Ideal", peso: consumoIdeal },
    { nome: "Mais", peso: consumoSeguro }
  ];

  const container = document.getElementById("opcoesRejunte");
  container.innerHTML = "";
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

// Calcular metros quadrados a partir de largura x comprimento
document.getElementById('calcularMetroQuadrado').onclick = function() {
  const largura = parseFloat(document.getElementById('largura').value);
  const comprimento = parseFloat(document.getElementById('comprimento').value);
  if (!isNaN(largura) && !isNaN(comprimento)) {
    document.getElementById('metrosDesejados').value = (largura * comprimento).toFixed(2);
    if (metrosSelecionados) calcularCaixas();
  } else {
    alert('Preencha largura e comprimento corretamente!');
  }
};

// Resetar campos e resultados
document.getElementById('resetarCeramica').addEventListener('click', function() {
  document.getElementById('metrosDesejados').value = '';
  document.getElementById('largura').value = '';
  document.getElementById('comprimento').value = '';
  document.querySelectorAll('.grid-opcoes-ceramica button').forEach(btn => btn.classList.remove('clicado'));
  document.getElementById('resultadoCeramica').style.display = 'none';
  document.getElementById('tituloArgamassa').style.display = 'none';
  document.getElementById('opcoesArgamassa').style.display = 'none';
  document.getElementById('opcoesArgamassa').innerHTML = '';
  document.getElementById('caixasCalculadas').innerText = '';
  document.getElementById('tituloRejunte').style.display = 'none';
  document.getElementById('opcoesRejunte').style.display = 'none';
  document.getElementById('opcoesRejunte').innerHTML = '';
  metrosSelecionados = null;
  jaConvertidoParaMetros = false;
});

// Atualizar cálculo ao digitar metros desejados
document.getElementById('metrosDesejados').addEventListener('input', function() {
  if (metrosSelecionados) calcularCaixas();
});

function criarBotaoCalc(qtd, tipo) {
  return `
    <button class="btn-calc">
      <span class="btn-calc-qtd">${qtd}</span><br>
      <span class="btn-calc-tipo">(${tipo})</span>
    </button>
  `;
}