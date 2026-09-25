let deferredPrompt = null;
const btnInstall = document.getElementById('btn-install');
const isInstalled = window.matchMedia('(display-mode: standalone)').matches || navigator.standalone === true;

if (isInstalled) {
  btnInstall.classList.add('hidden');
}

window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  deferredPrompt = e;
});

btnInstall.addEventListener('click', async () => {
  if (deferredPrompt) {
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      btnInstall.classList.add('hidden');
    }
    deferredPrompt = null;
    return;
  }

  if (!window.isSecureContext) {
    alert('Para instalar o aplicativo, abra este site por uma conexão HTTPS.');
  } else if (/iPhone|iPad|iPod/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)) {
    alert('Para instalar no iPhone ou iPad, toque em Compartilhar e escolha "Adicionar à Tela de Início".');
  } else {
    alert('Abra o menu do navegador e escolha "Instalar aplicativo" ou "Adicionar à tela inicial".');
  }
});

window.addEventListener('appinstalled', () => {
  btnInstall.classList.add('hidden');
});