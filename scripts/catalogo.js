import { carregarCatalogosComCache } from "./cache.js";

// Atualiza o seletor de catálogos
function atualizarSeletorCatalogos() {
  const catalogos = JSON.parse(localStorage.getItem("catalogos")) || [];
  const seletor = document.getElementById("selecionarCatalogo");
  seletor.innerHTML = '<option value="">Selecione um Catálogo</option>'; // Limpa o seletor

  catalogos.forEach((catalogo, index) => {
    const option = document.createElement("option");
    option.value = index;
    option.textContent = catalogo.nome;
    seletor.appendChild(option);
  });
}

// Carrega os produtos do catálogo selecionado
document.getElementById("selecionarCatalogo").addEventListener("change", async function () {
  const index = this.value;
  if (index === "") return;

  //const catalogos = JSON.parse(localStorage.getItem("catalogos")) || [];
  const catalogos = await carregarCatalogosComCache();
  const catalogo = catalogos[index];

  const grid = document.getElementById("catalogoGrid");
  grid.innerHTML = ""; // Limpa o grid

  catalogo.produtos.forEach(item => {
    // Define o estilo do card se indisponível
    const indisponivel = item.disponivel === false;
    const cardStyle = indisponivel
      ? "background:rgb(202,202,202); opacity:0.7; filter:grayscale(0.3);"
      : "";

    const div = document.createElement("div");
    div.className = "catalogo-item";
    div.style = cardStyle;

    // Usa imagem padrão se não houver imagem definida
    const imagemSrc = item.imagem && item.imagem.trim() !== ""
      ? item.imagem
      : "images/product-placeholder.png";

    const precoFormatado = (() => {
      let precoNum = parseFloat(
        (item.preco || "")
          .replace(/[^\d,\.]/g, "")
          .replace(",", ".")
      );
      if (!isNaN(precoNum)) {
        return precoNum.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
      }
      return item.preco || "";
    })();

    // Adicione esta linha para mostrar disponibilidade
    const disponibilidade = item.disponivel !== false
      ? '<span style="color:#2a7d2a;font-weight:bold;">Disponível</span>'
      : '<span style="color:#b00;font-weight:bold;">Indisponível</span>';

    div.innerHTML = `
      <h3>${item.nome}</h3>
      <img src="${imagemSrc}" alt="${item.nome}" onerror="this.src='images/product-placeholder.png';">
      <p class="preco">${precoFormatado}</p>
      <p>${item.descricao[0] || ""}</p>
      <p>${item.descricao[1] || ""}</p>
      <p>${item.descricao[2] || ""}</p>
      <p>${item.descricao[3] || ""}</p>
      <p>${disponibilidade}</p>
    `;

    grid.appendChild(div);
  });
});

// Carrega os produtos do localStorage
const catalogo = JSON.parse(localStorage.getItem("catalogoProdutos")) || [];

// Função para gerar o catálogo
function gerarCatalogo() {
  const grid = document.getElementById("catalogoGrid");
  grid.innerHTML = ""; // Limpa o grid

  catalogo.forEach(item => {
    const div = document.createElement("div");
    div.className = "catalogo-item";

    const imagemSrc = item.imagem && item.imagem.trim() !== ""
      ? item.imagem
      : "images/product-placeholder.png";

    const precoFormatado = (() => {
      let precoNum = parseFloat(
        (item.preco || "")
          .replace(/[^\d,\.]/g, "")
          .replace(",", ".")
      );
      if (!isNaN(precoNum)) {
        return precoNum.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
      }
      return item.preco || "";
    })();

    div.innerHTML = `
      <h3>${item.nome}</h3>
      <img src="${imagemSrc}" alt="${item.nome}" onerror="this.src='images/product-placeholder.png';">
      <p class="preco">${precoFormatado}</p>
      <p>${item.descricao[0] || ""}</p>
      <p>${item.descricao[1] || ""}</p>
      <p>${item.descricao[2] || ""}</p>
      <p>${item.descricao[3] || ""}</p>
    `;

    grid.appendChild(div);
  });
}

// Função para compartilhar o catálogo via WhatsApp (agora copia para a área de transferência)
function compartilharCatalogo() {
    let mensagem = "*Catálogo de Produtos:*\n\n";
  
    catalogo.forEach(item => {
      mensagem += `*${item.nome}*\n`;
      mensagem += `Preço: ${item.preco}\n`;
      item.descricao.forEach(linha => {
        mensagem += `- ${linha}\n`;
      });
      mensagem += `\n`;
    });
  
    // Copia a mensagem para a área de transferência
    navigator.clipboard.writeText(mensagem).then(() => {
      // Exibe um aviso de que a mensagem foi copiada
      const toast = document.getElementById("toast");
      toast.style.display = "block";
      setTimeout(() => {
        toast.style.display = "none";
      }, 3000);
    }).catch(err => {
      console.error("Erro ao copiar para a área de transferência: ", err);
    });
  }

// Inicializa o catálogo e adiciona evento ao botão de compartilhar
document.addEventListener("DOMContentLoaded", () => {
  gerarCatalogo();
  document.getElementById("compartilharCatalogo").addEventListener("click", compartilharCatalogo);
});

// document.getElementById("capturarCatalogo").addEventListener("click", function () {
//   const catalogoDiv = document.getElementById("catalogoGrid");
//   const imgs = catalogoDiv.querySelectorAll('img');
//   let loaded = 0;
//   if (imgs.length === 0) capturar();
//   imgs.forEach(img => {
//     if (img.complete) {
//       loaded++;
//       if (loaded === imgs.length) capturar();
//     } else {
//       img.onload = img.onerror = () => {
//         loaded++;
//         if (loaded === imgs.length) capturar();
//       };
//     }
//   });
//   function capturar() {
//     html2canvas(catalogoDiv, { useCORS: true }).then(canvas => {
//       canvas.toBlob(blob => {
//         if (navigator.clipboard && navigator.clipboard.write) {
//           const item = new ClipboardItem({ "image/png": blob });
//           navigator.clipboard.write([item]).then(() => {
//             const toast = document.getElementById("toast");
//             toast.textContent = "Imagem copiada para a área de transferência!";
//             toast.style.display = "block";
//             setTimeout(() => {
//               toast.style.display = "none";
//             }, 3000);
//           }).catch(err => {
//             alert("Erro ao copiar a imagem para a área de transferência.");
//           });
//         } else {
//           alert("Seu navegador não suporta copiar imagens para a área de transferência.");
//         }
//       });
//     });
//   }
// });

  document.getElementById("colunasSelector").addEventListener("change", function () {
    const colunas = this.value; // Obtém o valor selecionado
    const grid = document.getElementById("catalogoGrid");
    grid.style.gridTemplateColumns = `repeat(${colunas}, 1fr)`; // Atualiza o número de colunas
  });

// Atualiza o seletor ao carregar a página
document.addEventListener("DOMContentLoaded", atualizarSeletorCatalogos);

// document.getElementById("baixarCatalogo").addEventListener("click", function () {
//   const catalogoDiv = document.getElementById("catalogoGrid");
//   html2canvas(catalogoDiv, { useCORS: true }).then(canvas => {
//     // Cria um link temporário para download
//     const link = document.createElement('a');
//     link.href = canvas.toDataURL("image/png");
//     link.download = "catalogo.png";
//     document.body.appendChild(link);
//     link.click();
//     document.body.removeChild(link);
//   });
// });

document.getElementById("baixarCatalogo").addEventListener("click", function () {
  const catalogoDiv = document.getElementById("catalogoGrid");
  domtoimage.toPng(catalogoDiv)
    .then(function (dataUrl) {
      const link = document.createElement('a');
      link.download = 'catalogo.png';
      link.href = dataUrl;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    })
    .catch(function (error) {
      alert('Erro ao gerar imagem: ' + error);
    });
});

document.getElementById("capturarCatalogo").addEventListener("click", function () {
  const catalogoDiv = document.getElementById("catalogoGrid");
  domtoimage.toBlob(catalogoDiv)
    .then(function (blob) {
      if (navigator.clipboard && navigator.clipboard.write) {
        const item = new ClipboardItem({ "image/png": blob });
        navigator.clipboard.write([item]).then(() => {
          const toast = document.getElementById("toast");
          toast.textContent = "Imagem copiada para a área de transferência!";
          toast.style.display = "block";
          setTimeout(() => {
            toast.style.display = "none";
          }, 3000);
        }).catch(err => {
          alert("Erro ao copiar a imagem para a área de transferência.");
        });
      } else {
        alert("Seu navegador não suporta copiar imagens para a área de transferência.");
      }
    })
    .catch(function (error) {
      alert('Erro ao gerar imagem: ' + error);
    });
});