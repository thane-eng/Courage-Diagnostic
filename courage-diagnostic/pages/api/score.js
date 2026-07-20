
// Updates the Mailchimp member with their diagnostic scores after completion.
// Requires these merge fields to exist in your Mailchimp audience settings
// (Audience → Settings → Audience fields and *|MERGE|* tags):
//   SCORE (number)  — overall Courage Score
//   IW, CU, CH, TR, CO (number) — the five element scores
// With these in place, a follow-up automation can say:
//   "Yesterday you scored *|SCORE|*. Here's what that costs:
//    https://diagnostic.bellomoleadership.com/calculator.html?iw=*|IW|*&cu=*|CU|*&ch=*|CH|*&tr=*|TR|*&co=*|CO|*"
 
import crypto from 'crypto';
 
export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
 
  const { email, total, iw, cu, ch, tr, co } = req.body;
  if (!email) return res.status(400).json({ error: 'Email required' });
 
  const API_KEY = process.env.MAILCHIMP_API_KEY;
  const LIST_ID = process.env.MAILCHIMP_LIST_ID;
  const DC      = API_KEY.split('-')[1];
  const auth    = Buffer.from(`anystring:${API_KEY}`).toString('base64');
 
  // Mailchimp member endpoint uses the MD5 hash of the lowercased email
  const hash = crypto.createHash('md5').update(email.toLowerCase()).digest('hex');
 
  try {
    const r = await fetch(`https://${DC}.api.mailchimp.com/3.0/lists/${LIST_ID}/members/${hash}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: `Basic ${auth}` },
      body: JSON.stringify({
        merge_fields: {
          SCORE: total ?? 0,
          IW: iw ?? 0,
          CU: cu ?? 0,
          CH: ch ?? 0,
          TR: tr ?? 0,
          CO: co ?? 0,
        },
      }),
    });
 
    const data = await r.json();
    if (r.ok) return res.status(200).json({ success: true });
    console.error('Mailchimp score update failed:', JSON.stringify(data));
    return res.status(400).json({ error: data.detail || 'Score update failed' });
  } catch (e) {
    console.error('Score update error:', e);
    return res.status(500).json({ error: 'Server error' });
  }
}
 