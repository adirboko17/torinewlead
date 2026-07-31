function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

module.exports = async (req, res) => {
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    return res.status(204).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const apiKey = process.env.RESEND_API_KEY;
  const toEmail = process.env.LEAD_TO_EMAIL;
  const fromEmail = process.env.LEAD_FROM_EMAIL;

  if (!apiKey || !toEmail || !fromEmail) {
    console.error('Missing RESEND_API_KEY, LEAD_TO_EMAIL, or LEAD_FROM_EMAIL');
    return res.status(500).json({ error: 'Server not configured' });
  }

  const { name, business, phone, type, notes } = req.body || {};

  if (!name?.trim() || !business?.trim() || !phone?.trim() || !type?.trim()) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const safeName = escapeHtml(name.trim());
  const safeBusiness = escapeHtml(business.trim());
  const safePhone = escapeHtml(phone.trim());
  const safeType = escapeHtml(type.trim());
  const safeNotes = escapeHtml(notes?.trim() || '—');

  const html = `
    <div dir="rtl" style="font-family:Arial,sans-serif;line-height:1.6;color:#111">
      <h2 style="margin:0 0 16px">ליד חדש מ-Tori</h2>
      <p><strong>שם:</strong> ${safeName}</p>
      <p><strong>עסק:</strong> ${safeBusiness}</p>
      <p><strong>טלפון:</strong> ${safePhone}</p>
      <p><strong>סוג עסק:</strong> ${safeType}</p>
      <p><strong>הערות:</strong> ${safeNotes}</p>
    </div>
  `;

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: fromEmail,
        to: [toEmail],
        subject: `ליד חדש: ${name.trim()} — ${business.trim()}`,
        html,
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error('Resend error:', response.status, errText);
      return res.status(502).json({ error: 'Failed to send email' });
    }

    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error('Lead API error:', err);
    return res.status(500).json({ error: 'Server error' });
  }
};
