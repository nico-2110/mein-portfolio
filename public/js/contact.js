// ── Contact Form ──────────────────────────────────────────────
const submitBtn = document.getElementById('submitBtn');
const formError = document.getElementById('formError');
const formSuccess = document.getElementById('formSuccess');
const formWrap = document.getElementById('formWrap');

submitBtn?.addEventListener('click', async () => {
  const name = document.getElementById('name')?.value.trim();
  const email = document.getElementById('email')?.value.trim();
  const message = document.getElementById('message')?.value.trim();
  const project = document.getElementById('project')?.value;
  formError.style.display = 'none';

  if (!name || !email || !message) {
    formError.textContent = document.body.classList.contains('lang-de')
      ? 'Bitte alle Pflichtfelder (*) ausfüllen.'
      : 'Please fill in all required fields (*).';
    formError.style.display = 'block';
    return;
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    formError.textContent = document.body.classList.contains('lang-de')
      ? 'Bitte eine gültige E-Mail-Adresse eingeben.'
      : 'Please enter a valid email address.';
    formError.style.display = 'block';
    return;
  }

  submitBtn.disabled = true;
  submitBtn.querySelector('span').textContent = document.body.classList.contains('lang-de') ? 'Wird gesendet…' : 'Sending…';

  try {
    const res = await fetch('/api/contact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, message, project })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error);
    formWrap.style.display = 'none';
    formSuccess.style.display = 'block';
  } catch (err) {
    formError.textContent = err.message || 'An error occurred. Please try again.';
    formError.style.display = 'block';
    submitBtn.disabled = false;
    submitBtn.querySelector('span').textContent = document.body.classList.contains('lang-de') ? 'Nachricht senden' : 'Send Message';
  }
});
