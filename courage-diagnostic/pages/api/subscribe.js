// Bot protection layers, cheapest first:
//   1. Honeypot field (invisible to real users, bots fill it in)
//   2. Submission timing (a human cannot complete this form instantly)
//   3. Cloudflare Turnstile token, verified server-side
//   4. Strict email validation + field length caps
// Mailchimp status is 'pending', so every address must confirm by email
// before it lands in the audience. Bots never confirm.

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,}$/;
const MIN_FILL_MS = 3000;
const MAX_LEN = 200;

const clean = (v) => (typeof v === 'string' ? v.trim().slice(0, MAX_LEN) : '');

async function verifyTurnstile(token, ip) {
  const secret = process.env.TURNSTILE_SECRET_KEY;
  // Not configured yet: skip this layer rather than blocking everyone.
  if (!secret) return true;
  if (!token || typeof token !== 'string') return false;
  try {
    const r = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ secret, response: token, remoteip: ip || undefined }),
    });
    const d = await r.json();
    return d.success === true;
  } catch (e) {
    console.error('Turnstile verify error:', e);
    return false;
  }
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { email, firstName, lastName, org, role, hp, elapsedMs, token } = req.body || {};

  // 1. Honeypot. Return 200 so bots cannot tell they were caught.
  if (typeof hp === 'string' && hp.trim() !== '') {
    console.log('Blocked signup: honeypot filled');
    return res.status(200).json({ success: true });
  }

  // 2. Timing.
  if (typeof elapsedMs !== 'number' || !isFinite(elapsedMs) || elapsedMs < MIN_FILL_MS) {
    console.log('Blocked signup: submitted too fast', elapsedMs);
    return res.status(400).json({ error: 'Please take a moment to complete the form.' });
  }

  // 4. Validation.
  const address = clean(email);
  if (!address || !EMAIL_RE.test(address)) {
    return res.status(400).json({ error: 'A valid email address is required' });
  }

  // 3. Turnstile.
  const ip = String(req.headers['x-forwarded-for'] || '').split(',')[0].trim();
  const human = await verifyTurnstile(token, ip);
  if (!human) {
    console.log('Blocked signup: Turnstile verification failed');
    return res.status(400).json({ error: 'Verification failed. Please try again.' });
  }

  const API_KEY = process.env.MAILCHIMP_API_KEY;
  const LIST_ID = process.env.MAILCHIMP_LIST_ID;
  if (!API_KEY || !LIST_ID) {
    console.error('Missing Mailchimp configuration');
    return res.status(500).json({ error: 'Server error' });
  }
  const DC = API_KEY.split('-')[1];
  const auth = Buffer.from('anystring:' + API_KEY).toString('base64');

  try {
    const r = await fetch('https://' + DC + '.api.mailchimp.com/3.0/lists/' + LIST_ID + '/members', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: 'Basic ' + auth },
      body: JSON.stringify({
        email_address: address,
        status: 'pending',
        merge_fields: {
          FNAME: clean(firstName),
          LNAME: clean(lastName),
          MMERGE6: clean(org),
          MMERGE7: clean(role),
        },
      }),
    });

    const data = await r.json();
    console.log('Mailchimp response:', JSON.stringify(data));
    if (r.ok || data.title === 'Member Exists') {
      return res.status(200).json({ success: true });
    }
    return res.status(400).json({ error: data.detail || 'Subscription failed' });
  } catch (e) {
    console.error('Subscribe error:', e);
    return res.status(500).json({ error: 'Server error' });
  }
}
