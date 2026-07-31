function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

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
  return String(value || '').trim();
}

function buildLeadEmailHtml(fields) {
  const rows = [
    { label: 'שם מלא', value: fields.name, highlight: true },
    { label: 'שם העסק', value: fields.business },
    { label: 'טלפון', value: fields.phone, link: `tel:${fields.phoneRaw}` },
    { label: 'סוג עסק', value: fields.type },
    { label: 'הערות', value: fields.notes },
  ];

  const rowHtml = rows.map(({ label, value, highlight, link }) => {
    const valueCell = link
      ? `<a href="${link}" style="color:#F77B00;text-decoration:none;font-weight:700">${value}</a>`
      : `<span style="color:#1F1810;font-size:16px;font-weight:${highlight ? '700' : '600'}">${value}</span>`;

    return `
      <tr>
        <td style="padding:14px 18px;border-bottom:1px solid #F0E4D4;background:#FFFCF7">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
            <tr>
              <td style="font-size:13px;color:#8A7358;font-weight:700;padding-bottom:4px">${label}</td>
            </tr>
            <tr>
              <td>${valueCell}</td>
            </tr>
          </table>
        </td>
      </tr>`;
  }).join('');

  const sentAt = new Intl.DateTimeFormat('he-IL', {
    dateStyle: 'medium',
    timeStyle: 'short',
    timeZone: 'Asia/Jerusalem',
  }).format(new Date());

  return `<!DOCTYPE html>
<html lang="he" dir="rtl">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>ליד חדש מ-Tori</title>
</head>
<body style="margin:0;padding:0;background:#F4E8D7;font-family:Arial,Helvetica,sans-serif">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#F4E8D7;padding:32px 16px">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:560px;background:#FFFFFF;border-radius:20px;overflow:hidden;border:1px solid #EDD9C0;box-shadow:0 10px 30px rgba(31,24,16,0.08)">
          <tr>
            <td style="background:linear-gradient(135deg,#FF8C1A 0%,#F77B00 100%);padding:28px 24px;text-align:center">
              <div style="font-size:12px;letter-spacing:0.08em;color:rgba(255,255,255,0.85);font-weight:700;margin-bottom:8px">TORI LEADS</div>
              <div style="font-size:28px;line-height:1.2;color:#FFFFFF;font-weight:800">ליד חדש 🎯</div>
              <div style="font-size:14px;color:rgba(255,255,255,0.92);margin-top:8px">מישהו השאיר פרטים בדף הנחיתה</div>
            </td>
          </tr>
          <tr>
            <td style="padding:22px 24px 8px">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#FFF7EC;border:1px solid #FFDDB3;border-radius:14px">
                <tr>
                  <td style="padding:16px 18px">
                    <div style="font-size:13px;color:#8A7358;font-weight:700;margin-bottom:4px">ליד מ-${fields.name}</div>
                    <div style="font-size:22px;line-height:1.3;color:#1F1810;font-weight:800">${fields.business}</div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding:8px 24px 0">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border:1px solid #F0E4D4;border-radius:14px;overflow:hidden">
                ${rowHtml}
              </table>
            </td>
          </tr>
          <tr>
            <td align="center" style="padding:24px">
              <a href="tel:${fields.phoneRaw}" style="display:inline-block;background:#FF8C1A;color:#1F1810;text-decoration:none;font-size:16px;font-weight:800;padding:14px 28px;border-radius:999px">📞 חזרה ל-${fields.name.split(' ')[0]}</a>
            </td>
          </tr>
          <tr>
            <td style="padding:0 24px 24px;text-align:center">
              <div style="font-size:12px;color:#8A7358;line-height:1.6">נשלח אוטומטית מ-Tori · ${sentAt}</div>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

function buildLeadEmailText(fields) {
  return [
    'ליד חדש מ-Tori',
    '',
    `שם: ${fields.nameRaw}`,
    `עסק: ${fields.businessRaw}`,
    `טלפון: ${fields.phoneRaw}`,
    `סוג עסק: ${fields.typeRaw}`,
    `הערות: ${fields.notesRaw}`,
  ].join('\n');
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

  if (!isValidIsraeliPhone(phone)) {
    return res.status(400).json({ error: 'Invalid phone number' });
  }

  const formattedPhone = formatIsraeliPhone(phone);
  const safeName = escapeHtml(name.trim());
  const safeBusiness = escapeHtml(business.trim());
  const safePhone = escapeHtml(formattedPhone);
  const safeType = escapeHtml(type.trim());
  const safeNotes = escapeHtml(notes?.trim() || '—');
  const phoneRaw = normalizeIsraeliPhone(formattedPhone);

  const fields = {
    name: safeName,
    business: safeBusiness,
    phone: safePhone,
    type: safeType,
    notes: safeNotes,
    phoneRaw,
    nameRaw: name.trim(),
    businessRaw: business.trim(),
    typeRaw: type.trim(),
    notesRaw: notes?.trim() || '—',
  };

  const html = buildLeadEmailHtml(fields);
  const text = buildLeadEmailText(fields);

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
        subject: 'ליד חדש - Tori',
        html,
        text,
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
