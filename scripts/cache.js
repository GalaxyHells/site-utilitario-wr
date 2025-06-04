window.catalogosCache = null;

export async function carregarCatalogosComCache() {
  if (window.catalogosCache !== null) {
    return window.catalogosCache;
  }
  const snapshot = await firebase.database().ref('catalogos').once('value');
  window.catalogosCache = snapshot.val() || [];
  return window.catalogosCache;
}