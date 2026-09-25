document.addEventListener('DOMContentLoaded', async () => {
  try {
    await initDatabase();
    await loadCategories();
    await loadSites();
    setupSearch();
    setupUIEvents();
    checkOnboarding();
  } catch (err) {
    console.error('Erro ao inicializar aplicativo:', err);
  }
});

const setupUIEvents = () => {
  // Sidebar Toggle em dispositivos móveis
  const sidebar = document.getElementById('sidebar');
  const btnToggle = document.getElementById('btn-toggle-sidebar');
  btnToggle.addEventListener('click', () => sidebar.classList.toggle('open'));

  // Fechar modals ao clicar no X ou fora
  document.querySelectorAll('.close-modal').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.modal').forEach(m => m.classList.remove('open'));
    });
  });

  // Configurações Modal
  document.getElementById('btn-settings').addEventListener('click', () => {
    document.getElementById('modal-settings').classList.add('open');
  });

  // Tema Claro/Escuro
  const themeRadios = document.querySelectorAll('input[name="theme"]');
  themeRadios.forEach(radio => {
    radio.addEventListener('change', (e) => {
      const theme = e.target.value;
      document.documentElement.setAttribute('data-theme', theme);
      localStorage.setItem('meus-sites-theme', theme);
    });
  });

  const savedTheme = localStorage.getItem('meus-sites-theme') || 'auto';
  document.documentElement.setAttribute('data-theme', savedTheme);
  document.querySelector(`input[name="theme"][value="${savedTheme}"]`).checked = true;

  // Filtros da Sidebar
  document.querySelectorAll('.sidebar-nav .nav-item').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      document.querySelectorAll('.sidebar-nav .nav-item').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      sidebar.classList.remove('open');

      const filter = btn.dataset.filter;
      if (filter === 'all') {
        loadSites();
        document.getElementById('current-view-title').textContent = 'Todos os Sites';
      } else if (filter === 'favorites') {
        filterFavorites();
      } else if (filter === 'recent') {
        loadRecentSites();
      }
    });
  });

  // Limpar Recentes
  document.getElementById('btn-clear-recent').addEventListener('click', async () => {
    const recents = await dbOperations.getAll('recent');
    for (const r of recents) {
      await dbOperations.delete('recent', r.id);
    }
    alert('Histórico recente limpo com sucesso.');
  });
};

const filterByCategory = async (categoryName) => {
  const sites = await dbOperations.getAll('sites');
  const filtered = sites.filter(s => s.category === categoryName);
  renderSites(filtered);
  document.getElementById('current-view-title').textContent = `📁 ${categoryName}`;
  document.getElementById('sidebar').classList.remove('open');
};

const loadRecentSites = async () => {
  const recents = await dbOperations.getAll('recent');
  const sites = await dbOperations.getAll('sites');
  
  // Mapear URLs recentes únicos para objetos de sites reais
  const recentUrls = [...new Set(recents.reverse().map(r => r.url))];
  const recentSitesList = recentUrls.map(url => sites.find(s => s.url === url)).filter(Boolean);

  renderSites(recentSitesList);
  document.getElementById('current-view-title').textContent = 'Recentes';
};

const checkOnboarding = () => {
  const hasSeen = localStorage.getItem('meus-sites-onboarding');
  if (!hasSeen) {
    document.getElementById('modal-welcome').classList.add('open');
  }
};

document.getElementById('btn-onboarding-next').addEventListener('click', () => {
  localStorage.setItem('meus-sites-onboarding', 'true');
  document.getElementById('modal-welcome').classList.remove('open');
});

// Registro do Service Worker
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./service-worker.js')
      .then(reg => console.log('ServiceWorker registrado com sucesso:', reg.scope))
      .catch(err => console.error('Falha ao registrar ServiceWorker:', err));
  });
}