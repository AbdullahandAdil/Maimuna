
import { supabase } from './supabase.js';

const designsList = document.getElementById('designsList');

async function loadDesigns() {
  designsList.textContent = 'Loading designs...';

  const { data, error } = await supabase
    .from('designs')
    .select('*')
    .eq('is_published', true)
    .order('created_at', { ascending: false });

  if (error) {
    designsList.textContent = 'Error: ' + error.message;
    return;
  }

  designsList.replaceChildren();

  if (!data || data.length === 0) {
    designsList.textContent = 'No designs available yet.';
    return;
  }

  data.forEach(design => {
    const card = document.createElement('div');
    card.className = 'design-card';

    const img = document.createElement('img');
    img.src = design.image_url;
    img.alt = design.title;
    img.loading = 'lazy';

    const content = document.createElement('div');
    content.className = 'design-card-content';

    const title = document.createElement('h3');
    title.textContent = design.title;

    const description = document.createElement('p');
    description.textContent = design.description || '';

    const category = document.createElement('span');
    category.className = 'design-category';
    category.textContent = design.category || 'General';

    content.append(title, description, category);
    card.append(img, content);

    designsList.appendChild(card);
  });
}

loadDesigns();
