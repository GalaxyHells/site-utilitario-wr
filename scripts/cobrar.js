let chavePix = "05.346.003/0001-00"; // Chave padrão
function setarPix(chave) {
  chavePix = chave;
  // Remove 'clicado' de todos os botões de chave Pix
  document.querySelectorAll('.btn-pix').forEach(btn => {
    btn.classList.remove('clicado');
  });
  // Adiciona 'clicado' ao botão pressionado
  const btn = document.querySelector(`.btn-pix[onclick*="${chave}"]`);
  if (btn) btn.classList.add('clicado');
}

function criarLinha(tipo, idx) {
  return `
    <div class="linha-cobrar" data-tipo="${tipo}" data-idx="${idx}">
      <input type="number" min="1" placeholder="Qtd." class="qtd" style="width:60px;">
      <input type="text" placeholder="Valor (R$)" class="valor" style="width:110px;">
      <span class="doc-tipo tipo-btn clicado" data-tipo="${tipo === 'notas' ? 'Nota' : 'Boleto'}">${tipo === 'notas' ? 'Nota' : 'Boleto'}</span>
    </div>
  `;

  // <button type="button" class="small-button" onclick="removerLinha('${tipo}', ${idx})" style="background:#eee;color:#444;">✕</button>
}

let linhas = { vencidas: [], hoje: [], sete: [] };

function formatarMoeda(valor) {
  // Remove tudo que não for número
  valor = valor.replace(/\D/g, "");
  if (!valor) return "";
  // Divide por 100 para ter os centavos
  valor = (parseInt(valor, 10) / 100).toFixed(2) + "";
  // Troca ponto por vírgula para centavos
  valor = valor.replace(".", ",");
  // Adiciona pontos de milhar
  valor = valor.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  return "R$ " + valor;
}

function aplicarMascaraMoeda(input) {
  input.addEventListener("input", function () {
    let val = input.value.replace(/\D/g, "");
    if (val === "") {
      input.value = "";
      return;
    }
    val = (parseInt(val, 10) / 100).toFixed(2);
    val = val.replace(".", ",");
    val = val.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    input.value = "R$ " + val;
  });

  // Aplica a máscara ao carregar o valor inicial
  if (input.value) {
    let val = input.value.replace(/\D/g, "");
    if (val) {
      val = (parseInt(val, 10) / 100).toFixed(2);
      val = val.replace(".", ",");
      val = val.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
      input.value = "R$ " + val;
    }
  }
}

function adicionarLinha(tipo) {
  const idx = linhas[tipo].length;
  linhas[tipo].push({ tipoDoc: "Nota", qtd: "", valor: "" });
  // document.getElementById(tipo + '-lista').insertAdjacentHTML('beforeend', criarLinha(tipo, idx));
  atualizarEventosLinha(tipo, idx);
}

function removerLinha(tipo, idx) {
  linhas[tipo][idx] = null;
  const el = document.querySelector(`div[data-tipo="${tipo}"][data-idx="${idx}"]`);
  if (el) el.remove();
}

function atualizarEventosLinha(tipo, idx) {
  const container = document.querySelector(`div[data-tipo="${tipo}"][data-idx="${idx}"]`);
  if (!container) return;
  const btns = container.querySelectorAll('.tipo-btn');
  btns.forEach(btn => {
    btn.onclick = function() {
      btns.forEach(b => b.classList.remove('clicado'));
      btn.classList.add('clicado');
      linhas[tipo][idx].tipoDoc = btn.dataset.tipo;
    };
  });
  container.querySelector('.qtd').oninput = function() {
    linhas[tipo][idx].qtd = this.value;
  };
  const valorInput = container.querySelector('.valor');
  aplicarMascaraMoeda(valorInput);
  valorInput.oninput = function() {
    // Remove "R$ " e pontos para armazenar só o número
    linhas[tipo][idx].valor = valorInput.value;
  };
}

// Inicialize com duas linhas em cada, sendo a segunda marcada como Boleto
['vencidas', 'hoje', 'sete'].forEach(tipo => {
  adicionarLinha(tipo); // primeira linha (Nota)
  adicionarLinha(tipo); // segunda linha (Boleto)
  // Marca o botão "Boleto" na segunda linha
  const idx = 1; // segunda linha tem índice 1
  const container = document.querySelector(`div[data-tipo="${tipo}"][data-idx="${idx}"]`);
  if (container) {
    const btnNota = container.querySelector('.tipo-btn[data-tipo="Nota"]');
    const btnBoleto = container.querySelector('.tipo-btn[data-tipo="Boleto"]');
    if (btnNota && btnBoleto) {
      btnNota.classList.remove('clicado');
      btnBoleto.classList.add('clicado');
      linhas[tipo][idx].tipoDoc = "Boleto";
    }
  }
});

// Ao gerar mensagem:
function gerarMensagem() {
  // Saudação dinâmica
  const hora = new Date().getHours();
  const saudacao = hora >= 12 && hora < 18 ? "Boa tarde" : "Bom dia";

  let mensagem = `*${saudacao},*\n\nDetectamos pendências em seu cadastro:\n`;
  let temBoleto = false;

  // Para cada coluna (Notas e Boletos)
  document.querySelectorAll('.coluna-cobranca').forEach(coluna => {
    const tipoDoc = coluna.querySelector('.coluna-titulo i').classList.contains('fa-file-invoice') ? 'Nota' : 'Boleto';

    coluna.querySelectorAll('.secao-cobranca').forEach(secao => {
      let desc = '';
      if (secao.querySelector('.secao-titulo i.fa-clock-rotate-left')) desc = 'vencida(s)';
      else if (secao.querySelector('.secao-titulo i.fa-calendar-day')) desc = 'vencendo hoje';
      else if (secao.querySelector('.secao-titulo i.fa-calendar-week')) desc = 'vencendo nos próximos 7 dias';

      const qtdInput = secao.querySelector('.linha-cobrar .qtd');
      const valorInput = secao.querySelector('.linha-cobrar .valor');
      const qtd = qtdInput ? qtdInput.value : '';
      const valor = valorInput ? valorInput.value : '';

      if (qtd && valor) {
        const qtdNum = parseInt(qtd, 10);
        const valorTexto = qtdNum > 1 ? "no valor total de" : "no valor de";
        mensagem += `*${qtd}* ${tipoDoc.toLowerCase()}(s) ${desc}, ${valorTexto} *${valor}*.\n`;

        if (tipoDoc === "Boleto") {
          temBoleto = true;
        }
      }
    });
  });

  if (temBoleto) {
    mensagem += `\n*IMPORTANTE:* Boletos devem ser pagos no aplicativo do banco, papelarias, mercados ou locais que aceitam pagamento de boletos. Não é possível pagar boletos na loja ou via Pix.\n`;
    mensagem += `\n*ATENÇÃO:* Boletos podem ser protestados e gerar negativação do nome após 5 dias do vencimento.\n`;
  } else {
    mensagem += `\nCaso deseje, pode realizar o pagamento via Pix utilizando a chave: *${chavePix}*\n`;
  }

  mensagem += "\nAtenciosamente,\n*WR - Materiais para Construção*\n\n_Esta é uma mensagem automática. Em caso de dúvidas, entre em contato conosco._";
  document.getElementById('mensagem').value = mensagem;
}

function copiarMensagem() {
  const mensagem = document.getElementById('mensagem');
  mensagem.select();
  mensagem.setSelectionRange(0, 99999);
  document.execCommand('copy');
  mostrarToast('Mensagem copiada!');
}

document.getElementById('resetarCobrar').addEventListener('click', function() {
  // Limpa as listas de linhas
  linhas = { vencidas: [], hoje: [], sete: [] };

  // Remove todas as linhas do DOM
  ['vencidas', 'hoje', 'sete'].forEach(tipo => {
    const lista = document.getElementById(`${tipo}-lista`);
    lista.innerHTML = '';
  });

  // Adiciona as linhas iniciais novamente
  ['vencidas', 'hoje', 'sete'].forEach(tipo => {
    adicionarLinha(tipo); // primeira linha (Nota)
    adicionarLinha(tipo); // segunda linha (Boleto)

    // Marca o botão "Boleto" na segunda linha
    const idx = 1; // segunda linha tem índice 1
    const container = document.querySelector(`div[data-tipo="${tipo}"][data-idx="${idx}"]`);
    if (container) {
      const btnNota = container.querySelector('.tipo-btn[data-tipo="Nota"]');
      const btnBoleto = container.querySelector('.tipo-btn[data-tipo="Boleto"]');
      if (btnNota && btnBoleto) {
        btnNota.classList.remove('clicado');
        btnBoleto.classList.add('clicado');
        linhas[tipo][idx].tipoDoc = "Boleto";
      }
    }
  });

  // Limpa a mensagem gerada
  document.getElementById('mensagem').value = '';
});

document.addEventListener('DOMContentLoaded', function() {
  document.querySelectorAll('.linha-cobrar .valor').forEach(input => {
    aplicarMascaraMoeda(input);
  });
});