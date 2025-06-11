const mensagensRef = firebase.database().ref('mensagens_rapidas');
const lista = document.getElementById('listaMensagensRapidas');
const formMensagem = document.getElementById('formMensagemRapida');
const input = document.getElementById('novaMensagem');
const inputTitulo = document.getElementById('tituloMensagem');
const btnAdicionar = formMensagem.querySelector('button[type="submit"]');

// Carregar mensagens do Firebase
function carregarMensagens() {
  mensagensRef.once('value').then(snapshot => {
    lista.innerHTML = '';
    const mensagens = snapshot.val() || [];
    mensagens.forEach((msg, idx) => {
      // msg pode ser string antiga ou objeto novo
      let titulo = '', texto = '';
      if (typeof msg === 'string') {
        texto = msg;
      } else {
        titulo = msg.titulo || '';
        texto = msg.texto || '';
      }
      const li = document.createElement('li');
      li.innerHTML = `
        <span>
          ${titulo ? `<strong>${titulo}</strong><br>` : ''}
          <span style="white-space:pre-line;">${formatarMensagemParaExibir(texto)}</span>
        </span>
        <div class="mensagens-acoes">
          <button onclick="copiarMensagemRapida(\`${texto.replace(/`/g, '\\`')}\`)"><i class="fas fa-copy"></i> Copiar</button>
          <button onclick="editarMensagemRapida(${idx})"><i class="fas fa-edit"></i> Editar</button>
          <button onclick="removerMensagemRapida(${idx})"><i class="fas fa-trash"></i> Remover</button>
        </div>
      `;
      lista.appendChild(li);
    });
  });
}

// Adicionar nova mensagem
formMensagem.onsubmit = function(e) {
  e.preventDefault();
  const titulo = inputTitulo.value.trim();
  const texto = input.value.trim();
  if (!titulo || !texto) return;
  mensagensRef.once('value').then(snapshot => {
    const mensagens = snapshot.val() || [];
    mensagens.push({ titulo, texto });
    mensagensRef.set(mensagens).then(() => {
      input.value = '';
      inputTitulo.value = '';
      input.style.height = 'auto'; // Reseta altura após adicionar
      carregarMensagens();
    });
  });
};

// Copiar mensagem
window.copiarMensagemRapida = function(msg) {
  navigator.clipboard.writeText(msg);
  const toast = document.getElementById('toast');
  if (toast) {
    toast.textContent = 'Mensagem copiada!';
    toast.style.display = 'block';
    setTimeout(() => toast.style.display = 'none', 1200);
  }
};

// Remover mensagem
window.removerMensagemRapida = function(idx) {
  mensagensRef.once('value').then(snapshot => {
    const mensagens = snapshot.val() || [];
    mensagens.splice(idx, 1);
    mensagensRef.set(mensagens).then(carregarMensagens);
  });
};

// Função para editar mensagem
window.editarMensagemRapida = function(idx) {
  mensagensRef.once('value').then(snapshot => {
    const mensagens = snapshot.val() || [];
    const msg = mensagens[idx];
    let titulo = '', texto = '';
    if (typeof msg === 'string') {
      texto = msg;
    } else {
      titulo = msg.titulo || '';
      texto = msg.texto || '';
    }
    // Preenche os campos do formulário com os dados da mensagem
    inputTitulo.value = titulo;
    input.value = texto;
    input.focus();

    // Troca o texto do botão para "Salvar"
    btnAdicionar.innerHTML = '<i class="fas fa-save"></i> Salvar';

    // Ao salvar, substitui a mensagem antiga
    formMensagem.onsubmit = function(e) {
      e.preventDefault();
      const novoTitulo = inputTitulo.value.trim();
      const novoTexto = input.value.trim();
      if (!novoTitulo || !novoTexto) return;
      mensagens[idx] = { titulo: novoTitulo, texto: novoTexto };
      mensagensRef.set(mensagens).then(() => {
        input.value = '';
        inputTitulo.value = '';
        input.style.height = 'auto';
        carregarMensagens();
        // Restaura o comportamento normal do submit (adicionar nova)
        formMensagem.onsubmit = adicionarNovaMensagem;
        // Restaura o texto do botão para "Adicionar"
        btnAdicionar.innerHTML = '<i class="fas fa-plus"></i> Adicionar';
      });
    };
  });
};

// Salvar referência da função original para restaurar depois
const adicionarNovaMensagem = formMensagem.onsubmit;

document.addEventListener('DOMContentLoaded', carregarMensagens);

// Expansão automática do textarea
input.addEventListener('input', function() {
  this.style.height = 'auto';
  this.style.height = (this.scrollHeight) + 'px';
});

function formatarMensagemParaExibir(texto) {
  // Sublinhado primeiro (para evitar conflito com negrito dentro de sublinhado)
  texto = texto.replace(/__(.*?)__/g, '<u>$1</u>');
  // Negrito
  texto = texto.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  return texto;
}