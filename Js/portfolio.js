
import { supabase } from './supabase.js';

const portfolioList = document.getElementById('portfolioList');
const portfolioFilters = document.getElementById('portfolioFilters');

const imageModal = document.getElementById('imageModal');
const modalImage = document.getElementById('modalImage');
const modalTitle = document.getElementById('modalTitle');
const closeModal = document.getElementById('closeModal');

let allDesigns = [];

function showDesigns(category = 'all') {
  portfolioList.replaceChildren();

  const filtered = category === 'all'
    ? allDesigns
    : allDesigns.filter(item => item.category === category);

  if (filtered.length === 0) {
    portfolioList.textContent = 'No work available in this category.';
    return;
  }

  filtered.forEach(item => {
    const card = document.createElement('div');
    card.className = 'portfolio-card';

    const img = document.createElement('img');
    img.src = item.image_url;
    img.alt = item.title;
    img.loading = 'lazy';

    const content = document.createElement('div');
    content.className = 'portfolio-card-content';

    const title = document.createElement('h3');
    title.textContent = item.title;

    const description = document.createElement('p');
    description.textContent = item.description || '';

    content.append(title, description);
    card.append(img, content);

    card.addEventListener('click', () => {
      modalImage.src = item.image_url;
      modalTitle.textContent = item.title;
      imageModal.classList.add('show');
    });

    portfolioList.appendChild(card);
  });
}

function createFilters() {
  portfolioFilters.replaceChildren();

  const categories = [
    'all',
    ...new Set(
      allDesigns
        .map(item => item.category)
        .filter(Boolean)
    )
  ];

  categories.forEach(category => {
    const button = document.createElement('button');

    button.className = 'filter-btn';
    button.textContent =
      category === 'all' ? 'All' : category;

    if (category === 'all') {
      button.classList.add('active');
    }

    button.addEventListener('click', () => {
      document.querySelectorAll('.filter-btn')
        .forEach(btn => btn.classList.remove('active'));

      button.classList.add('active');
      showDesigns(category);
    });

    portfolioFilters.appendChild(button);
  });
}

async function loadPortfolio() {
  portfolioList.textContent = 'Loading portfolio...';

  const { data, error } = await supabase
    .from('designs')
    .select('*')
    .eq('is_published', true)
    .order('created_at', { ascending: false });

  if (error) {
    console.error(error);
    portfolioList.textContent =
      'Portfolio load nahi ho paaya: ' + error.message;
    return;
  }

  allDesigns = data || [];

  if (allDesigns.length === 0) {
    portfolioList.textContent = 'Abhi koi portfolio work available nahi hai.';
    return;
  }

  createFilters();
  showDesigns();
}

closeModal.addEventListener('click', () => {
  imageModal.classList.remove('show');
});

imageModal.addEventListener('click', event => {
  if (event.target === imageModal) {
    imageModal.classList.remove('show');
  }
});

document.addEventListener('keydown', event => {
  if (event.key === 'Escape') {
    imageModal.classList.remove('show');
  }
});

loadPortfolio();
