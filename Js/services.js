
import { supabase } from './supabase.js';

const servicesList = document.getElementById('servicesList');

async function loadServices() {
  servicesList.innerHTML = '<p>Loading services...</p>';

  try {
    const { data, error } = await supabase
      .from('services')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (error) throw error;

    if (!data || data.length === 0) {
      servicesList.innerHTML =
        '<p>Abhi koi service available nahi hai.</p>';
      return;
    }

    servicesList.innerHTML = '';

    data.forEach(service => {
      const card = document.createElement('div');
      card.className = 'service-card';

      const title = document.createElement('h3');
      title.textContent = service.name;

      const description = document.createElement('p');
      description.textContent =
        service.description || 'Professional printing service.';

      const button = document.createElement('a');
      button.href = 'order.html';
      button.textContent = 'Order Now';

      card.append(title, description, button);
      servicesList.appendChild(card);
    });

  } catch (error) {
    console.error(error);
    servicesList.innerHTML =
      '<p>Services load nahi ho paayi: ' +
      error.message + '</p>';
  }
}

loadServices();
