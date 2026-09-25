let deferredPrompt = null;
const btnInstall = document.getElementById('btn-install');

window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  deferredPrompt = e;
  btnInstall.classList.remove('hidden');
});

btnInstall.addEventListener('click', async () => {
  if (deferredPrompt) {
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      btnInstall.classList.add('hidden');
    }
    deferredPrompt = null;
  }
});

window.addEventListener('appinstalled', () => {
  btnInstall.classList.add('hidden');
});