const faltaRef = firebase.database().ref('coisas_em_falta');
const listaFalta = document.getElementById('listaFalta');
const formFalta = document.getElementById('formFalta');
const inputProduto = document.getElementById('produtoFalta');
const btnAdicionarFalta = formFalta.querySelector('button[type="submit"]');
let editandoIdx = null;

function renderizarFalta() {
  faltaRef.once('value').then(snapshot => {
    const itens = snapshot.val() || [];
    listaFalta.innerHTML = '';
    itens.forEach((item, idx) => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${idx + 1}</td>
        <td>${item.produto || ''}</td>
        <td>${item.dataAdicao || ''}</td>
        <td>${item.dataCompra || ''}</td>
        <td>
          <input type="checkbox" ${item.comprado ? 'checked' : ''} onchange="marcarCompradoFalta(${idx}, this.checked)">
        </td>
        <td>
          <button onclick="editarFalta(${idx})"><i class="fas fa-edit"></i></button>
          <button onclick="excluirFalta(${idx})"><i class="fas fa-trash"></i></button>
        </td>
      `;
      listaFalta.appendChild(tr);
    });
  });
}

window.marcarCompradoFalta = function(idx, checked) {
  faltaRef.once('value').then(snapshot => {
    const itens = snapshot.val() || [];
    itens[idx].comprado = checked;
    itens[idx].dataCompra = checked ? new Date().toLocaleDateString() : '';
    faltaRef.set(itens).then(renderizarFalta);
  });
};

window.excluirFalta = function(idx) {
  if (!confirm('Excluir este item?')) return;
  faltaRef.once('value').then(snapshot => {
    const itens = snapshot.val() || [];
    itens.splice(idx, 1);
    faltaRef.set(itens).then(renderizarFalta);
  });
};

window.editarFalta = function(idx) {
  faltaRef.once('value').then(snapshot => {
    const itens = snapshot.val() || [];
    const item = itens[idx];
    inputProduto.value = item.produto;
    inputProduto.focus();
    btnAdicionarFalta.innerHTML = '<i class="fas fa-save"></i> Salvar';
    editandoIdx = idx;
  });
};

formFalta.onsubmit = function(e) {
  e.preventDefault();
  const produto = inputProduto.value.trim();
  if (!produto) return;
  faltaRef.once('value').then(snapshot => {
    const itens = snapshot.val() || [];
    if (editandoIdx !== null) {
      // Editando
      itens[editandoIdx].produto = produto;
      editandoIdx = null;
      btnAdicionarFalta.innerHTML = '<i class="fas fa-plus"></i> Adicionar';
    } else {
      // Adicionando novo
      const dataAdicao = new Date().toLocaleDateString();
      itens.push({ produto, dataAdicao, dataCompra: '', comprado: false });
    }
    faltaRef.set(itens).then(() => {
      inputProduto.value = '';
      renderizarFalta();
    });
  });
};

document.addEventListener('DOMContentLoaded', renderizarFalta);