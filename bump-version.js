const fs = require('fs');
const path = 'index.html';

fs.readFile(path, 'utf8', (err, data) => {
  if (err) throw err;
  const regex = /Versão (\d+\.\d+\.\d+)/;
  const match = data.match(regex);
  if (!match) return;
  let [major, minor, patch] = match[1].split('.').map(Number);
  patch++;
  const novaVersao = `Versão ${major}.${minor}.${patch}`;
  const novoHtml = data.replace(regex, novaVersao);
  fs.writeFile(path, novoHtml, 'utf8', err => {
    if (err) throw err;
    console.log('Versão atualizada para', novaVersao);
  });
});