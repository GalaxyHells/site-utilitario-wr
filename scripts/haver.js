// Carrega do localStorage ou inicia vazio
const listaHaver = JSON.parse(localStorage.getItem('haver_lista') || '[]');
let quitados = JSON.parse(localStorage.getItem('haver_quitados') || '[]');
const ul = document.getElementById('listaHaver');
const form = document.getElementById('formHaver');

// Salva no localStorage sempre que houver alteração
function salvarHaverLocal() {
  localStorage.setItem('haver_lista', JSON.stringify(listaHaver));
  localStorage.setItem('haver_quitados', JSON.stringify(quitados));
}

// Salva no Firebase sempre que houver alteração
function salvarHaverFirebase() {
  if (typeof firebase === 'undefined' || !firebase.database) return;
  try {
    const db = firebase.database();
    db.ref('haver_lista').set(listaHaver)
      .catch(e => console.error('Erro ao salvar haver_lista:', e));
    db.ref('haver_quitados').set(quitados)
      .catch(e => console.error('Erro ao salvar haver_quitados:', e));
  } catch (e) {
    console.error('Erro ao salvar no Firebase:', e);
  }
}

// Cria/atualiza o campo de quitados
function renderizarQuitados() {
  let divQuitados = document.getElementById('areaQuitados');
  if (!divQuitados) {
    divQuitados = document.createElement('div');
    divQuitados.id = 'areaQuitados';
    ul.parentNode.appendChild(divQuitados);
  }
  if (!quitados.length) {
    divQuitados.innerHTML = '';
    return;
  }
  divQuitados.innerHTML = `
    <details style="margin-top:1.5rem;">
      <summary style="cursor:pointer; font-weight:bold; color:#888; font-size:1rem;">
        Haveres quitados (${quitados.length}) <span style="font-size:0.95em;">(mostrar/esconder)</span>
      </summary>
      <ul style="list-style:none; padding:0; margin-top:1em;">
        ${quitados.map(item => `
          <li style="
            margin-bottom: 0.7rem;
            background: #f4f4f4;
            border-left: 5px solid #bbb;
            padding: 0.7rem 1rem;
            border-radius: 8px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.04);
            color: #888;
          ">
            <div>
              <div style="font-size:1.05rem;">
                <strong>${item.nome}</strong>
                ${item.tipo === 'devendo' ? '<span style="color:#e63946;">nos devia</span>' : '<span style="color:#2ecc40;">tínhamos que pagar</span>'}
                <strong>R$ 0,00</strong>
              </div>
              ${item.desc ? `<div style="color:#aaa; font-size:0.97rem; margin-top:2px;">${item.desc}</div>` : ''}
              ${item.historico && item.historico.length ? `
                <details style="margin-top:6px;">
                  <summary style="cursor:pointer; color:#aaa; font-size:0.97rem;">Histórico</summary>
                  <ul style="margin:0.5em 0 0 1em; padding:0; font-size:0.97rem; color:#888;">
                    ${item.historico.map(h => `
                      <li style="margin-bottom:0.5em;">
                        [${h.data}] 
                        ${h.tipo === 'abatimento' ? '<span style="color:#e63946;">Abatido</span>' : '<span style="color:#00796b;">Adicionado</span>'}
                        R$ ${h.valor.toFixed(2).replace('.', ',')}
                        ${h.motivo ? `<br><span style="color:#888;">${h.motivo}</span>` : ''}
                      </li>
                    `).join('')}
                  </ul>
                </details>
              ` : ''}
            </div>
          </li>
        `).join('')}
      </ul>
    </details>
  `;
}

form.onsubmit = function(e) {
  e.preventDefault();
  const nome = document.getElementById('nomeCliente').value.trim();
  let valorStr = document.getElementById('valorHaver').value;
  valorStr = valorStr.replace(/[^\d,]/g, '').replace(',', '.');
  const valor = parseFloat(valorStr);
  const tipo = document.getElementById('tipoHaver').value;
  const desc = document.getElementById('descricaoHaver').value.trim();

  if (!nome || isNaN(valor) || valor <= 0) return;

  // Verifica se já existe cliente com mesmo nome e tipo
  const idx = listaHaver.findIndex(item => item.nome.toLowerCase() === nome.toLowerCase() && item.tipo === tipo);
  if (idx >= 0) {
    listaHaver[idx].valor += valor;
    if (desc) listaHaver[idx].desc += ` | ${desc}`;
    listaHaver[idx].historico = listaHaver[idx].historico || [];
    listaHaver[idx].historico.push({
      tipo: 'adicao',
      valor: valor,
      data: new Date().toLocaleString(),
      motivo: desc
    });
  } else {
    listaHaver.push({
      nome,
      valor,
      tipo,
      desc,
      historico: [{
        tipo: 'adicao',
        valor: valor,
        data: new Date().toLocaleString(),
        motivo: desc
      }]
    });
  }
  renderizarLista();
  salvarHaverLocal();
  salvarHaverFirebase();
  form.reset();
};

function renderizarLista() {
  ul.innerHTML = '';
  listaHaver.forEach((item, idx) => {
    const li = document.createElement('li');
    li.style = `
      margin-bottom: 0.7rem;
      background: ${item.tipo === 'devendo' ? '#ffeaea' : '#eaffea'};
      border-left: 5px solid ${item.tipo === 'devendo' ? '#e63946' : '#2ecc40'};
      padding: 0.7rem 1rem;
      border-radius: 8px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.07);
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      gap: 1rem;
    `;
    li.innerHTML = `
      <div>
        <div style="font-size:1.1rem;">
          <strong>${item.nome}</strong>
          ${item.tipo === 'devendo' ? '<span style="color:#e63946;">nos deve</span>' : '<span style="color:#2ecc40;">temos que pagar</span>'}
          <strong>R$ ${item.valor.toFixed(2).replace('.', ',')}</strong>
        </div>
        ${item.desc ? `<div style="color:#555; font-size:0.97rem; margin-top:2px;">${item.desc}</div>` : ''}
        ${item.historico && item.historico.length ? `
          <details style="margin-top:6px;">
            <summary style="cursor:pointer; color:#888; font-size:0.97rem;">Histórico</summary>
            <ul style="margin:0.5em 0 0 1em; padding:0; font-size:0.97rem; color:#444;">
              ${item.historico.map(h => `
                <li style="margin-bottom:0.5em;">
                  [${h.data}] 
                  ${h.tipo === 'abatimento' ? '<span style="color:#e63946;">Abatido</span>' : '<span style="color:#00796b;">Adicionado</span>'}
                  R$ ${h.valor.toFixed(2).replace('.', ',')}
                  ${h.motivo ? `<br><span style="color:#555;">${h.motivo}</span>` : ''}
                </li>
              `).join('')}
            </ul>
          </details>
        ` : ''}
      </div>
      <div style="display:flex; flex-direction:column; gap:0px; align-items:end;">
        <button onclick="abrirModalAbater(${idx})" style="background:#fff3cd; color:#b8860b; border:none; border-radius:4px; padding:4px 10px; cursor:pointer; font-size:0.95rem;">Abater</button>
        <button onclick="abrirModalAdicionar(${idx})" style="background:#e0f7fa; color:#00796b; border:none; border-radius:4px; padding:4px 10px; cursor:pointer; font-size:0.95rem;">Adicionar</button>
        <button onclick="removerHaver(${idx})" style="background:#eee; color:#444; border:none; border-radius:4px; padding:4px 10px; cursor:pointer; font-size:0.95rem;">Remover</button>
      </div>
    `;
    ul.appendChild(li);
  });
  renderizarQuitados();
  salvarHaverLocal();
  // Remova esta linha:
  // salvarHaverFirebase();
}

// Modal simples para abater valor
window.abrirModalAbater = function(idx) {
  const valor = prompt(`Quanto deseja abater de "${listaHaver[idx].nome}"?`);
  const v = parseFloat(valor);
  if (!isNaN(v) && v > 0) {
    let motivo = prompt("Descrição do abatimento (opcional):") || '';
    listaHaver[idx].valor -= v;
    listaHaver[idx].historico = listaHaver[idx].historico || [];
    listaHaver[idx].historico.push({
      tipo: 'abatimento',
      valor: v,
      data: new Date().toLocaleString(),
      motivo
    });
    if (listaHaver[idx].valor <= 0) {
      // Move para quitados
      const quitado = { ...listaHaver[idx], valor: 0 };
      quitados.push(quitado);
      listaHaver.splice(idx, 1);
    }
    renderizarLista();
    salvarHaverLocal();
    salvarHaverFirebase(); // aqui pode!
  }
};

// Modal simples para adicionar valor
window.abrirModalAdicionar = function(idx) {
  const valor = prompt(`Quanto deseja adicionar para "${listaHaver[idx].nome}"?`);
  const v = parseFloat(valor);
  if (!isNaN(v) && v > 0) {
    let motivo = prompt("Descrição da adição (opcional):") || '';
    listaHaver[idx].valor += v;
    listaHaver[idx].historico = listaHaver[idx].historico || [];
    listaHaver[idx].historico.push({
      tipo: 'adicao',
      valor: v,
      data: new Date().toLocaleString(),
      motivo
    });
    renderizarLista();
    salvarHaverLocal();
    salvarHaverFirebase(); // aqui pode!
  }
};

window.removerHaver = function(idx) {
  if (confirm('Remover este haver?')) {
    listaHaver.splice(idx, 1);
    renderizarLista();
    salvarHaverLocal();
    salvarHaverFirebase(); // aqui pode!
  }
};

// Função para carregar do Firebase
function carregarHaverFirebase() {
  if (typeof firebase === 'undefined' || !firebase.database) {
    // Firebase não disponível, carrega do localStorage
    renderizarLista();
    renderizarQuitados();
    return;
  }
  const db = firebase.database();
  db.ref('haver_lista').once('value').then(snapshot => {
    const data = snapshot.val();
    if (data && Array.isArray(data) && data.length > 0) {
      listaHaver.length = 0;
      data.forEach(item => listaHaver.push(item));
    } else {
      // Se não houver dados no Firebase, usa localStorage
      listaHaver.length = 0;
      JSON.parse(localStorage.getItem('haver_lista') || '[]').forEach(item => listaHaver.push(item));
    }
    renderizarLista();
  });
  db.ref('haver_quitados').once('value').then(snapshot => {
    const data = snapshot.val();
    if (data && Array.isArray(data) && data.length > 0) {
      quitados.length = 0;
      data.forEach(item => quitados.push(item));
    } else {
      // Se não houver dados no Firebase, usa localStorage
      quitados.length = 0;
      JSON.parse(localStorage.getItem('haver_quitados') || '[]').forEach(item => quitados.push(item));
    }
    renderizarQuitados();
  });
}

// Chame isso ao iniciar a página
window.addEventListener('DOMContentLoaded', carregarHaverFirebase);

//renderizarLista();