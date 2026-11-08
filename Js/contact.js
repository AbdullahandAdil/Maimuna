
import { supabase } from './supabase.js';

const contactForm = document.getElementById('contactForm');
const contactStatus = document.getElementById('contactStatus');
const submitBtn = document.getElementById('contactSubmitBtn');

contactForm.addEventListener('submit', async (event) => {
  event.preventDefault();

  const name = document.getElementById('contactName').value.trim();
  const phone = document.getElementById('contactPhone').value.trim();
  const email = document.getElementById('contactEmail').value.trim();
  const subject = document.getElementById('contactSubject').value.trim();
  const message = document.getElementById('contactMessage').value.trim();

  if (!name || !phone || !subject || !message) {
    contactStatus.textContent = 'Please fill all required fields.';
    return;
  }

  submitBtn.disabled = true;
  submitBtn.textContent = 'Sending...';
  contactStatus.textContent = '';

  try {
    const { error } = await supabase
      .from('contacts')
      .insert({
        name,
        phone,
        email: email || null,
        subject,
        message,
        status: 'new'
      });

    if (error) throw error;

    contactStatus.textContent =
      'Your message has been sent successfully!';

    contactForm.reset();

  } catch (error) {
    console.error(error);

    contactStatus.textContent =
      'Message send nahi hua: ' + error.message;

  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = 'Send Message';
  }
});
