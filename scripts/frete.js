// scripts/frete.js

function calcularFrete() {
  const distancia = parseFloat(document.getElementById("freteDistancia").value);
  const peso = parseFloat(document.getElementById("fretePeso").value);
  const precoDiesel = parseFloat(document.getElementById("precoDiesel").value);
  const ajusteEstrada = parseFloat(document.getElementById("qualidadeEstrada").value);
  const veiculoSelect = document.getElementById("veiculoFrete");
  const veiculo = veiculoSelect.options[veiculoSelect.selectedIndex].text;
  console.log(veiculo);

  if (isNaN(distancia) || isNaN(peso) || isNaN(precoDiesel)) {
    mostrarResultadoFrete("Preencha todos os campos corretamente.");
    return;
  }

  const custoFixo = 20;
  const lucro = 0.3;
  const freteMinimo = 70;

  const ida = distancia;
  const volta = distancia;

  let consumoIda, consumoVolta;

  if (veiculo === "L1620") {
    // L1620: Consumo vazio 4 km/l, perde 0.3 km/l por tonelada
    consumoIda = (4 - (0.3 * peso)) * (1 - ajusteEstrada);
    consumoVolta = 4 * (1 - ajusteEstrada);
  } else {
    // F4000: lógica original
    consumoIda = (5 - (0.5 * peso)) * (1 - ajusteEstrada);
    consumoVolta = 5 * (1 - ajusteEstrada);
  }

  const litrosIda = ida / consumoIda;
  const litrosVolta = volta / consumoVolta;
  const litrosTotal = litrosIda + litrosVolta;
  const custoDiesel = litrosTotal * precoDiesel;

  const custoTotal = (custoDiesel + custoFixo) * (1 + lucro);
  const freteFinal = Math.max(custoTotal, freteMinimo);

  mostrarResultadoFrete(
    `🔧 Frete calculado: R$ ${freteFinal.toFixed(2).replace('.', ',')}\n` +
    `🛣️ Distância total: ${distancia * 2} km\n` +
    `⛽ Consumo ida: ${consumoIda.toFixed(2)} km/L\n` +
    `⛽ Consumo volta: ${consumoVolta.toFixed(2)} km/L\n` +
    `⛽ Total de diesel: ${litrosTotal.toFixed(2).replace('.', ',')} L\n` +
    `💸 Custo com diesel: R$ ${custoDiesel.toFixed(2).replace('.', ',')}`
  );
}

function mostrarResultadoFrete(msg) {
  document.getElementById("resultadoFrete").innerText = msg;
}

// Novo cálculo de peso total com base em múltiplos materiais
function atualizarPesoAutomaticamente() {
  const volumeAreiaFina = parseFloat(document.getElementById("areiaFina").value) || 0;
  const volumeAreiaGrossa = parseFloat(document.getElementById("areiaGrossa").value) || 0;
  const volumePedra = parseFloat(document.getElementById("pedra").value) || 0;
  const volumePedrisco = parseFloat(document.getElementById("pedrisco").value) || 0;
  const sacosCimento = parseInt(document.getElementById("cimento").value) || 0;

  const pesoAreiaFina = volumeAreiaFina * 1.4;
  const pesoAreiaGrossa = volumeAreiaGrossa * 1.6;
  const pesoPedra = volumePedra * 1.7;
  const pesoPedrisco = volumePedrisco * 1.5;
  const pesoCimento = (sacosCimento * 50) / 1000; // 50kg por saco => toneladas

  const pesoTotal = pesoAreiaFina + pesoAreiaGrossa + pesoPedra + pesoPedrisco + pesoCimento;

  document.getElementById("fretePeso").value = pesoTotal.toFixed(2);
}

function setarDistanciaPredefinida() {
  const selectLocal = document.getElementById('localPredefinido');
  const selectQualidade = document.getElementById('qualidadeEstrada');
  const inputDistancia = document.getElementById('freteDistancia');

  const valorSelecionado = selectLocal.value;
  inputDistancia.value = valorSelecionado;

  // Tenta pegar o atributo data-condicao do option selecionado
  const optionSelecionada = selectLocal.options[selectLocal.selectedIndex];
  const condicao = optionSelecionada.getAttribute('data-condicao');

  if (condicao !== null) {
    selectQualidade.value = condicao;
  } else {
    // Para os destinos fixos do HTML
    const destinos = {
      "22": "0.10",    // Roseli Nunes (Escola) - Estrada média
      "13.6": "0.0"    // Prata - Estrada boa
    };
    if (destinos[valorSelecionado] !== undefined) {
      selectQualidade.value = destinos[valorSelecionado];
    }
  }
}

// Carregar locais do Firebase
function carregarLocaisEntrega(callback) {
  firebase.database().ref("locaisEntregaWR").once("value", function(snapshot) {
    const locais = [];
    snapshot.forEach(child => {
      locais.push({ ...child.val(), key: child.key });
    });
    callback(locais);
  });
}

// Salvar novo local no Firebase
function adicionarNovoLocal() {
  const nome = document.getElementById("nomeNovoLocal").value.trim();
  const km = parseFloat(document.getElementById("kmNovoLocal").value);
  const condicao = document.getElementById("condicaoNovoLocal").value;

  if (!nome || isNaN(km)) {
    alert("Preencha o nome e a distância (km)!");
    return;
  }

  if (editandoLocalKey) {
    // Atualizar local existente
    firebase.database().ref("locaisEntregaWR/" + editandoLocalKey).set({ nome, km, condicao }, function(error) {
      if (!error) {
        limparCamposNovoLocal();
        atualizarSelectLocais();
        atualizarListaLocaisEntrega();
      } else {
        alert("Erro ao salvar no Firebase!");
      }
    });
    editandoLocalKey = null;
    const btn = document.querySelector('.adicionar-local-frete button[onclick="adicionarNovoLocal()"]');
    if (btn) btn.textContent = "Adicionar";
  } else {
    // Adicionar novo local
    firebase.database().ref("locaisEntregaWR").push({ nome, km, condicao }, function(error) {
      if (!error) {
        limparCamposNovoLocal();
        atualizarSelectLocais();
        atualizarListaLocaisEntrega();
      } else {
        alert("Erro ao salvar no Firebase!");
      }
    });
  }
}

function limparCamposNovoLocal() {
  document.getElementById("nomeNovoLocal").value = "";
  document.getElementById("kmNovoLocal").value = "";
  document.getElementById("condicaoNovoLocal").value = "0.0";
  editandoLocalKey = null;
  const btn = document.querySelector('.adicionar-local-frete button[onclick="adicionarNovoLocal()"]');
  if (btn) btn.textContent = "Adicionar";
}

// Excluir local do Firebase
function excluirLocalEntrega(key) {
  firebase.database().ref("locaisEntregaWR/" + key).remove(function(error) {
    if (!error) {
      atualizarSelectLocais();
      atualizarListaLocaisEntrega();
    } else {
      alert("Erro ao excluir do Firebase!");
    }
  });
}

// Atualizar select com locais do Firebase
function atualizarSelectLocais() {
  carregarLocaisEntrega(function(locais) {
    const select = document.getElementById("localPredefinido");
    select.innerHTML = `<option value="">Escolha um destino...</option>`;
    locais.forEach(local => {
      select.innerHTML += `<option value="${local.km}" data-condicao="${local.condicao}">${local.nome} [${local.km} km]</option>`;
    });
  });
}

// Atualizar lista com locais do Firebase
function atualizarListaLocaisEntrega() {
  carregarLocaisEntrega(function(locais) {
    const ul = document.getElementById("listaLocaisEntrega");
    ul.innerHTML = "";
    locais.forEach(local => {
      const condicaoTxt = local.condicao === "0.0" ? "Boa" : local.condicao === "0.10" ? "Média" : "Ruim";
      ul.innerHTML += `
        <li>
          <div class="local-info">
            <span class="local-nome">${local.nome}</span>
            <span class="local-detalhes">${local.km} km • Estrada ${condicaoTxt}</span>
          </div>
          <div style="display:flex; flex-direction:column; gap:4px; min-width: 150px;">
            <button type="button" class="small-button editar-btn" onclick="editarLocalEntrega('${local.key}', '${local.nome}', '${local.km}', '${local.condicao}')">Editar</button>
            <button type="button" class="small-button" onclick="excluirLocalEntrega('${local.key}')">Excluir</button>
          </div>
        </li>
      `;
    });
  });
}

let editandoLocalKey = null;

function editarLocalEntrega(key, nome, km, condicao) {
  document.getElementById("nomeNovoLocal").value = nome;
  document.getElementById("kmNovoLocal").value = km;
  document.getElementById("condicaoNovoLocal").value = condicao;
  editandoLocalKey = key;
  const btn = document.querySelector('.adicionar-local-frete button[onclick="adicionarNovoLocal()"]');
  if (btn) btn.textContent = "Salvar";
}

// Atualiza o select ao carregar a página
document.addEventListener("DOMContentLoaded", atualizarSelectLocais);
document.addEventListener("DOMContentLoaded", atualizarListaLocaisEntrega);