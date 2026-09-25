let categoriesList = [];

const loadCategories = async () => {
  categoriesList = await dbOperations.getAll('categories');
  renderCategoriesMenu();
  populateCategorySelects();
};

const renderCategoriesMenu = () => {
  const container = document.getElementById('categories-list');
  container.innerHTML = '';

  categoriesList.forEach(cat => {
    const btn = document.createElement('button');
    btn.className = 'nav-item';
    btn.dataset.category = cat.name;
    btn.innerHTML = `<i class="fa-solid fa-folder"></i> ${cat.name}`;
    btn.addEventListener('click', () => filterByCategory(cat.name));
    container.appendChild(btn);
  });
};

const populateCategorySelects = () => {
  const select = document.getElementById('site-category');
  select.innerHTML = '';
  categoriesList.forEach(cat => {
    const option = document.createElement('option');
    option.value = cat.name;
    option.textContent = cat.name;
    select.appendChild(option);
  });
};

const promptAddCategory = async () => {
  const catName = prompt('Nome da nova categoria:');
  if (catName && catName.trim() !== '') {
    const trimmed = catName.trim();
    if (!categoriesList.some(c => c.name.toLowerCase() === trimmed.toLowerCase())) {
      await dbOperations.add('categories', { name: trimmed });
      await loadCategories();
    } else {
      alert('Esta categoria já existe.');
    }
  }
};

document.getElementById('btn-add-category').addEventListener('click', promptAddCategory);