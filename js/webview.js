const overlay = document.getElementById('webview-overlay');
const iframe = document.getElementById('wv-iframe');
const urlDisplay = document.getElementById('wv-url-display');
const blockWarning = document.getElementById('wv-block-warning');
let currentActiveSite = null;

const openWebView = async (site) => {
  currentActiveSite = site;
  site.clicks = (site.clicks || 0) + 1;
  await dbOperations.update('sites', site);

  urlDisplay.textContent = site.url;
  blockWarning.classList.add('hidden');
  iframe.src = site.url;
  overlay.classList.remove('hidden');

  // Registrar nos Recentes
  await dbOperations.add('recent', { name: site.name, url: site.url, timestamp: Date.now() });
};

const closeWebView = () => {
  overlay.classList.add('hidden');
  iframe.src = '';
  loadSites();
};

document.getElementById('wv-close').addEventListener('click', closeWebView);
document.getElementById('wv-reload').addEventListener('click', () => {
  if (iframe.src) iframe.src = iframe.src;
});
document.getElementById('wv-external').addEventListener('click', () => {
  if (currentActiveSite) window.open(currentActiveSite.url, '_blank');
});
document.getElementById('wv-btn-external').addEventListener('click', () => {
  if (currentActiveSite) window.open(currentActiveSite.url, '_blank');
});
document.getElementById('wv-share').addEventListener('click', async () => {
  if (currentActiveSite && navigator.share) {
    try {
      await navigator.share({ title: currentActiveSite.name, url: currentActiveSite.url });
    } catch (err) {
      // Ignorar cancelamento
    }
  } else if (currentActiveSite) {
    navigator.clipboard.writeText(currentActiveSite.url);
    alert('Link copiado para a área de transferência!');
  }
});