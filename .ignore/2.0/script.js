function mostrarFerramenta(id) {
  document.querySelectorAll('.ferramenta').forEach(el => {
    el.classList.remove('ativa');
  });

  document.querySelectorAll('.tab-button').forEach(btn => {
    btn.classList.remove('active');
  });

  document.getElementById(id).classList.add('ativa');
  const index = ['cobrar', 'ferramenta2', 'ferramenta3'].indexOf(id);
  document.querySelectorAll('.tab-button')[index].classList.add('active');
}

function gerarMensagem() {
  const qtd = document.getElementById('quantidade').value;
  const valorInput = document.getElementById('valor').value;
  if (!qtd || !valorInput) {
    alert('Preencha todos os campos.');
    return;
  }
  const valor = parseFloat(valorInput).toFixed(2).replace('.', ',');
  const mensagem = `*Bom dia,*\n\nO(a) senhor(a) tem *${qtd}* nota(s) vencendo hoje, no valor de *R$ ${valor}*.\nCaso deseje, pode realizar o pagamento via Pix utilizando a chave: *goloni.goloni@hotmail.com*\n\nAtenciosamente,\n*WR - Materiais para Construção*\n\n_Esta é uma mensagem automática. Em caso de dúvidas, entre em contato conosco._`;
  document.getElementById('mensagem').value = mensagem;
}

function copiarMensagem() {
  const mensagem = document.getElementById('mensagem');
  mensagem.select();
  mensagem.setSelectionRange(0, 99999);
  document.execCommand('copy');
  alert('Mensagem copiada!');
}