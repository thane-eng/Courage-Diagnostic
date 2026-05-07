export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
 
  const { email, firstName, lastName, org, role } = req.body;
  if (!email) return res.status(400).json({ error: 'Email required' });
 
  const API_KEY  = process.env.MAILCHIMP_API_KEY;
  const LIST_ID  = process.env.MAILCHIMP_LIST_ID;
  const DC       = API_KEY.split('-')[1];
  const auth     = Buffer.from(`anystring:${API_KEY}`).toString('base64');
 
  try {
    const r = await fetch(`https://${DC}.api.mailchimp.com/3.0/lists/${LIST_ID}/members`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Basic ${auth}` },
      body: JSON.stringify({
        email_address: email,
        status: 'subscribed',
        merge_fields: {
          FNAME: firstName || '',
          LNAME: lastName  || '',
          MMERGE3: org  || '',
          MMERGE4: role || '',
        },
      }),
    });
 
    const data = await r.json();
    if (r.ok || data.title === 'Member Exists') {
      return res.status(200).json({ success: true });
    }
    return res.status(400).json({ error: data.detail || 'Subscription failed' });
  } catch (e) {
    return res.status(500).json({ error: 'Server error' });
  }
}
