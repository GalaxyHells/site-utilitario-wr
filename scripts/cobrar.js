let chavePix = "05.346.003/0001-00"; // Chave padrão
function setarPix(chave) {
  chavePix = chave;
  // Remove 'clicado' de todos os botões de chave Pix
  document.querySelectorAll('.btn-pix').forEach(btn => btn.classList.remove('clicado'));
  // Adiciona 'clicado' ao botão pressionado
  const btn = document.querySelector(`.btn-pix[data-chave="${chave}"]`);
  if (btn) btn.classList.add('clicado');
}

function criarLinha(tipo, idx) {
  return `
    <div class="linha-cobrar" data-tipo="${tipo}" data-idx="${idx}">
      <input type="number" min="1" placeholder="Qtd." class="qtd" style="width:60px;">
      <input type="text" placeholder="Valor (R$)" class="valor" style="width:110px;">
      <button type="button" class="small-button tipo-btn clicado" data-tipo="Nota">Nota</button>
      <button type="button" class="small-button tipo-btn" data-tipo="Boleto">Boleto</button>
      <button type="button" class="small-button" onclick="removerLinha('${tipo}', ${idx})" style="background:#eee;color:#444;">✕</button>
    </div>
  `;
}

let linhas = { vencidas: [], hoje: [], sete: [] };

function formatarMoeda(valor) {
  valor = valor.replace(/\D/g, "");
  if (!valor) return "";
  valor = (parseInt(valor, 10) / 100).toFixed(2) + "";
  valor = valor.replace(".", ",");
  valor = valor.replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1.");
  return "R$ " + valor;
}

function aplicarMascaraMoeda(input) {
  input.addEventListener("input", function () {
    let val = input.value.replace(/\D/g, "");
    if (val === "") {
      input.value = "";
      return;
    }
    input.value = formatarMoeda(val);
  });
}

function adicionarLinha(tipo) {
  const idx = linhas[tipo].length;
  linhas[tipo].push({ tipoDoc: "Nota", qtd: "", valor: "" });
  document.getElementById(tipo + '-lista').insertAdjacentHTML('beforeend', criarLinha(tipo, idx));
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
  let boletoVencidoOuHoje = false;

  ['vencidas','hoje','sete'].forEach(tipo => {
    linhas[tipo].forEach(linha => {
      if (linha && linha.qtd && linha.valor) {
        let desc = tipo === 'vencidas' ? 'vencida(s)' : tipo === 'hoje' ? 'vencendo hoje' : 'vencendo nos próximos 7 dias';
        const qtdNum = parseInt(linha.qtd, 10);
        const valorTexto = qtdNum > 1 ? "no valor total de" : "no valor de";
        mensagem += `*${linha.qtd}* ${linha.tipoDoc.toLowerCase()}(s) ${desc}, ${valorTexto} *${linha.valor}*.\n`;

        if (linha.tipoDoc === "Boleto") {
          temBoleto = true;
          if (tipo === "vencidas" || tipo === "hoje") {
            boletoVencidoOuHoje = true;
          }
        }
      }
    });
  });

  if (temBoleto) {
    mensagem += `\n*IMPORTANTE:* Boletos devem ser pagos no aplicativo do banco, papelarias ou locais que aceitam pagamento de boletos. Não é possível pagar boletos na loja ou via Pix.\n`;
  } else {
    mensagem += `\nCaso deseje, pode realizar o pagamento via Pix utilizando a chave: *${chavePix}*\n`;
  }

  if (boletoVencidoOuHoje) {
    mensagem += "\n*ATENÇÃO:* Boletos podem ser protestados e gerar negativação do nome após 5 dias do vencimento.\n";
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