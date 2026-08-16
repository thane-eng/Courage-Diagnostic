// Updates the Mailchimp member with their diagnostic scores after completion.
// Requires these merge fields in Mailchimp (Audience → Settings → Audience fields):
//   SCORE (number)  — overall Courage Score
//   IW, CU, CH, TR, CO (number) — the five element scores
//   DRIVER (text) — lowest-scoring element code: IW | CU | CH | TR | CO
// Also applies the tag "diagnostic-complete" so automations can start only
// after scores (and DRIVER) are written — not at bare email capture.
//
// Email 1 can then use conditional merge tags, e.g.:
//   *|IF:DRIVER=IW|*
//     [Important Work Cost Brief link]
//   *|ELSEIF:DRIVER=CU|*
//     ...
//   *|END:IF|*

import crypto from 'crypto';

function lowestDriver(iw, cu, ch, tr, co) {
  const scores = {
    IW: Number(iw) || 0,
    CU: Number(cu) || 0,
    CH: Number(ch) || 0,
    TR: Number(tr) || 0,
    CO: Number(co) || 0,
  };
  // Lowest score wins; ties break in framework chain order
  const order = ['IW', 'CU', 'CH', 'TR', 'CO'];
  return order.reduce((best, key) => (scores[key] < scores[best] ? key : best));
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { email, total, iw, cu, ch, tr, co } = req.body || {};
  if (!email || typeof email !== 'string') {
    return res.status(400).json({ error: 'Email required' });
  }

  const API_KEY = process.env.MAILCHIMP_API_KEY;
  const LIST_ID = process.env.MAILCHIMP_LIST_ID;
  if (!API_KEY || !LIST_ID) {
    console.error('Missing Mailchimp configuration');
    return res.status(500).json({ error: 'Server error' });
  }

  const DC = API_KEY.split('-')[1];
  const auth = Buffer.from(`anystring:${API_KEY}`).toString('base64');
  const hash = crypto.createHash('md5').update(email.toLowerCase().trim()).digest('hex');
  const driver = lowestDriver(iw, cu, ch, tr, co);

  try {
    // 1. Write scores + DRIVER onto the member
    const r = await fetch(
      `https://${DC}.api.mailchimp.com/3.0/lists/${LIST_ID}/members/${hash}`,
      {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Basic ${auth}`,
        },
        body: JSON.stringify({
          merge_fields: {
            SCORE: total ?? 0,
            IW: iw ?? 0,
            CU: cu ?? 0,
            CH: ch ?? 0,
            TR: tr ?? 0,
            CO: co ?? 0,
            DRIVER: driver,
          },
        }),
      }
    );

    const data = await r.json();
    if (!r.ok) {
      console.error('Mailchimp score update failed:', JSON.stringify(data));
      return res.status(400).json({ error: data.detail || 'Score update failed' });
    }

    // 2. Tag so automations can fire only after scores exist
    try {
      await fetch(
        `https://${DC}.api.mailchimp.com/3.0/lists/${LIST_ID}/members/${hash}/tags`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Basic ${auth}`,
          },
          body: JSON.stringify({
            tags: [
              { name: 'diagnostic-complete', status: 'active' },
              { name: `driver-${driver.toLowerCase()}`, status: 'active' },
            ],
          }),
        }
      );
    } catch (tagErr) {
      // Non-fatal: scores are already saved
      console.error('Mailchimp tag update failed:', tagErr);
    }

    return res.status(200).json({ success: true, driver });
  } catch (e) {
    console.error('Score update error:', e);
    return res.status(500).json({ error: 'Server error' });
  }
}
