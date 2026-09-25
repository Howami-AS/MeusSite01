let currentSites = [];
let editingSiteId = null;

const loadSites = async () => {
  currentSites = await dbOperations.getAll('sites');
  sortAndRenderSites();
  renderQuickAccess();
};

const formatUrl = (urlInput) => {
  let url = urlInput.trim();
  if (!/^https?:\/\//i.test(url)) {
    url = 'https://' + url;
  }
  return url;
};

const extractDomain = (url) => {
  try {
    const parsed = new URL(url);
    return parsed.hostname;
  } catch {
    return url;
  }
};

const renderSites = (sites) => {
  const grid = document.getElementById('sites-grid');
  const emptyState = document.getElementById('empty-state');
  
  grid.innerHTML = '';

  if (sites.length === 0) {
    emptyState.classList.remove('hidden');
    return;
  }

  emptyState.classList.add('hidden');

  sites.forEach(site => {
    const domain = extractDomain(site.url);
    const faviconUrl = `https://www.google.com/s2/favicons?domain=${domain}&sz=64`;

    const card = document.createElement('div');
    card.className = 'site-card';
    card.innerHTML = `
      <div>
        <div class="site-card-header">
          <div class="site-info">
            <img class="site-favicon" src="${faviconUrl}" alt="" onerror="this.src='https://cdn-icons-png.flaticon.com/512/25/25231.png'">
            <div>
              <div class="site-title">${site.name}</div>
              <div class="site-domain">${domain}</div>
            </div>
          </div>
          <button class="star-btn ${site.favorite ? 'active' : ''}" data-id="${site.id}" title="Favorito">
            <i class="fa-solid fa-star"></i>
          </button>
        </div>
      </div>
      <div class="site-card-footer">
        <span class="site-category-badge">${site.category}</span>
        <div class="site-card-actions">
          <button class="edit-btn" data-id="${site.id}" title="Editar"><i class="fa-solid fa-pen"></i></button>
          <button class="delete-btn" data-id="${site.id}" title="Excluir"><i class="fa-solid fa-trash"></i></button>
        </div>
      </div>
    `;

    // Abertura do site ao clicar no corpo do cartão
    card.addEventListener('click', (e) => {
      if (e.target.closest('button')) return; // Evitar disparar se clicar nos botões internos
      openWebView(site);
    });

    // Ações dos botões internos
    card.querySelector('.star-btn').addEventListener('click', async (e) => {
      e.stopPropagation();
      site.favorite = !site.favorite;
      await dbOperations.update('sites', site);
      loadSites();
    });

    card.querySelector('.edit-btn').addEventListener('click', (e) => {
      e.stopPropagation();
      openEditModal(site);
    });

    card.querySelector('.delete-btn').addEventListener('click', (e) => {
      e.stopPropagation();
      deleteSite(site.id, site.name);
    });

    grid.appendChild(card);
  });
};

const sortAndRenderSites = () => {
  const sortBy = document.getElementById('select-sort').value;
  let sorted = [...currentSites];

  if (sortBy === 'name-asc') {
    sorted.sort((a, b) => a.name.localeCompare(b.name));
  } else if (sortBy === 'name-desc') {
    sorted.sort((a, b) => b.name.localeCompare(a.name));
  } else if (sortBy === 'recent') {
    sorted.sort((a, b) => b.id - a.id);
  } else if (sortBy === 'most-used') {
    sorted.sort((a, b) => (b.clicks || 0) - (a.clicks || 0));
  }

  renderSites(sorted);
};

const deleteSite = async (id, name) => {
  if (confirm(`Excluir este site?\n\n"${name}"`)) {
    await dbOperations.delete('sites', id);
    loadSites();
  }
};

const openAddModal = () => {
  editingSiteId = null;
  document.getElementById('modal-site-title').textContent = 'Adicionar Novo Site';
  document.getElementById('site-id').value = '';
  document.getElementById('site-name').value = '';
  document.getElementById('site-url').value = '';
  document.getElementById('site-favorite').checked = false;
  document.getElementById('modal-site').classList.add('open');
};

const openEditModal = (site) => {
  editingSiteId = site.id;
  document.getElementById('modal-site-title').textContent = 'Editar Site';
  document.getElementById('site-id').value = site.id;
  document.getElementById('site-name').value = site.name;
  document.getElementById('site-url').value = site.url;
  document.getElementById('site-category').value = site.category;
  document.getElementById('site-favorite').checked = site.favorite;
  document.getElementById('modal-site').classList.add('open');
};

document.getElementById('form-site').addEventListener('submit', async (e) => {
  e.preventDefault();
  const name = document.getElementById('site-name').value.trim();
  const url = formatUrl(document.getElementById('site-url').value);
  const category = document.getElementById('site-category').value;
  const favorite = document.getElementById('site-favorite').checked;
  const domain = extractDomain(url);

  // Validação de Duplicação
  const existing = currentSites.find(s => s.url.toLowerCase() === url.toLowerCase() && s.id !== Number(editingSiteId));
  if (existing) {
    if (confirm('Este site já está cadastrado. Deseja abri-lo?')) {
      document.getElementById('modal-site').classList.remove('open');
      openWebView(existing);
    }
    return;
  }

  if (editingSiteId) {
    const site = currentSites.find(s => s.id === Number(editingSiteId));
    site.name = name;
    site.url = url;
    site.domain = domain;
    site.category = category;
    site.favorite = favorite;
    await dbOperations.update('sites', site);
  } else {
    await dbOperations.add('sites', {
      name,
      url,
      domain,
      category,
      favorite,
      clicks: 0
    });
  }

  document.getElementById('modal-site').classList.remove('open');
  loadSites();
});

document.getElementById('fab-add').addEventListener('click', openAddModal);
document.getElementById('btn-empty-add').addEventListener('click', openAddModal);
document.getElementById('select-sort').addEventListener('change', sortAndRenderSites);