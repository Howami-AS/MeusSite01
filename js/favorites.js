const filterFavorites = async () => {
  const sites = await dbOperations.getAll('sites');
  const favorites = sites.filter(s => s.favorite);
  renderSites(favorites);
  document.getElementById('current-view-title').textContent = 'Favoritos';
};

const renderQuickAccess = async () => {
  const sites = await dbOperations.getAll('sites');
  const quickGrid = document.getElementById('quick-access-grid');
  const section = document.getElementById('quick-access-section');
  
  const favorites = sites.filter(s => s.favorite).slice(0, 6);
  
  if (favorites.length === 0) {
    section.classList.add('hidden');
    return;
  }
  
  section.classList.remove('hidden');
  quickGrid.innerHTML = '';

  favorites.forEach(site => {
    const card = document.createElement('div');
    card.className = 'quick-card';
    card.innerHTML = `
      <img src="${site.icon || 'https://www.google.com/s2/favicons?domain=' + site.domain + '&sz=32'}" alt="" onerror="this.src='https://cdn-icons-png.flaticon.com/512/25/25231.png'">
      <span>⭐ ${site.name}</span>
    `;
    card.addEventListener('click', () => openWebView(site));
    quickGrid.appendChild(card);
  });
};