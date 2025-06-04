



let metrosSelecionados = null;  // Variável para armazenar a quantidade de metros selecionados

function selecionarCeramica(metrosPorCaixa) {
  const metrosDesejados = parseFloat(document.getElementById("metrosDesejados").value);
  if (isNaN(metrosDesejados) || metrosDesejados <= 0) {
    alert("Digite a quantidade de metros que o cliente deseja.");
    return;
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
  botaoBaixo.classList.add("small-button");
  botaoBaixo.id = "botaoParaBaixo";
  botaoBaixo.innerText = `${metrosBaixo} m² (${caixasBaixo} cx)`;
  botaoBaixo.addEventListener("click", () => {
    metrosSelecionados = parseFloat(metrosBaixo.replace(',', '.'));  // Atualiza a variável com o valor selecionado (convertido para número)
    alternarBotao(botaoBaixo, botaoCima, metrosBaixo);
    calcularArgamassa(metrosSelecionados);  // Recalcula a argamassa com base no valor selecionado
  });
  container.appendChild(botaoBaixo);

  // Botão do meio fixo (referência)
  const botaoReferencia = document.createElement("button");
  botaoReferencia.classList.add("small-button");
  botaoReferencia.style.backgroundColor = "#cccccc"; // cor neutra
  botaoReferencia.style.cursor = "default";
  const caixasExatasFormatado = caixasExatas.toFixed(2).replace('.', ',');
  botaoReferencia.innerText = `${metrosDesejados.toFixed(2).replace('.', ',')} m² (${caixasExatasFormatado} cx)`;
  botaoReferencia.disabled = true; // desabilitar clique
  container.appendChild(botaoReferencia);

  // Botão para mais caixas
  const botaoCima = document.createElement("button");
  botaoCima.classList.add("small-button");
  botaoCima.id = "botaoParaCima";
  botaoCima.innerText = `${metrosCima} m² (${caixasCima} cx)`;
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
}

// Função para recalcular a argamassa com base na quantidade de metros
function calcularArgamassa(metros) {
  if (isNaN(metros) || metros <= 0) {
    alert("Valor de metros inválido.");
    return;
  }

  const consumoEconomico = metros * 4; // 4kg por m²
  const consumoIdeal = metros * 5;     // 5kg por m²
  const consumoSeguro = metros * 6;    // 6kg por m²
  const pesoPorSaco = 20;              // Cada saco tem 20kg

  const opcoes = [
    { nome: "Econômico", peso: consumoEconomico },
    { nome: "Ideal", peso: consumoIdeal },
    { nome: "Seguro", peso: consumoSeguro }
  ];

  const container = document.getElementById("opcoesArgamassa");
  container.innerHTML = ""; // Limpa antes de adicionar novos botões

  opcoes.forEach(opcao => {
    const pesoFormatado = opcao.peso.toFixed(1).replace('.', ',');
    const sacosFormatado = (opcao.peso / pesoPorSaco).toFixed(2).replace('.', ',');

    const button = document.createElement("button");
    button.textContent = `${pesoFormatado} kg (${sacosFormatado})`;
    button.classList.add("small-button");

    button.addEventListener("click", () => {
      document.querySelectorAll("#opcoesArgamassa button").forEach(btn => btn.classList.remove("clicado"));
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

const btn = document.getElementById('toggleTheme');
btn.onclick = function() {
  document.body.classList.toggle('dark-theme');
  btn.textContent = document.body.classList.contains('dark-theme') ? '☀️' : '🌙';
};