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
  const line = (label, value, { link, accent } = {}) => {
    const valueHtml = link
      ? `<a href="${link}" style="color:#F77B00;text-decoration:none;font-weight:700">${value}</a>`
      : `<span style="color:${accent ? '#F77B00' : '#1F1810'};font-weight:700">${value}</span>`;

    return `
      <div style="margin:0 0 8px;font-size:15px;line-height:1.5;text-align:right;direction:rtl">
        <span style="color:#8A7358;font-weight:700">${label}:</span>
        ${valueHtml}
      </div>`;
  };

  const sentAt = new Intl.DateTimeFormat('he-IL', {
    dateStyle: 'medium',
    timeStyle: 'short',
    timeZone: 'Asia/Jerusalem',
  }).format(new Date());

  const details = [
    line('שם', fields.name),
    line('עסק', fields.business),
    line('טלפון', fields.phone, { link: `tel:${fields.phoneRaw}`, accent: true }),
    line('סוג עסק', fields.type),
    fields.notes !== '—' ? line('הערות', fields.notes) : '',
  ].join('');

  const firstName = fields.name.split(' ')[0];

  return `<!DOCTYPE html>
<html lang="he" dir="rtl">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>ליד חדש - Tori</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Assistant:wght@400;600;700;800&display=swap');
  </style>
</head>
<body style="margin:0;padding:0;background:#F4E8D7;font-family:'Assistant',Arial,Helvetica,sans-serif">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#F4E8D7;padding:24px 16px;font-family:'Assistant',Arial,Helvetica,sans-serif">
    <tr>
      <td align="center">
        <table role="presentation" width="460" cellpadding="0" cellspacing="0" border="0" dir="rtl" style="width:100%;max-width:460px;margin:0 auto;background:#FFFFFF;border-radius:16px;overflow:hidden;border:1px solid #EDD9C0;box-shadow:0 8px 24px rgba(31,24,16,0.08);font-family:'Assistant',Arial,Helvetica,sans-serif">
          <tr>
            <td dir="rtl" align="right" style="background:linear-gradient(135deg,#FF8C1A 0%,#F77B00 100%);padding:18px 20px;text-align:right;font-family:'Assistant',Arial,Helvetica,sans-serif">
              <div style="font-size:11px;letter-spacing:0.06em;color:rgba(255,255,255,0.88);font-weight:700;margin-bottom:4px">TORI</div>
              <div style="font-size:24px;line-height:1.2;color:#FFFFFF;font-weight:800">ליד חדש 🎯</div>
            </td>
          </tr>
          <tr>
            <td dir="rtl" align="right" style="padding:18px 20px 10px;text-align:right;font-family:'Assistant',Arial,Helvetica,sans-serif">
              ${details}
            </td>
          </tr>
          <tr>
            <td dir="rtl" align="right" style="padding:4px 20px 18px;text-align:right">
              <a href="tel:${fields.phoneRaw}" style="display:inline-block;background:#FF8C1A;color:#1F1810;text-decoration:none;font-family:'Assistant',Arial,Helvetica,sans-serif;font-size:15px;font-weight:800;padding:11px 20px;border-radius:999px">📞 חזרה ל-${firstName}</a>
            </td>
          </tr>
          <tr>
            <td dir="rtl" align="right" style="padding:0 20px 16px;text-align:right">
              <div style="font-size:11px;color:#8A7358;line-height:1.5;font-family:'Assistant',Arial,Helvetica,sans-serif">${sentAt}</div>
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

const DEFAULT_SUPABASE_URL = 'https://bzjtthjcfngzpopqgzcr.supabase.co';

function getSupabaseConfig() {
  const supabaseUrl = (process.env.SUPABASE_URL || DEFAULT_SUPABASE_URL).trim();
  const serviceKey = process.env.SUPABASE_SERVICE_KEY?.trim() || '';
  return { supabaseUrl, serviceKey };
}

async function insertLeadToSupabase(lead) {
  const { supabaseUrl, serviceKey } = getSupabaseConfig();
  const row = {
    name: lead.name,
    business: lead.business,
    phone: lead.phone,
    business_type: lead.business_type,
    source: 'landing-page',
  };

  if (!serviceKey) {
    console.error('[lead] Supabase insert skipped: SUPABASE_SERVICE_KEY is missing in env');
    return { ok: false, skipped: true, reason: 'missing_service_key' };
  }

  const endpoint = `${supabaseUrl.replace(/\/$/, '')}/rest/v1/leads`;
  console.log('[lead] Supabase insert start', {
    endpoint,
    hasUrl: Boolean(supabaseUrl),
    hasServiceKey: true,
    row,
  });

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        apikey: serviceKey,
        Authorization: `Bearer ${serviceKey}`,
        'Content-Type': 'application/json',
        Prefer: 'return=minimal',
      },
      body: JSON.stringify(row),
    });

    if (!response.ok) {
      const errText = await response.text();
      const message = errText || `HTTP ${response.status}`;
      console.error('[lead] Supabase insert failed:', {
        status: response.status,
        message,
        row,
      });
      return { ok: false, status: response.status, message };
    }

    console.log('[lead] Supabase insert success', { status: response.status, row });
    return { ok: true, status: response.status };
  } catch (err) {
    console.error('[lead] Supabase insert failed:', {
      message: err?.message || String(err),
      name: err?.name,
      row,
    });
    return { ok: false, message: err?.message || String(err) };
  }
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

  const supabaseResult = await insertLeadToSupabase({
    name: fields.nameRaw,
    business: fields.businessRaw,
    phone: fields.phoneRaw,
    business_type: fields.typeRaw,
  });

  if (!supabaseResult.ok) {
    console.error('[lead] Continuing to Resend despite Supabase failure', supabaseResult);
  }

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
