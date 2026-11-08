
import { supabase } from './supabase.js';

const homeServices = document.getElementById('homeServices');
const homeDesigns = document.getElementById('homeDesigns');

// LOAD SERVICES
async function loadHomeServices() {
  homeServices.textContent = 'Loading services...';

  const { data, error } = await supabase
    .from('services')
    .select('*')
    .eq('is_active', true)
    .order('created_at', { ascending: false })
    .limit(4);

  if (error) {
    homeServices.textContent = 'Services load nahi ho paayi.';
    console.error(error);
    return;
  }

  homeServices.replaceChildren();

  if (!data || data.length === 0) {
    homeServices.textContent = 'Services coming soon.';
    return;
  }

  data.forEach(service => {
    const card = document.createElement('div');
    card.className = 'home-service-card';

    const title = document.createElement('h3');
    title.textContent = service.name;

    const description = document.createElement('p');
    description.textContent =
      service.description || 'Professional printing service.';

    const link = document.createElement('a');
    link.href = 'order.html';
    link.textContent = 'Order Now';
    link.className = 'secondary-btn';

    card.append(title, description, link);
    homeServices.appendChild(card);
  });
}

// LOAD LATEST DESIGNS
async function loadHomeDesigns() {
  homeDesigns.textContent = 'Loading designs...';

  const { data, error } = await supabase
    .from('designs')
    .select('*')
    .eq('is_published', true)
    .order('created_at', { ascending: false })
    .limit(4);

  if (error) {
    homeDesigns.textContent = 'Designs load nahi ho paayi.';
    console.error(error);
    return;
  }

  homeDesigns.replaceChildren();

  if (!data || data.length === 0) {
    homeDesigns.textContent = 'New designs coming soon.';
    return;
  }

  data.forEach(design => {
    const card = document.createElement('a');
    card.className = 'home-design-card';
    card.href = 'designs.html';

    const img = document.createElement('img');
    img.src = design.image_url;
    img.alt = design.title;
    img.loading = 'lazy';

    const title = document.createElement('h3');
    title.textContent = design.title;

    card.append(img, title);
    homeDesigns.appendChild(card);
  });
}

// RUN BOTH FUNCTIONS
loadHomeServices();
loadHomeDesigns();

// MOBILE THREE DOT MENU

const menuToggle = document.getElementById('menuToggle');
const homeNav = document.getElementById('homeNav');

menuToggle.addEventListener('click', () => {
  homeNav.classList.toggle('open');

  const isOpen = homeNav.classList.contains('open');

  menuToggle.setAttribute('aria-expanded', isOpen);
});

homeNav.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => {
    homeNav.classList.remove('open');
    menuToggle.setAttribute('aria-expanded', 'false');
  });
});
