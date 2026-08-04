
import { useState, useEffect } from 'react';
import Head from 'next/head';
 
// ── QUESTIONS ──────────────────────────────────────────────────────────────
const QUESTIONS = [
  // Important Work
  { id: 1,  element: 'Important Work', text: "People here understand why their work matters beyond hitting targets." },
  { id: 2,  element: 'Important Work', text: "Our goals are ambitious enough that achieving them requires honesty, not just performance theater." },
  { id: 3,  element: 'Important Work', text: "When work becomes disconnected from purpose, leaders address it rather than ignore it." },
  { id: 4,  element: 'Important Work', text: "Leaders consistently connect daily tasks to something that genuinely matters." },
  { id: 5,  element: 'Important Work', text: "Our organization's stated purpose matches what actually gets prioritized." },
  { id: 6,  element: 'Important Work', text: "Difficult conversations happen here because the work demands them." },
  { id: 7,  element: 'Important Work', text: "I would be proud to describe accurately what this organization does and how it operates." },
  // Curiosity
  { id: 8,  element: 'Curiosity', text: "Leaders here ask genuine questions — not rhetorical ones designed to make a point." },
  { id: 9,  element: 'Curiosity', text: "When someone raises a concern, it receives real consideration." },
  { id: 10, element: 'Curiosity', text: "Our meetings surface new information, not just confirmations of what leadership already believes." },
  { id: 11, element: 'Curiosity', text: "Leaders here genuinely change their minds when presented with better information." },
  { id: 12, element: 'Curiosity', text: "It is safe to say 'I don't know' in this organization." },
  { id: 13, element: 'Curiosity', text: "Diverse perspectives are actively sought out, not just tolerated." },
  { id: 14, element: 'Curiosity', text: "Information flows freely across levels — people are not kept in the dark." },
  // Challenge
  { id: 15, element: 'Challenge', text: "People here are willing to say the uncomfortable thing out loud." },
  { id: 16, element: 'Challenge', text: "Disagreement is treated as useful information, not disloyalty." },
  { id: 17, element: 'Challenge', text: "When a bad idea comes from senior leadership, it gets challenged." },
  { id: 18, element: 'Challenge', text: "This organization has a track record of changing course when evidence demands it." },
  { id: 19, element: 'Challenge', text: "People who raise problems are valued here, not managed out." },
  { id: 20, element: 'Challenge', text: "Leaders model the willingness to be wrong." },
  { id: 21, element: 'Challenge', text: "Candor is rewarded more consistently than conformity." },
  // Trust
  { id: 22, element: 'Trust', text: "Leaders in this organization do what they say they will do." },
  { id: 23, element: 'Trust', text: "Commitments are kept even when it is inconvenient." },
  { id: 24, element: 'Trust', text: "When leaders make mistakes, they acknowledge them directly." },
  { id: 25, element: 'Trust', text: "Performance feedback here reflects reality, not politics." },
  { id: 26, element: 'Trust', text: "There is consistency between what leaders say privately and publicly." },
  { id: 27, element: 'Trust', text: "The gap between our stated values and our actual behavior is small." },
  { id: 28, element: 'Trust', text: "I trust that telling the truth here is safer than concealing it." },
  // Community
  { id: 29, element: 'Community', text: "People in this organization genuinely want each other to succeed." },
  { id: 30, element: 'Community', text: "Credit is shared rather than hoarded." },
  { id: 31, element: 'Community', text: "When someone struggles, others step in without being asked." },
  { id: 32, element: 'Community', text: "There is a genuine sense of shared identity and purpose here." },
  { id: 33, element: 'Community', text: "People stay because of who they work with, not just what they earn." },
  { id: 34, element: 'Community', text: "People speak well of this organization when they are not at work." },
  { id: 35, element: 'Community', text: "The relationships here would survive a significant leadership change." },
];
 
const ELEMENTS = ['Important Work', 'Curiosity', 'Challenge', 'Trust', 'Community'];
const SCALE = ['Strongly Disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly Agree'];
 
// ── SCORING ────────────────────────────────────────────────────────────────
function elementScore(answers, el) {
  const qs = QUESTIONS.filter(q => q.element === el).filter(q => answers[q.id]);
  if (!qs.length) return 0;
  return Math.round(qs.reduce((s, q) => s + answers[q.id], 0) / (qs.length * 5) * 100);
}
function overallScore(answers) {
  return Math.round(ELEMENTS.map(el => elementScore(answers, el)).reduce((a, b) => a + b) / ELEMENTS.length);
}
function lieRisk(answers) {
  const avg = (elementScore(answers, 'Challenge') + elementScore(answers, 'Trust')) / 2;
  if (avg < 40) return { level: 'High',     color: '#c0392b', bg: 'rgba(192,57,43,0.12)' };
  if (avg < 65) return { level: 'Moderate', color: '#c9a052', bg: 'rgba(201,160,82,0.12)' };
  return           { level: 'Low',      color: '#27ae60', bg: 'rgba(39,174,96,0.12)' };
}
function scoreColor(s) { return s < 45 ? '#c0392b' : s < 65 ? '#c9a052' : '#27ae60'; }
function scoreLabel(s) {
  if (s < 40) return 'Critical'; if (s < 55) return 'At Risk';
  if (s < 70) return 'Developing'; if (s < 85) return 'Strong'; return 'Exceptional';
}
 
// ── NARRATIVES ─────────────────────────────────────────────────────────────
const NARRATIVES = {
  'Important Work': {
    low: "Work here has become disconnected from genuine purpose. People are executing tasks without a clear line to what matters. This is where the Lie Economy takes root — when work loses its weight, dishonesty about progress carries no real cost.",
    mid: "There's a foundation of meaningful work, but gaps remain between stated purpose and daily reality. Some leaders connect the dots; others don't. That inconsistency breeds quiet cynicism over time.",
    high: "Important work is a genuine strength here. People understand why what they do matters — and that shared weight creates conditions where honesty becomes less costly.",
  },
  'Curiosity': {
    low: "Questions here are mostly rhetorical. Leaders ask but aren't really listening. This creates a dangerous information problem — leadership operates on a version of reality no one is willing to correct.",
    mid: "Curiosity exists but unevenly. Some leaders genuinely listen and update their thinking; others perform listening while filtering for confirmation. That variance is itself a systemic risk.",
    high: "Genuine curiosity is a cultural strength. Leaders ask real questions and change their minds. This is one of the most powerful antidotes to a Lie Economy — it creates a real market for honest information.",
  },
  'Challenge': {
    low: "The uncomfortable thing does not get said out loud here. Whether through fear, habit, or learned helplessness, this organization has developed a sophisticated system for avoiding honest disagreement. This is the core mechanism of the Lie Economy.",
    mid: "Challenge exists at some levels but not others. The critical question is whether difficult truths reach the people who can act on them — or stop at the level where they become professionally risky.",
    high: "The willingness to challenge is a genuine organizational strength. Disagreement is treated as information, not disloyalty. This is the Courage Economy at work — and it is rarer than most leaders believe.",
  },
  'Trust': {
    low: "Trust is significantly eroded. The gap between what leaders say and what they do has become visible and predictable. People have adjusted accordingly — they share less, commit to less, and expect less. This is a late-stage Lie Economy pattern.",
    mid: "Trust is functional but fragile. Leaders are reliable in routine circumstances, but there's uncertainty about whether they'll hold the line when honesty is expensive. That uncertainty shapes behavior in ways that are hard to see from the top.",
    high: "Trust is a genuine organizational asset. Commitments are kept. Mistakes are acknowledged. People believe that telling the truth here is safer than concealing it. This is the foundation everything else is built on.",
  },
  'Community': {
    low: "Community has not formed here — or it has formed in competing fragments. People are not invested in each other's success. This makes the costs of honesty higher, because there's no relational foundation to absorb them.",
    mid: "Community exists in pockets. Teams may be strong, but cross-functional trust is uneven. The question is whether relationships are deep enough to support real honesty when something important is at stake.",
    high: "Community is a genuine strength. People are invested in each other. This is both the result of the other four elements — and what makes them sustainable. A real community makes truth-telling less costly, because there is something worth protecting.",
  },
};
function elNarrative(el, s) { return NARRATIVES[el][s < 45 ? 'low' : s < 70 ? 'mid' : 'high']; }
function overallNarrative(s) {
  if (s < 40) return "This organization is operating in a Lie Economy. The gap between what is said and what is true has become systemic. It is not the result of bad people — it is the result of a system that has made honesty too costly and comfortable lies too convenient. Lie Economies are reversible. But not without naming what is actually happening.";
  if (s < 58) return "This organization is at a crossroads. There are genuine strengths — pockets of real trust, meaningful work, moments of honest challenge. But there are also significant gaps where the Lie Economy has taken hold. The question is not whether this organization can build a Courage Economy. The question is whether leadership is willing to pay the cost of closing the gaps.";
  if (s < 75) return "This organization has meaningful Courage Economy foundations. Leaders have made real investments in trust, purpose, and honest challenge. The work now is to close the remaining gaps — to make courage the default rather than the exception. The infrastructure is there. The question is whether it extends to the hardest moments.";
  return "This organization demonstrates strong Courage Economy characteristics across multiple dimensions. The culture here makes truth-telling less costly than in most organizations — which means better decisions, stronger teams, and more durable performance. The work at this level is to sustain it deliberately. Courage Economies require ongoing maintenance. Complacency is the enemy.";
}
 
// ── STYLES ─────────────────────────────────────────────────────────────────
const S = {
  page:       { minHeight: '100vh', background: '#0a1f3d', color: '#e8e4dc' },
  center:     { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', padding: '48px 24px' },
  wrap:       { maxWidth: '680px', width: '100%', margin: '0 auto' },
  wrapWide:   { maxWidth: '800px', width: '100%', margin: '0 auto', padding: '60px 24px' },
  h1:         { fontFamily: "'Playfair Display', serif", fontSize: 'clamp(2rem,5vw,3.2rem)', fontWeight: 700, lineHeight: 1.15, color: '#fff' },
  h2:         { fontFamily: "'Playfair Display', serif", fontSize: 'clamp(1.3rem,3vw,1.9rem)', fontWeight: 700, color: '#fff' },
  eyebrow:    { fontSize: '0.75rem', fontWeight: 600, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#c9a052' },
  body:       { fontSize: '1rem', lineHeight: 1.75, color: '#b8b4ac' },
  gold:       { color: '#c9a052' },
  divider:    { width: '48px', height: '3px', background: '#c9a052', marginTop: '20px', marginBottom: '28px' },
  card:       { background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px', padding: '28px' },
  btnGold:    { background: '#c9a052', color: '#0a1f3d', border: 'none', padding: '16px 40px', fontSize: '0.95rem', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', cursor: 'pointer', borderRadius: '4px' },
  btnOutline: { background: 'transparent', color: '#c9a052', border: '1px solid rgba(201,160,82,0.5)', padding: '12px 28px', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer', borderRadius: '4px', letterSpacing: '0.05em' },
  input:      { width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '4px', padding: '14px 16px', color: '#e8e4dc', fontSize: '1rem', fontFamily: 'Inter, sans-serif' },
  label:      { display: 'block', marginBottom: '8px', fontSize: '0.8rem', fontWeight: 600, color: '#7a7670', textTransform: 'uppercase', letterSpacing: '0.1em' },
};
 
// ── INTRO ──────────────────────────────────────────────────────────────────
function Intro({ onStart }) {
  return (
    <div style={{ ...S.page, background: 'linear-gradient(150deg,#0a1f3d 0%,#1a3d6b 100%)' }}>
      <div style={{ ...S.center, textAlign: 'center' }}>
        <div style={S.wrap}>
          <p style={{ ...S.eyebrow, marginBottom: '28px' }}>Bellomo Leadership</p>
          <h1 style={S.h1}>The Courage Economy<br /><span style={S.gold}>Diagnostic</span></h1>
          <div style={{ ...S.divider, margin: '20px auto 28px' }} />
          <p style={{ ...S.body, maxWidth: '520px', margin: '0 auto 16px' }}>
            Most organizations run on comfortable lies. This diagnostic measures where yours actually stands — across the five elements of a Courage Economy — and shows you where the gaps are.
          </p>
          <p style={{ fontSize: '0.85rem', color: '#5a5650', marginBottom: '44px' }}>35 questions · 15–20 minutes · Confidential</p>
          <button style={S.btnGold} onClick={onStart}>Begin the Diagnostic →</button>
          <p style={{ fontSize: '0.75rem', color: '#3a3630', marginTop: '36px' }}>
            A Bellomo Leadership Assessment Tool · Based on The Courageous Organization framework
          </p>
        </div>
      </div>
    </div>
  );
}
 
// ── INFO ───────────────────────────────────────────────────────────────────
const TURNSTILE_SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || '';
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,}$/;
const MIN_FILL_MS = 3200;

function Info({ name, org, role, email, setName, setOrg, setRole, setEmail, onStart }) {
  const [loading, setLoading] = useState(false);
  // Honeypot: invisible to real users, so any value in it means a bot.
  const [hp, setHp] = useState('');
  // Set on mount so the API can reject instant (scripted) submissions.
  const [startedAt, setStartedAt] = useState(0);
  const [token, setToken] = useState('');

  useEffect(() => { setStartedAt(Date.now()); }, []);

  // Load + render Cloudflare Turnstile. No site key set = layer stays off.
  useEffect(() => {
    if (!TURNSTILE_SITE_KEY) return;
    let cancelled = false;
    function render() {
      if (cancelled) return;
      const box = document.getElementById('cf-turnstile');
      if (!window.turnstile || !box || box.dataset.rendered) return;
      box.dataset.rendered = '1';
      window.turnstile.render(box, {
        sitekey: TURNSTILE_SITE_KEY,
        callback: t => setToken(t),
        'expired-callback': () => setToken(''),
        'error-callback': () => setToken(''),
      });
    }
    if (window.turnstile) { render(); return; }
    let s = document.getElementById('cf-turnstile-script');
    if (!s) {
      s = document.createElement('script');
      s.id = 'cf-turnstile-script';
      s.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
      s.async = true;
      s.defer = true;
      document.head.appendChild(s);
    }
    s.addEventListener('load', render);
    return () => { cancelled = true; s.removeEventListener('load', render); };
  }, []);

  const ok = name.trim() && org.trim() && EMAIL_RE.test(email.trim()) && (!TURNSTILE_SITE_KEY || !!token);

  async function handleStart() {
    if (!ok || loading) return;
    setLoading(true);
    // If a real user was unusually quick, wait out the minimum instead of
    // letting the server's timing check silently drop their signup.
    const early = MIN_FILL_MS - (startedAt ? Date.now() - startedAt : 0);
    if (early > 0) await new Promise(r => setTimeout(r, early));
    const parts = name.trim().split(' ');
    try {
      await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.trim(),
          firstName: parts[0] || '',
          lastName: parts.slice(1).join(' ') || '',
          org,
          role,
          hp,
          elapsedMs: startedAt ? Date.now() - startedAt : 0,
          token,
        }),
      });
    } catch (e) {}
    setLoading(false);
    onStart();
  }

  return (
    <div style={S.page}>
      <div style={S.center}>
        <div style={S.wrap}>
          <p style={{ ...S.eyebrow, marginBottom: '14px' }}>Before we begin</p>
          <h2 style={S.h2}>Tell us about yourself</h2>
          <div style={S.divider} />
          <p style={{ ...S.body, marginBottom: '36px' }}>Your responses are confidential. This information helps us contextualize your results.</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginBottom: '40px' }}>
            <div>
              <label style={S.label}>Your Name *</label>
              <input style={S.input} value={name} onChange={e => setName(e.target.value)} placeholder="First and last name" />
            </div>
            <div>
              <label style={S.label}>Email Address *</label>
              <input style={S.input} type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="your@email.com" />
            </div>
            <div>
              <label style={S.label}>Organization *</label>
              <input style={S.input} value={org} onChange={e => setOrg(e.target.value)} placeholder="Company or department name" />
            </div>
            <div>
              <label style={S.label}>Your Role</label>
              <input style={S.input} value={role} onChange={e => setRole(e.target.value)} placeholder="e.g., CHRO, VP of HR, Director" />
            </div>
            {/* Honeypot. Kept off-screen rather than display:none so bots still see it. */}
            <div aria-hidden="true" style={{ position: 'absolute', left: '-9999px', width: '1px', height: '1px', overflow: 'hidden' }}>
              <label htmlFor="company-website">Company website</label>
              <input id="company-website" name="company-website" type="text" tabIndex={-1} autoComplete="off" value={hp} onChange={e => setHp(e.target.value)} />
            </div>
          </div>
          {TURNSTILE_SITE_KEY ? <div id="cf-turnstile" style={{ marginBottom: '28px' }} /> : null}
          <button style={{ ...S.btnGold, opacity: ok ? 1 : 0.35, cursor: ok && !loading ? 'pointer' : 'default' }} onClick={handleStart}>
            {loading ? 'Starting…' : 'Start the Assessment →'}
          </button>
          <p style={{ fontSize: '0.75rem', color: '#3a3630', marginTop: '16px' }}>
            By continuing, you agree to receive occasional emails from Bellomo Leadership. Unsubscribe anytime.
          </p>
        </div>
      </div>
    </div>
  );
}
 
// ── ASSESSMENT ─────────────────────────────────────────────────────────────
function Assessment({ q, qIdx, total, progress, onAnswer, onBack, answers }) {
  const inEl   = QUESTIONS.filter(x => x.element === q.element);
  const elIdx  = inEl.indexOf(q) + 1;
  const cur    = answers[q.id];
 
  return (
    <div style={S.page}>
      {/* top progress bar */}
      <div style={{ position: 'fixed', top: 0, left: 0, right: 0, height: '3px', background: 'rgba(255,255,255,0.07)', zIndex: 99 }}>
        <div style={{ height: '100%', width: `${progress}%`, background: '#c9a052', transition: 'width 0.35s ease' }} />
      </div>
 
      <div style={{ ...S.center, paddingTop: '72px' }}>
        <div style={S.wrap}>
          {/* meta row */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '44px' }}>
            <div>
              <p style={{ ...S.eyebrow, fontSize: '0.7rem' }}>{q.element}</p>
              <p style={{ fontSize: '0.78rem', color: '#4a4640', marginTop: '4px' }}>
                {elIdx} of {inEl.length} in this section
              </p>
            </div>
            <p style={{ fontSize: '0.82rem', color: '#5a5650' }}>{qIdx + 1} / {total}</p>
          </div>
 
          {/* question card */}
          <div style={{ ...S.card, marginBottom: '36px', borderColor: 'rgba(201,160,82,0.12)' }}>
            <p style={{ fontSize: '1.15rem', lineHeight: 1.65, color: '#fff', fontWeight: 400 }}>{q.text}</p>
          </div>
 
          {/* scale */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '44px' }}>
            {SCALE.map((label, i) => {
              const val = i + 1;
              const sel = cur === val;
              return (
                <button key={val} onClick={() => onAnswer(val)} style={{
                  display: 'flex', alignItems: 'center', gap: '14px',
                  background:    sel ? 'rgba(201,160,82,0.12)' : 'rgba(255,255,255,0.025)',
                  border:        sel ? '1px solid #c9a052'     : '1px solid rgba(255,255,255,0.07)',
                  borderRadius: '6px', padding: '15px 18px', cursor: 'pointer',
                  color: sel ? '#c9a052' : '#b0aca4', textAlign: 'left', width: '100%', fontSize: '0.97rem',
                  transition: 'all 0.14s',
                }}>
                  <span style={{
                    width: '26px', height: '26px', borderRadius: '50%', flexShrink: 0,
                    background: sel ? '#c9a052' : 'transparent',
                    border: sel ? '2px solid #c9a052' : '2px solid rgba(255,255,255,0.18)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '0.72rem', color: sel ? '#0a1f3d' : '#6a6660', fontWeight: 700,
                  }}>{val}</span>
                  {label}
                </button>
              );
            })}
          </div>
 
          <button style={{ ...S.btnOutline, fontSize: '0.8rem' }} onClick={onBack}>← Back</button>
        </div>
      </div>
    </div>
  );
}
 
// ── SCORE BAR ──────────────────────────────────────────────────────────────
function Bar({ label, score }) {
  const c = scoreColor(score);
  return (
    <div style={{ marginBottom: '18px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '7px' }}>
        <span style={{ fontSize: '0.9rem', color: '#d8d4cc' }}>{label}</span>
        <span style={{ fontSize: '0.9rem', fontWeight: 700, color: c }}>{score}%</span>
      </div>
      <div style={{ height: '5px', background: 'rgba(255,255,255,0.07)', borderRadius: '3px', overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${score}%`, background: c, borderRadius: '3px', transition: 'width 1.1s ease' }} />
      </div>
    </div>
  );
}
 
// ── RESULTS ────────────────────────────────────────────────────────────────
function Results({ name, org, role, email, elScores, total, risk, onRetake }) {
  const c = scoreColor(total);
 
  // Link into the Lie Economy Calculator with all five element scores pre-loaded
  const calcUrl =
    `/calculator.html?iw=${elScores['Important Work']}&cu=${elScores['Curiosity']}` +
    `&ch=${elScores['Challenge']}&tr=${elScores['Trust']}&co=${elScores['Community']}`;
 
  // Push scores to Mailchimp once, so follow-up emails can reference them
  useEffect(() => {
    if (!email) return;
    fetch('/api/score', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email, total,
        iw: elScores['Important Work'], cu: elScores['Curiosity'],
        ch: elScores['Challenge'], tr: elScores['Trust'], co: elScores['Community'],
      }),
    }).catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return (
    <div style={{ ...S.page, background: '#071628' }}>
      <div style={S.wrapWide}>
 
        {/* header */}
        <div style={{ textAlign: 'center', marginBottom: '56px' }}>
          <p style={{ ...S.eyebrow, marginBottom: '16px' }}>Courage Economy Diagnostic</p>
          <h1 style={S.h1}>Your <span style={S.gold}>Profile</span></h1>
          <p style={{ fontSize: '0.88rem', color: '#5a5650', marginTop: '10px' }}>
            {name} · {org}{role ? ` · ${role}` : ''}
          </p>
          <div style={{ ...S.divider, margin: '20px auto 0' }} />
        </div>
 
        {/* overall score */}
        <div style={{ ...S.card, textAlign: 'center', marginBottom: '32px', borderColor: 'rgba(201,160,82,0.25)', background: 'rgba(255,255,255,0.045)' }}>
          <p style={{ ...S.eyebrow, marginBottom: '18px' }}>Overall Courage Economy Score</p>
          <div style={{ fontFamily: "'Playfair Display',serif", fontSize: '5.5rem', fontWeight: 700, color: c, lineHeight: 1, marginBottom: '6px' }}>
            {total}<span style={{ fontSize: '2rem' }}>%</span>
          </div>
          <p style={{ fontSize: '1rem', fontWeight: 700, color: c, marginBottom: '20px', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
            {scoreLabel(total)}
          </p>
          <p style={{ ...S.body, maxWidth: '540px', margin: '0 auto' }}>{overallNarrative(total)}</p>
        </div>
 
        {/* lie economy risk */}
        <div style={{ ...S.card, marginBottom: '32px', display: 'flex', alignItems: 'center', gap: '24px', background: risk.bg, borderColor: risk.color + '44' }}>
          <div style={{ flexShrink: 0, minWidth: '110px' }}>
            <p style={{ ...S.eyebrow, fontSize: '0.68rem', marginBottom: '8px' }}>Lie Economy Risk</p>
            <div style={{ fontFamily: "'Playfair Display',serif", fontSize: '2rem', fontWeight: 700, color: risk.color }}>{risk.level}</div>
          </div>
          <div style={{ flex: 1, borderLeft: '1px solid rgba(255,255,255,0.08)', paddingLeft: '24px' }}>
            <p style={{ ...S.body, fontSize: '0.93rem' }}>
              {risk.level === 'High'     && "Significant gaps in Challenge and Trust indicate a Lie Economy operating at scale. Truth-telling is expensive here. The system is protecting something — and it is likely hurting performance."}
              {risk.level === 'Moderate' && "A moderate risk profile. Some truth-telling is happening, but not consistently across levels. The Lie Economy is active in pockets — typically where the stakes are highest."}
              {risk.level === 'Low'      && "A low Lie Economy risk profile. Honesty is not prohibitively expensive here. Leaders are building on a foundation that most organizations lack."}
            </p>
          </div>
        </div>
 
        {/* five elements bars */}
        <div style={{ ...S.card, marginBottom: '40px' }}>
          <p style={{ ...S.eyebrow, marginBottom: '24px' }}>The Five Elements</p>
          {ELEMENTS.map(el => <Bar key={el} label={el} score={elScores[el]} />)}
        </div>
 
        {/* element narratives */}
        <h2 style={{ ...S.h2, marginBottom: '24px' }}>Element Analysis</h2>
        <div style={{ marginBottom: '56px' }}>
          {ELEMENTS.map(el => {
            const s = elScores[el];
            const c = scoreColor(s);
            return (
              <div key={el} style={{ ...S.card, marginBottom: '14px', borderLeft: `3px solid ${c}`, borderRadius: '0 8px 8px 0' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                  <span style={{ fontWeight: 600, color: '#fff', fontSize: '0.97rem' }}>{el}</span>
                  <span style={{ fontSize: '0.8rem', fontWeight: 700, color: c, background: c + '22', padding: '3px 12px', borderRadius: '20px' }}>
                    {s}% — {scoreLabel(s)}
                  </span>
                </div>
                <p style={{ ...S.body, fontSize: '0.93rem' }}>{elNarrative(el, s)}</p>
              </div>
            );
          })}
        </div>
 
        {/* LIE ECONOMY CALCULATOR */}
        <div style={{ ...S.card, textAlign: 'center', marginBottom: '32px', borderColor: 'rgba(192,57,43,0.35)', background: 'rgba(192,57,43,0.07)' }}>
          <p style={{ ...S.eyebrow, marginBottom: '14px', color: '#e07a6e' }}>The Lie Economy Calculator</p>
          <h2 style={{ ...S.h2, marginBottom: '12px' }}>What is this profile costing you?</h2>
          <p style={{ ...S.body, maxWidth: '480px', margin: '0 auto 26px' }}>
            Comfortable lies don't come with an invoice. Take your five element scores into the
            calculator and see the annual cost — in dollars — of the gaps you just measured.
            Every assumption is adjustable. Argue with it.
          </p>
          <a href={calcUrl}
            style={{ ...S.btnGold, display: 'inline-block', textDecoration: 'none' }}>
            Calculate Your Lie Economy →
          </a>
          <p style={{ fontSize: '0.75rem', color: '#5a5650', marginTop: '14px' }}>
            Your scores carry over automatically. Directional, not actuarial — and fully transparent about which is which.
          </p>
        </div>
 
        {/* CTA */}
        <div style={{ ...S.card, textAlign: 'center', background: 'linear-gradient(135deg,rgba(201,160,82,0.1),rgba(10,31,61,0.6))', borderColor: 'rgba(201,160,82,0.25)', marginBottom: '40px' }}>
          <p style={{ ...S.eyebrow, marginBottom: '16px' }}>What comes next</p>
          <h2 style={{ ...S.h2, marginBottom: '14px' }}>Understanding the gaps is just the beginning.</h2>
          <div style={{ ...S.divider, margin: '14px auto 20px' }} />
          <p style={{ ...S.body, maxWidth: '480px', margin: '0 auto 32px' }}>
            The Courage Economy is built one decision at a time. If this profile surfaced something worth addressing, let's talk about what closing those gaps actually looks like.
          </p>
          <a href="https://bellomoleadership.com" target="_blank" rel="noopener noreferrer"
            style={{ ...S.btnGold, display: 'inline-block', textDecoration: 'none', marginBottom: '12px' }}>
            Connect with Thane Bellomo →
          </a>
          <p style={{ fontSize: '0.78rem', color: '#3a3630', marginTop: '16px' }}>
            Bellomo Leadership · Executive Coaching & Organizational Development
          </p>
        </div>
 
        {/* utility buttons */}
        <div style={{ display: 'flex', gap: '14px', justifyContent: 'center' }} className="no-print">
          <button style={S.btnOutline} onClick={() => window.print()}>Print / Save PDF</button>
          <button style={S.btnOutline} onClick={onRetake}>Retake</button>
        </div>
 
      </div>
    </div>
  );
}
 
// ── APP ────────────────────────────────────────────────────────────────────
export default function App() {
  const [screen,   setScreen]   = useState('intro');
  const [name,     setName]     = useState('');
  const [org,      setOrg]      = useState('');
  const [role,     setRole]     = useState('');
  const [email,    setEmail]    = useState('');
  const [answers,  setAnswers]  = useState({});
  const [qIdx,     setQIdx]     = useState(0);
 
  const progress = (Object.keys(answers).length / QUESTIONS.length) * 100;
  const q        = QUESTIONS[qIdx];
 
  function handleAnswer(val) {
    const next = { ...answers, [q.id]: val };
    setAnswers(next);
    if (qIdx < QUESTIONS.length - 1) {
      setTimeout(() => setQIdx(qIdx + 1), 120);
    } else {
      setScreen('results');
    }
  }
 
  function reset() { setAnswers({}); setQIdx(0); setScreen('intro'); }
 
  const elScores = Object.fromEntries(ELEMENTS.map(el => [el, elementScore(answers, el)]));
  const total    = overallScore(answers);
  const risk     = lieRisk(answers);
 
  return (
    <>
      <Head>
        <title>Courage Economy Diagnostic | Bellomo Leadership</title>
        <meta name="description" content="Assess your organization's Courage Economy — where you are, where the gaps are, and what it will cost to close them." />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Playfair+Display:wght@700&display=swap" rel="stylesheet" />
        <meta name="viewport" content="width=device-width,initial-scale=1" />
      </Head>
 
      {screen === 'intro'      && <Intro onStart={() => setScreen('info')} />}
      {screen === 'info'       && <Info name={name} org={org} role={role} email={email} setName={setName} setOrg={setOrg} setRole={setRole} setEmail={setEmail} onStart={() => setScreen('assessment')} />}
      {screen === 'assessment' && <Assessment q={q} qIdx={qIdx} total={QUESTIONS.length} progress={progress} onAnswer={handleAnswer} onBack={() => qIdx > 0 ? setQIdx(qIdx - 1) : setScreen('info')} answers={answers} />}
      {screen === 'results'    && <Results name={name} org={org} role={role} email={email} elScores={elScores} total={total} risk={risk} onRetake={reset} />}
    </>
  );
}
 
