// Inicializa os catálogos no localStorage
//window.catalogosCache = null;
import { carregarCatalogosComCache } from "./cache.js";
window.selecionarCatalogo = selecionarCatalogo;
window.editarCatalogo = editarCatalogo;
window.excluirCatalogo = excluirCatalogo;
window.removerProduto = removerProduto;
window.editarProduto = editarProduto;

// Função para renderizar a lista de catálogos
async function renderizarCatalogos() {
  const lista = document.getElementById("listaCatalogos");
  lista.innerHTML = ""; // Limpa a lista

  const catalogos = await carregarCatalogosComCache();

  catalogos.forEach((catalogo, index) => {
    const div = document.createElement("div");
    div.className = "catalogo-item";

    // Conta os produtos no catálogo
    const totalProdutos = catalogo.produtos ? catalogo.produtos.length : 0;

    div.innerHTML = `
      <h4>${catalogo.nome}</h4>
      <p>${totalProdutos} produto(s)</p>
      <div class="catalogo-actions">
        <button title="Selecionar" onclick="selecionarCatalogo(${index})">
          <i class="fas fa-check-circle"></i>
        </button>
        <button title="Editar" onclick="editarCatalogo(${index})">
          <i class="fas fa-edit"></i>
        </button>
        <button title="Excluir" onclick="excluirCatalogo(${index})">
          <i class="fas fa-trash-alt"></i>
        </button>
      </div>
    `;

    lista.appendChild(div);

    const select = document.getElementById("selecionarCatalogo");
    if (select) {
      select.innerHTML = '<option value="">Selecione um catálogo</option>';
      catalogos.forEach((c, i) => {
        const option = document.createElement("option");
        option.value = i;
        option.textContent = c.nome;
        select.appendChild(option);
      });
    }
  });
}

// Função para adicionar ou editar um catálogo
document.getElementById("formCriarCatalogo").addEventListener("submit", async function (e) {
  e.preventDefault();

  const nome = document.getElementById("nomeCatalogo").value;
  const index = this.dataset.index;
  const catalogos = await carregarCatalogosComCache();

  if (index !== undefined) {
    catalogos[index].nome = nome;
    delete this.dataset.index;
  } else {
    catalogos.push({ nome, produtos: [] });
  }

  await salvarCatalogosNoFirebase(catalogos);
  await renderizarCatalogos();
  this.reset();
});


// Função para editar um catálogo
async function editarCatalogo(index) {
  const catalogos = await carregarCatalogosComCache();
  const catalogo = catalogos[index];

  // Preenche o formulário com os dados do catálogo
  document.getElementById("nomeCatalogo").value = catalogo.nome;

  // Salva o índice para edição
  const form = document.getElementById("formCriarCatalogo");
  form.dataset.index = index;
}

// Função para excluir um catálogo
async function excluirCatalogo(index) {
  const catalogos = await carregarCatalogosComCache();
  catalogos.splice(index, 1); // Remove o catálogo do array
  await salvarCatalogosNoFirebase(catalogos); // Atualiza no Firebase
  window.catalogosCache = catalogos; // Atualiza o cache local

  renderizarCatalogos(); // Atualiza a lista de catálogos

  // Limpa a lista de produtos e mostra "VAZIO"
  const listaProdutos = document.getElementById("listaProdutos");
  if (listaProdutos) {
    listaProdutos.innerHTML = `
      <div class="produto-item" style="opacity:0.6;display:flex;align-items:center;justify-content:center;height:120px;">
        <span style="font-size:1.2rem;">VAZIO</span>
      </div>
    `;
  }

  // Remove do select da ferramenta7 (ajuste o id se necessário)
  const select = document.getElementById("selecionarCatalogo");
  if (select) {
    select.innerHTML = '<option value="">Selecione um catálogo</option>';
    catalogos.forEach((c, i) => {
      const option = document.createElement("option");
      option.value = i;
      option.textContent = c.nome;
      select.appendChild(option);
    });
  }
}

// Função para renderizar os produtos de um catálogo
async function renderizarProdutos(catalogoIndex) {
  const lista = document.getElementById("listaProdutos");
  lista.innerHTML = ""; // Limpa a lista

  const catalogos = await carregarCatalogosComCache();
  const produtos = catalogos[catalogoIndex]?.produtos || [];

  if (produtos.length === 0) {
    // Mostra card "VAZIO" se não houver produtos
    const vazioDiv = document.createElement("div");
    vazioDiv.className = "produto-item";
    vazioDiv.style.opacity = "0.6";
    vazioDiv.style.display = "flex";
    vazioDiv.style.alignItems = "center";
    vazioDiv.style.justifyContent = "center";
    vazioDiv.style.height = "120px";
    vazioDiv.innerHTML = `<span style="font-size:1.2rem;">VAZIO</span>`;
    lista.appendChild(vazioDiv);
    return;
  }

  produtos.forEach((produto, index) => {
    const div = document.createElement("div");
    div.className = "produto-item";

    // Formata o preço para BRL
    let precoFormatado = "";
    if (produto.preco) {
      let precoNum = parseFloat(
        produto.preco
          .replace(/[^\d,\.]/g, "")
          .replace(",", ".")
      );
      if (!isNaN(precoNum)) {
        precoFormatado = precoNum.toLocaleString("pt-BR", {
          style: "currency",
          currency: "BRL",
        });
      } else {
        precoFormatado = produto.preco;
      }
    }
    document.getElementById("precoProduto").value = precoFormatado;
    // Usa imagem padrão se não houver imagem definida
    const imagemSrc = produto.imagem && produto.imagem.trim() !== ""
      ? produto.imagem
      : "images/product-placeholder.png";

    // Mostra disponibilidade (opcional)
    const disponivel = produto.disponivel !== false; // default true

    div.innerHTML = `
      <h4>${produto.nome}</h4>
      <img src="${imagemSrc}" alt="${produto.nome}" onerror="this.src='images/product-placeholder.png'; this.style.backgroundColor='#000';">
      <p>${precoFormatado}</p>
      <p style="font-size:0.95em; color:${disponivel ? '#2a7d2a' : '#b00'};">
        ${disponivel ? 'Disponível' : 'Indisponível'}
      </p>
      <div class="produto-actions">
        <button title="Editar" onclick="editarProduto(${catalogoIndex}, ${index})">
          <i class="fas fa-edit"></i>
        </button>
        <button title="Excluir" onclick="removerProduto(${catalogoIndex}, ${index})">
          <i class="fas fa-trash-alt"></i>
        </button>
      </div>
    `;

    lista.appendChild(div);
  });
}

// Função para editar um produto
async function editarProduto(catalogoIndex, produtoIndex) {
  const catalogos = await carregarCatalogosComCache();
  const produto = catalogos[catalogoIndex].produtos[produtoIndex];

  // Preenche o formulário com os dados do produto
  document.getElementById("nomeProduto").value = produto.nome;
  document.getElementById("imagemProduto").value = produto.imagem;
  document.getElementById("descricaoProduto").value = Array.isArray(produto.descricao)
  ? produto.descricao.join("\n")
  : (produto.descricao || "");
  let precoFormatado = "";
  if (produto.preco) {
    let precoNum = parseFloat(
      produto.preco
        .replace(/[^\d,\.]/g, "")
        .replace(",", ".")
    );
    if (!isNaN(precoNum)) {
      precoFormatado = precoNum.toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL",
      });
    } else {
      precoFormatado = produto.preco;
    }
  }
  document.getElementById("precoProduto").value = precoFormatado;

  // Preenche o checkbox de disponibilidade
  document.getElementById("disponivelProduto").checked = produto.disponivel !== false;

  // Salva os índices no formulário para edição
  const form = document.getElementById("formCriarProduto");
  form.dataset.catalogoIndex = catalogoIndex;
  form.dataset.produtoIndex = produtoIndex;

  // Troca o texto do botão para "Salvar"
  document.getElementById("botaoProduto").textContent = "Salvar";
  document.getElementById("botaoCancelar").style.display = "inline-block";
}

// Função para adicionar ou editar um produto
document.getElementById("formCriarProduto").addEventListener("submit", async function (e) {
  e.preventDefault();

  const nome = document.getElementById("nomeProduto").value;
  const imagem = document.getElementById("imagemProduto").value;
  const preco = document.getElementById("precoProduto").value;
  const descricao = document.getElementById("descricaoProduto").value.split("\n"); // Divide a descrição em linhas
  const disponivel = document.getElementById("disponivelProduto").checked;

  const catalogoIndex = this.dataset.catalogoIndex; // Obtém o índice do catálogo selecionado
  const produtoIndex = this.dataset.produtoIndex; // Verifica se é uma edição

  const catalogos = await carregarCatalogosComCache();

  if (produtoIndex !== undefined) {
    // Edita o produto existente
    catalogos[catalogoIndex].produtos[produtoIndex] = { nome, imagem, preco, descricao, disponivel };
    delete this.dataset.produtoIndex; // Remove o índice após a edição
  } else {
    if (!catalogos[catalogoIndex]) {
      alert("Selecione um catálogo válido!");
      return;
    }
    if (!Array.isArray(catalogos[catalogoIndex].produtos)) {
      catalogos[catalogoIndex].produtos = [];
    }
    catalogos[catalogoIndex].produtos.push({ nome, imagem, preco, descricao, disponivel });
  }

  // Salva no localStorage
  salvarCatalogosNoFirebase(catalogos);

  // Atualiza a lista de produtos
  renderizarProdutos(catalogoIndex);

  // Limpa o formulário
  this.reset();

  // Volta o texto do botão para "Adicionar Produto"
  document.getElementById("botaoProduto").textContent = "Adicionar Produto";
  document.getElementById("botaoCancelar").style.display = "none";
});

// Função para remover um produto
async function removerProduto(catalogoIndex, produtoIndex) {
  const catalogos = await carregarCatalogosComCache();
  catalogos[catalogoIndex].produtos.splice(produtoIndex, 1); // Remove o produto do array
  salvarCatalogosNoFirebase(catalogos); // Atualiza o localStorage
  renderizarProdutos(catalogoIndex); // Atualiza a lista
}

// Renderiza os catálogos ao carregar a página
document.addEventListener("DOMContentLoaded", renderizarCatalogos);

document.getElementById("selecionarCatalogo").addEventListener("change", function () {
  const catalogoIndex = this.value;
  if (catalogoIndex === "") return;

  renderizarProdutos(catalogoIndex);
});

function selecionarCatalogo(index) {
  const form = document.getElementById("formCriarProduto");
  form.dataset.catalogoIndex = index; // Salva o índice do catálogo selecionado

  // Renderiza os produtos do catálogo selecionado
  renderizarProdutos(index);

  // Exibe o formulário de produtos
  //document.getElementById("listaProdutos").style.display = "block";
}

// Formata o valor do input de preço em tempo real para o padrão brasileiro
document.getElementById('precoProduto').addEventListener('input', function(e) {
  let value = e.target.value.replace(/\D/g, ''); // Remove tudo que não for dígito
  value = (parseInt(value, 10) || 0).toString();

  if (value.length === 0) {
    e.target.value = '';
    return;
  }

  // Adiciona zeros à esquerda se necessário
  while (value.length < 3) value = '0' + value;

  let intPart = value.slice(0, value.length - 2);
  let decimalPart = value.slice(-2);

  // Formata parte inteira com pontos
  intPart = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ".");

  e.target.value = `R$ ${intPart},${decimalPart}`;
});

document.getElementById("descricaoProduto").addEventListener("input", function(e) {
  const linhas = this.value.split("\n");
  if (linhas.length > 4) {
    this.value = linhas.slice(0, 4).join("\n");
  }
});

document.getElementById("botaoCancelar").addEventListener("click", function() {
  const form = document.getElementById("formCriarProduto");
  form.reset();
  delete form.dataset.produtoIndex;
  document.getElementById("botaoProduto").textContent = "Adicionar Produto";
  this.style.display = "none";
});

document.getElementById("fileImagemProduto").addEventListener("change", function(e) {
  const file = e.target.files[0];
  if (!file) return;

  // Cria uma URL temporária para pré-visualização/local
  const url = URL.createObjectURL(file);
  document.getElementById("imagemProduto").value = url;

  // Opcional: mostrar prévia da imagem (adicione um <img id="previewImagemProduto"> no HTML se quiser)
  // document.getElementById("previewImagemProduto").src = url;
});

// Salvar catálogos no Firebase
async function salvarCatalogosNoFirebase(catalogos) {
  await firebase.database().ref('catalogos').set(catalogos);
  window.catalogosCache = catalogos; // Atualiza o cache local
}

// Carregar catálogos do Firebase
async function carregarCatalogosDoFirebase() {
  const snapshot = await firebase.database().ref('catalogos').once('value');
  return snapshot.val() || [];
}

// export async function carregarCatalogosComCache() {
//   if (window.catalogosCache !== null) {
//     return window.catalogosCache;
//   }
//   const snapshot = await firebase.database().ref('catalogos').once('value');
//   window.catalogosCache = snapshot.val() || [];
//   return window.catalogosCache;
// }