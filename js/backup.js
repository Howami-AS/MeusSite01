const exportBackup = async () => {
  const sites = await dbOperations.getAll('sites');
  const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(sites, null, 2));
  const downloadAnchor = document.createElement('a');
  downloadAnchor.setAttribute("href", dataStr);
  downloadAnchor.setAttribute("download", "meus-sites-backup.json");
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();
};

const importBackup = (event) => {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = async (e) => {
    try {
      const importedSites = JSON.parse(e.target.result);
      if (!Array.isArray(importedSites)) throw new Error('Formato inválido');

      const mode = confirm('Deseja substituir a lista atual?\n\n[OK] Substituir lista\n[Cancelar] Adicionar aos existentes');

      if (mode) {
        const current = await dbOperations.getAll('sites');
        for (const s of current) {
          await dbOperations.delete('sites', s.id);
        }
      }

      for (const site of importedSites) {
        delete site.id;
        await dbOperations.add('sites', site);
      }

      alert('Backup importado com sucesso!');
      loadSites();
    } catch (err) {
      alert('Erro ao importar arquivo de backup inválido.');
    }
  };
  reader.readAsText(file);
};

document.getElementById('btn-export').addEventListener('click', exportBackup);
document.getElementById('btn-import').addEventListener('click', () => {
  document.getElementById('file-import-input').click();
});
document.getElementById('file-import-input').addEventListener('change', importBackup);