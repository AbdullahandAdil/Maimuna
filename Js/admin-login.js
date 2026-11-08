
import { supabase } from './supabase.js';

const form = document.getElementById('loginForm');
const message = document.getElementById('message');
const loginBtn = document.getElementById('loginBtn');
const forgotBtn = document.getElementById('forgotPassword');

form.addEventListener('submit', async (e) => {
  e.preventDefault();

  const email = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value;

  loginBtn.disabled = true;
  message.textContent = 'Checking...';

  try {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) throw error;

    const { data: isAdmin, error: adminError } =
      await supabase.rpc('is_admin');

    if (adminError) throw adminError;

    if (isAdmin !== true) {
      await supabase.auth.signOut();
      throw new Error('You are not authorized as admin.');
    }

    window.location.href = 'admin.html';

  } catch (error) {
    message.textContent = error.message;
  }

  loginBtn.disabled = false;
});

forgotBtn.addEventListener('click', async (e) => {
  e.preventDefault();

  const email = document.getElementById('email').value.trim();

  if (!email) {
    message.textContent = 'Pehle apna email address likhiye.';
    return;
  }

  forgotBtn.style.pointerEvents = 'none';
  message.textContent = 'Sending reset link...';

  try {
    const redirectTo =
      'https://maimunaprintingpressofficial.netlify.app/reset-password.html';

    const { error } = await supabase.auth.resetPasswordForEmail(
      email,
      { redirectTo }
    );

    if (error) throw error;

    message.textContent =
      'Password reset link aapke email par bhej diya gaya hai.';

  } catch (error) {
    message.textContent = error.message;

  } finally {
    forgotBtn.style.pointerEvents = 'auto';
  }
});
