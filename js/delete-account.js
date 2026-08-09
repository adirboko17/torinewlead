// Delete-account form → /api/delete-account (Vercel + Resend)
(function () {
  function normalizeIsraeliPhone(value) {
    let digits = String(value || '').replace(/\D/g, '');
    if (digits.startsWith('972')) digits = '0' + digits.slice(3);
    else if (digits.length === 9 && digits.startsWith('5')) digits = '0' + digits;
    return digits;
  }

  function isValidIsraeliPhone(value) {
    const digits = normalizeIsraeliPhone(value);
    if (/^05[0-9]{8}$/.test(digits)) return true;
    if (/^0[234589][0-9]{7,8}$/.test(digits)) return true;
    if (/^07[0-9]{8}$/.test(digits)) return true;
    return false;
  }

  function formatIsraeliPhone(value) {
    const digits = normalizeIsraeliPhone(value);
    if (/^05[0-9]{8}$/.test(digits)) return digits.slice(0, 3) + '-' + digits.slice(3);
    if (/^0[234589][0-9]{7,8}$/.test(digits)) return digits.slice(0, 2) + '-' + digits.slice(2);
    if (/^07[0-9]{8}$/.test(digits)) return digits.slice(0, 3) + '-' + digits.slice(3);
    return value.trim();
  }

  function setPhoneFieldError(show) {
    const field = document.getElementById('da-phone-field');
    const input = document.getElementById('da-phone');
    const error = document.getElementById('da-phone-error');
    if (!field || !input || !error) return false;

    field.classList.toggle('invalid', show);
    input.setAttribute('aria-invalid', show ? 'true' : 'false');
    error.hidden = !show;
    if (show) input.focus();
    return show;
  }

  const form = document.getElementById('delete-account-form');
  if (!form) return;

  const phoneInput = document.getElementById('da-phone');
  if (phoneInput) {
    phoneInput.addEventListener('input', () => {
      if (isValidIsraeliPhone(phoneInput.value)) setPhoneFieldError(false);
    });
    phoneInput.addEventListener('blur', () => {
      const value = phoneInput.value.trim();
      if (!value) {
        setPhoneFieldError(false);
        return;
      }
      if (!isValidIsraeliPhone(value)) {
        setPhoneFieldError(true);
        return;
      }
      phoneInput.value = formatIsraeliPhone(value);
      setPhoneFieldError(false);
    });
  }

  form.addEventListener('submit', async (ev) => {
    ev.preventDefault();

    const card = form.closest('.form-card');
    const btn = form.querySelector('button[type="submit"]');
    const phoneValue = phoneInput?.value?.trim() || '';
    const confirmEl = document.getElementById('da-confirm');

    if (!isValidIsraeliPhone(phoneValue)) {
      setPhoneFieldError(true);
      return;
    }

    if (!confirmEl?.checked) {
      window.alert('יש לאשר את בקשת המחיקה לפני השליחה.');
      confirmEl?.focus();
      return;
    }

    const formattedPhone = formatIsraeliPhone(phoneValue);
    if (phoneInput) phoneInput.value = formattedPhone;

    const payload = {
      name: document.getElementById('da-name')?.value?.trim() || '',
      phone: formattedPhone,
      app: document.getElementById('da-app')?.value?.trim() || '',
      notes: document.getElementById('da-notes')?.value?.trim() || '',
      confirm: true,
    };

    if (!payload.name || !payload.app) {
      window.alert('נא למלא את כל השדות החובה.');
      return;
    }

    if (btn) {
      btn.disabled = true;
      btn.dataset.originalHtml = btn.innerHTML;
      btn.textContent = 'שולח...';
    }

    try {
      const res = await fetch('/api/delete-account', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        if (res.status === 400 && data.error === 'Invalid phone number') {
          setPhoneFieldError(true);
        }
        throw new Error('send failed');
      }

      card?.classList.add('sent');
    } catch (err) {
      if (btn) {
        btn.disabled = false;
        btn.innerHTML = btn.dataset.originalHtml || 'שליחת בקשת מחיקה';
      }
      window.alert('לא הצלחנו לשלוח את הבקשה. נסו שוב או פנו לתמיכה.');
    }
  });
})();
