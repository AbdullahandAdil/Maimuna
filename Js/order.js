
import { supabase } from './supabase.js';

const form = document.getElementById('orderForm');
const message = document.getElementById('formMessage');
const submitBtn = document.getElementById('submitBtn');

form.addEventListener('submit', async (event) => {
  event.preventDefault();

  const name = document.getElementById('customerName').value.trim();
  const phone = document.getElementById('phone').value.trim();
  const email = document.getElementById('email').value.trim();
  const service = document.getElementById('service').value;
  const quantity = Number(document.getElementById('quantity').value);
  const details = document.getElementById('details').value.trim();
  const file = document.getElementById('file').files[0];

  if (!name || !phone || !service || !quantity || !details) {
    message.textContent = 'Please fill all required fields.';
    return;
  }

  if (!Number.isSafeInteger(quantity) || quantity < 1) {
    message.textContent = 'Please enter a valid quantity.';
    return;
  }

  if (file && file.size > 20 * 1024 * 1024) {
    message.textContent = 'File size 20 MB se kam honi chahiye.';
    return;
  }

  submitBtn.disabled = true;
  submitBtn.textContent = 'Submitting...';
  message.textContent = 'Please wait...';

  let filePath = null;

  try {
    // Upload optional file to private Storage bucket
    if (file) {
      const allowedTypes = [
        'application/pdf',
        'image/jpeg',
        'image/png',
        'image/webp'
      ];

      if (!allowedTypes.includes(file.type)) {
        throw new Error('Sirf PDF, JPG, PNG aur WEBP files allowed hain.');
      }

      const extension = file.name.split('.').pop().toLowerCase();
      const safeName = Date.now() + '-' +
        Math.random().toString(36).slice(2) + '.' + extension;

      filePath = 'orders/' + safeName;

      const { error: uploadError } = await supabase.storage
        .from('order-files')
        .upload(filePath, file, {
          contentType: file.type,
          upsert: false
        });

      if (uploadError) throw uploadError;
    }

    // Save order in database
    const { error: orderError } = await supabase
      .from('orders')
      .insert({
        customer_name: name,
        phone: phone,
        email: email || null,
        service_name: service,
        quantity: quantity,
        details: details,
        file_url: filePath,
        status: 'pending'
      });

    if (orderError) throw orderError;

    message.textContent =
      'Your order has been submitted successfully! We will contact you soon.';

    form.reset();

  } catch (error) {
    message.textContent = 'Order submit nahi hua: ' + error.message;
  }

  submitBtn.disabled = false;
  submitBtn.textContent = 'Submit Order';
});
