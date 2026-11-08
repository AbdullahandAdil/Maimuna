
import { supabase } from './supabase.js';

const form = document.getElementById('resetForm');
const message = document.getElementById('message');

form.addEventListener('submit', async (e) => {
  e.preventDefault();

  const password = document.getElementById('newPassword').value;
  const confirm = document.getElementById('confirmPassword').value;

  if (password.length < 8) {
    message.textContent = 'Password minimum 8 characters ka hona chahiye.';
    return;
  }

  if (password !== confirm) {
    message.textContent = 'Dono passwords match nahi kar rahe.';
    return;
  }

  message.textContent = 'Updating password...';

  const { error } = await supabase.auth.updateUser({
    password: password
  });

  if (error) {
    message.textContent = error.message;
    return;
  }

  message.textContent = 'Password successfully changed!';

  setTimeout(() => {
    window.location.href = 'admin-login.html';
  }, 2000);
});
