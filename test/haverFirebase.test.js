const assert = require('assert');

// Mock global variables usadas na função
global.listaHaver = [{ nome: 'Teste', valor: 10 }];
global.quitados = [{ nome: 'Quitado', valor: 0 }];

// Mock do firebase
global.firebase = {
  database: () => ({
    ref: (path) => ({
      set: (data) => {
        // Simula uma Promise resolvida
        return Promise.resolve({ path, data });
      }
    })
  })
};

// Importa a função do arquivo (ajuste o caminho se necessário)
const fs = require('fs');
const vm = require('vm');
const code = fs.readFileSync('./scripts/haver.js', 'utf8');
vm.runInThisContext(code);

describe('salvarHaverFirebase', function() {
  it('deve chamar firebase.database().ref().set para haver_lista e haver_quitados', async function() {
    let calledPaths = [];
    // Substitui o mock para capturar chamadas
    global.firebase = {
      database: () => ({
        ref: (path) => ({
          set: (data) => {
            calledPaths.push({ path, data });
            return Promise.resolve();
          }
        })
      })
    };

    // Chama a função
    salvarHaverFirebase();

    // Aguarda as Promises
    await new Promise(r => setTimeout(r, 10));

    assert.deepStrictEqual(
      calledPaths.map(c => c.path).sort(),
      ['haver_lista', 'haver_quitados'].sort()
    );
  });
});