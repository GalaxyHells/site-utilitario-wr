const clickAudio = new Audio('sounds/button-click.wav'); // ajuste o caminho se necessário

function playClickSound() {
  // Reinicia o áudio se já estiver tocando
  clickAudio.currentTime = 0;
  clickAudio.play();
}

function mostrarFerramenta(id) {
  document.querySelectorAll('.ferramenta').forEach(el => {
    el.classList.remove('active');
  });

  document.querySelectorAll('.tab-button').forEach(btn => {
    btn.classList.remove('clicado');
  });

  document.getElementById(id).classList.add('active');
  const index = ['cobrar', 'ferramenta2', 'ferramenta3', 'ferramenta4', 'ferramenta5', 'ferramenta6', 'ferramenta7'].indexOf(id);
  if (index !== -1) {
    document.querySelectorAll('.tab-button')[index].classList.add('clicado');
  }

  // Faz a página rolar para o topo ao trocar de tab
  window.scrollTo(0, 0);
}

const btn = document.getElementById('toggleTheme');
btn.onclick = function() {
  document.body.classList.toggle('dark-theme');
  btn.textContent = document.body.classList.contains('dark-theme') ? '☀️' : '🌙';
};

function mostrarToast(msg) {
  const toast = document.getElementById('toast');
  toast.textContent = msg;
  toast.style.display = 'block';
  setTimeout(() => toast.style.display = 'none', 2000);
}

function formatarMoeda(valor) {
  valor = valor.replace(/\D/g, "");
  valor = (parseInt(valor, 10) / 100).toFixed(2) + "";
  valor = valor.replace(".", ",");
  valor = valor.replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1.");
  return "R$ " + valor;
}

function aplicarMascaraMoeda(input) {
  input.addEventListener("input", function(e) {
    let val = input.value.replace(/\D/g, "");
    if (val === "") {
      input.value = "";
      return;
    }
    input.value = formatarMoeda(val);
  });
}

// Aplica a máscara nos campos desejados
document.addEventListener("DOMContentLoaded", function() {
  const campoValor = document.getElementById("valor");
  const campoValorHaver = document.getElementById("valorHaver");
  if (campoValor) aplicarMascaraMoeda(campoValor);
  if (campoValorHaver) aplicarMascaraMoeda(campoValorHaver);
});

document.addEventListener("DOMContentLoaded", function() {
  document.body.classList.add("efeito-zoom");
});

document.addEventListener("DOMContentLoaded", function() {
  document.querySelectorAll('button').forEach(btn => {
    btn.addEventListener('click', playClickSound);
  });
});