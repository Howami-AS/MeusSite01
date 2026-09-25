const setupSearch = async () => {
  const inputSearch = document.getElementById('input-search');
  inputSearch.addEventListener('input', async (e) => {
    const query = e.target.value.toLowerCase().trim();
    const sites = await dbOperations.getAll('sites');

    if (!query) {
      renderSites(sites);
      document.getElementById('current-view-title').textContent = 'Todos os Sites';
      return;
    }

    const filtered = sites.filter(site => 
      site.name.toLowerCase().includes(query) ||
      site.url.toLowerCase().includes(query) ||
      site.domain.toLowerCase().includes(query) ||
      site.category.toLowerCase().includes(query)
    );

    renderSites(filtered);
    document.getElementById('current-view-title').textContent = `Resultados para "${query}"`;
  });
};