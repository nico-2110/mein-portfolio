// ── Contact Form ──────────────────────────────────────────────────────────
const submitBtn = document.getElementById('submitBtn');
const formError = document.getElementById('formError');
const formSuccess = document.getElementById('formSuccess');
const formWrap = document.getElementById('formWrap');

submitBtn?.addEventListener('click', async () => {
  const name = document.getElementById('name').value.trim();
  const email = document.getElementById('email').value.trim();
  const message = document.getElementById('message').value.trim();
  const project = document.getElementById('project').value;

  formError.style.display = 'none';

  if (!name || !email || !message) {
    formError.textContent = 'Bitte alle Pflichtfelder (*) ausfüllen.';
    formError.style.display = 'block';
    return;
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    formError.textContent = 'Bitte eine gültige E-Mail-Adresse eingeben.';
    formError.style.display = 'block';
    return;
  }

  submitBtn.disabled = true;
  submitBtn.querySelector('span').textContent = 'Wird gesendet...';

  try {
    const res = await fetch('/api/contact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, message, project })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Fehler');

    formWrap.style.display = 'none';
    formSuccess.style.display = 'block';
  } catch (err) {
    formError.textContent = err.message || 'Ein Fehler ist aufgetreten. Bitte erneut versuchen.';
    formError.style.display = 'block';
    submitBtn.disabled = false;
    submitBtn.querySelector('span').textContent = 'Nachricht senden';
  }
});

// Enter key on inputs
document.querySelectorAll('.form-group input').forEach(input => {
  input.addEventListener('keydown', e => {
    if (e.key === 'Enter') submitBtn?.click();
  });
});
