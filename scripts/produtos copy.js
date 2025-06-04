// scripts/listas-produtos.js

// Estrutura de dados: [{nome: string, itens: [{nome, preco, descricao}]}]
let listasProdutos = JSON.parse(localStorage.getItem('listasProdutosWR') || '[]');
let listaEditandoIdx = null;

function renderizarListasProdutos() {
  const container = document.getElementById('listasProdutos');
  if (!container) return;
  container.innerHTML = '';
  if (listasProdutos.length === 0) {
    container.innerHTML = '<p style="color:#888;">Nenhuma lista criada ainda.</p>';
    return;
  }
  listasProdutos.forEach((lista, idx) => {
    const div = document.createElement('div');
    div.className = 'lista-produto-card';
    div.style = 'background:#f8f8fa; border-radius:8px; box-shadow:0 2px 8px rgba(0,0,0,0.06); padding:1rem; margin-bottom:1.2rem;';
    div.innerHTML = `
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:0.5rem;">
        <strong>${lista.nome || 'Lista sem nome'}</strong>
        <div style="display:flex; gap:0.5rem;">
          <button class="small-button" onclick="editarListaProdutos(${idx})">Editar</button>
          <button class="small-button" onclick="copiarListaProdutos(${idx})">Copiar</button>
          <button class="small-button" onclick="excluirListaProdutos(${idx})">Excluir</button>
        </div>
      </div>
      <ul style="list-style:none; padding:0; margin:0;">
        ${lista.itens.map(item => `
          <li style="margin-bottom:0.5rem;">
            <span style="font-weight:500;">${item.nome}</span> - <span style="color:#1a8917;">R$ ${item.preco}</span><br>
            <span style="font-size:0.95em; color:#555;">${item.descricao || ''}</span>
          </li>
        `).join('')}
      </ul>
    `;
    container.appendChild(div);
  });
}

function salvarListasProdutos() {
  localStorage.setItem('listasProdutosWR', JSON.stringify(listasProdutos));
}

document.getElementById('btnNovaLista').onclick = function() {
  listaEditandoIdx = null;
  abrirModalLista({nome:'', itens:[]});
};

function editarListaProdutos(idx) {
  listaEditandoIdx = idx;
  abrirModalLista(listasProdutos[idx]);
}

function excluirListaProdutos(idx) {
  if (confirm('Excluir esta lista?')) {
    listasProdutos.splice(idx, 1);
    salvarListasProdutos();
    renderizarListasProdutos();
  }
}

function copiarListaProdutos(idx) {
  const lista = listasProdutos[idx];
  let texto = `*${lista.nome}*\n`;
  lista.itens.forEach(item => {
    texto += `* ${item.nome} - R$ ${item.preco}\n-> ${item.descricao || ''}\n`;
  });
  navigator.clipboard.writeText(texto.trim());
  mostrarToast('Lista copiada!');
}

// Modal de edição
function abrirModalLista(lista) {
  document.getElementById('modalEditarLista').style.display = 'flex';
  document.getElementById('nomeLista').value = lista.nome || '';
  renderizarItensLista(lista.itens);
}

function renderizarItensLista(itens) {
  const div = document.getElementById('itensLista');
  div.innerHTML = '';
  itens.forEach((item, idx) => {
    const linha = document.createElement('div');
    linha.style = 'display:flex; gap:0.5rem; margin-bottom:0.5rem; align-items:center;';
    linha.innerHTML = `
      <input type="text" placeholder="Nome" value="${item.nome}" style="flex:2;">
      <input type="text" placeholder="Preço" value="${item.preco}" style="width:80px;">
      <input type="text" placeholder="Descrição" value="${item.descricao || ''}" style="flex:3;">
      <button class="small-button" onclick="removerItemLista(${idx})">🗑️</button>
    `;
    div.appendChild(linha);
  });
  // Salva referência dos itens em memória temporária
  div.dataset.itens = JSON.stringify(itens);
}

document.getElementById('btnAdicionarItem').onclick = function() {
  const div = document.getElementById('itensLista');
  let itens = JSON.parse(div.dataset.itens || '[]');
  itens.push({nome:'', preco:'', descricao:''});
  renderizarItensLista(itens);
};

window.removerItemLista = function(idx) {
  const div = document.getElementById('itensLista');
  let itens = JSON.parse(div.dataset.itens || '[]');
  itens.splice(idx, 1);
  renderizarItensLista(itens);
};

document.getElementById('btnSalvarLista').onclick = function() {
  const nome = document.getElementById('nomeLista').value.trim();
  const div = document.getElementById('itensLista');
  let itens = [];
  Array.from(div.children).forEach(linha => {
    const inputs = linha.querySelectorAll('input');
    if (inputs[0].value.trim()) {
      itens.push({
        nome: inputs[0].value.trim(),
        preco: inputs[1].value.trim(),
        descricao: inputs[2].value.trim()
      });
    }
  });
  if (!nome) {
    alert('Dê um nome para a lista!');
    return;
  }
  if (itens.length === 0) {
    alert('Adicione pelo menos um item!');
    return;
  }
  if (listaEditandoIdx === null) {
    listasProdutos.push({nome, itens});
  } else {
    listasProdutos[listaEditandoIdx] = {nome, itens};
  }
  salvarListasProdutos();
  renderizarListasProdutos();
  fecharModalLista();
};

document.getElementById('btnCancelarEdicao').onclick = fecharModalLista;

function fecharModalLista() {
  document.getElementById('modalEditarLista').style.display = 'none';
}

function mostrarToast(msg) {
  const toast = document.getElementById('toast');
  toast.innerText = msg;
  toast.style.display = 'block';
  setTimeout(() => { toast.style.display = 'none'; }, 1800);
}

document.addEventListener('DOMContentLoaded', renderizarListasProdutos);
