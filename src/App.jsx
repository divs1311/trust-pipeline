import { useState, useMemo, useCallback } from "react";

// ─── SEED DATA ───────────────────────────────────────────────────────────────

const INITIAL_LEADS = [
  { id:1, company:"HDFC ERGO General Insurance", contact:"Rohan Mehta", role:"VP - Digital Transformation", email:"r.mehta@hdfcergo.com", tier:1, segment:"General Insurer", pain:"KYC compliance + IRDAI BIMA SUGAM", status:"Demo Scheduled", score:82, lastTouch:"2026-06-02", revenue:"₹14,200 Cr", trigger:"IRDAI data localisation mandate Q2 2026", outreach:"Email + LinkedIn", notes:"Interested in claims fraud detection API" },
  { id:2, company:"Turtlemint", contact:"Priya Sharma", role:"Chief Digital Officer", email:"priya.s@turtlemint.com", tier:1, segment:"InsurTech Distributor", pain:"Agent KYC at onboarding", status:"Replied", score:74, lastTouch:"2026-06-04", revenue:"Series C, ~$50M raised", trigger:"Scaling agent network 3x in FY27", outreach:"LinkedIn DM", notes:"Requested ROI model" },
  { id:3, company:"Bajaj Allianz Life", contact:"Amit Kulkarni", role:"Head of Compliance & Risk", email:"amit.k@bajajallianz.com", tier:1, segment:"Life Insurer", pain:"Agent onboarding fraud + policy KYC", status:"Proposal Sent", score:91, lastTouch:"2026-05-28", revenue:"₹8,900 Cr GWP", trigger:"₹12Cr IRDAI penalty for KYC lapse FY25", outreach:"Email", notes:"Strong urgency - penalty context resonates" },
  { id:4, company:"Coverfox Insurance", contact:"Neha Joshi", role:"Head of Distribution Tech", email:"neha@coverfox.com", tier:2, segment:"InsurTech Distributor", pain:"Document verification at quote stage", status:"Contacted", score:58, lastTouch:"2026-06-05", revenue:"Series B funded", trigger:"New regulatory requirement on policy issuance", outreach:"Email", notes:"No reply yet - follow up in 3 days" },
  { id:5, company:"Star Health Insurance", contact:"Suresh Iyer", role:"VP - Underwriting", email:"s.iyer@starhealth.in", tier:1, segment:"Standalone Health", pain:"Pre-policy KYC + claims fraud", status:"Demo Scheduled", score:78, lastTouch:"2026-05-30", revenue:"₹11,800 Cr GWP", trigger:"Expanding to tier-2 cities - new agent onboarding", outreach:"Email + LinkedIn", notes:"Demo booked for June 12" },
  { id:6, company:"Ditto Insurance", contact:"Ananya Rao", role:"Co-founder & CTO", email:"ananya@joinditto.in", tier:2, segment:"InsurTech Distributor", pain:"KYC friction in digital onboarding flow", status:"Replied", score:65, lastTouch:"2026-06-01", revenue:"Seed/Series A stage", trigger:"Trying to reduce onboarding drop-off by 40%", outreach:"LinkedIn DM", notes:"Very interested; budget decision in Q3" },
  { id:7, company:"Niva Bupa Health Insurance", contact:"Vikram Bose", role:"Chief Digital Officer", email:"v.bose@nivabupa.com", tier:1, segment:"Standalone Health", pain:"Real-time KYC for cashless claims", status:"Contacted", score:69, lastTouch:"2026-06-06", revenue:"₹5,400 Cr GWP", trigger:"Partnership with Manipal Hospitals - scaling fast", outreach:"Email", notes:"First touch sent today" },
  { id:8, company:"PhonePe Insurance", contact:"Karan Malhotra", role:"Head of Insurance Products", email:"karan.m@phonepe.com", tier:1, segment:"InsurTech Distributor", pain:"Policy issuance KYC at scale", status:"Negotiation", score:88, lastTouch:"2026-05-25", revenue:"PhonePe subsidiary - massive scale", trigger:"Launching embedded insurance for 500M users", outreach:"Warm intro via founder", notes:"Commercial discussion ongoing - close likely" },
  { id:9, company:"Future Generali India", contact:"Deepa Nair", role:"VP Compliance", email:"d.nair@futuregenerali.in", tier:2, segment:"General Insurer", pain:"Document fraud in commercial lines", status:"Contacted", score:51, lastTouch:"2026-06-03", revenue:"₹2,100 Cr GWP", trigger:"New commercial KYC regulation", outreach:"Email", notes:"Mid-size insurer; good for quick win" },
  { id:10, company:"Acko General Insurance", contact:"Rishi Patel", role:"Head of Engineering", email:"rishi@acko.com", tier:1, segment:"General Insurer", pain:"Real-time fraud scoring at FNOL", status:"Demo Scheduled", score:80, lastTouch:"2026-05-29", revenue:"Series E, fully digital insurer", trigger:"Expanding motor + health product lines", outreach:"LinkedIn + Email", notes:"Technical buyer - loves API-first pitch" },
  { id:11, company:"Manipal Cigna Health", contact:"Sandhya Krishnan", role:"Digital Transformation Lead", email:"s.krishnan@manipalcigna.com", tier:2, segment:"Standalone Health", pain:"Group policy member KYC", status:"Replied", score:62, lastTouch:"2026-06-01", revenue:"₹1,800 Cr GWP", trigger:"IRDAI group health mandate updates", outreach:"Email", notes:"Stakeholder mapping in progress" },
  { id:12, company:"ICICI Lombard", contact:"Pradeep Shah", role:"VP - Digital Products", email:"pradeep.s@icicilombard.com", tier:1, segment:"General Insurer", pain:"Motor + health KYC at scale", status:"Proposal Sent", score:85, lastTouch:"2026-05-26", revenue:"₹22,000 Cr GWP", trigger:"Digital-first roadmap FY27", outreach:"Warm intro", notes:"Large deal - long sales cycle expected" },
];

const CAMPAIGNS = [
  { id:1, name:"BIMA SUGAM Compliance Wave", segment:"Tier-1 Insurers", status:"Active", sent:142, opened:67, replied:18, demos:6, channel:"Email", startDate:"2026-05-15", template:"compliance_pain" },
  { id:2, name:"InsurTech Distributor Blitz", segment:"InsurTech Distributors", status:"Active", sent:89, opened:38, replied:11, demos:3, channel:"LinkedIn + Email", startDate:"2026-05-22", template:"onboarding_friction" },
  { id:3, name:"Claims Fraud ROI Campaign", segment:"General Insurers", status:"Paused", sent:56, opened:19, replied:4, demos:1, channel:"Email", startDate:"2026-06-01", template:"roi_model" },
  { id:4, name:"Health Insurer KYC Mandate", segment:"Standalone Health", status:"Draft", sent:0, opened:0, replied:0, demos:0, channel:"Email", startDate:"2026-06-10", template:"regulatory_trigger" },
];

const PIPELINE_STAGES = ["Contacted","Replied","Demo Scheduled","Proposal Sent","Negotiation","Closed Won"];
const STAGE_COLORS = { "Contacted":"#6B7280","Replied":"#2563EB","Demo Scheduled":"#7C3AED","Proposal Sent":"#D97706","Negotiation":"#DC2626","Closed Won":"#059669" };
const TIER_COLORS = { 1:"#1D4ED8", 2:"#7C3AED", 3:"#6B7280" };

const EMAIL_TEMPLATES = {
  compliance_pain: `Subject: AxiTrust × {company} — IRDAI BIMA SUGAM compliance, solved in 2 weeks

Hi {name},

Saw {company}'s recent expansion into {trigger_context}. Given IRDAI's Q2 2026 mandate on real-time KYC for policy issuance, I wanted to reach out specifically.

AxiTrust's verification API integrates in under 2 weeks (REST + webhooks), and we've helped similar insurers reduce KYC-related policy issuance delays by 60% and fraud leakage by ₹X Cr annually.

Worth a 20-minute call this week to walk through how we've solved this for peers in your segment?

Best,
Divyanshu | AxiTrust GTM`,

  onboarding_friction: `Subject: Cutting agent/customer onboarding drop-off — AxiTrust for {company}

Hi {name},

{company}'s digital distribution model caught my attention — specifically the challenge of KYC friction at the point of policy issuance.

We've built a verification layer that plugs into existing onboarding flows in days, not months. One of our InsurTech distributor clients reduced drop-off at KYC by 43% in the first 60 days.

Happy to share the integration doc and a quick ROI model tailored to {company}'s monthly policy volume.

15 minutes this week?

Divyanshu | AxiTrust`,

  roi_model: `Subject: {company} fraud leakage — what does fixing it actually cost?

Hi {name},

Quick context: AxiTrust does real-time document authentication and fraud scoring at FNOL for general insurers. I built a simple model showing what fraud leakage costs at {company}'s GWP scale — and what AxiTrust's API costs in comparison.

Spoiler: the math is usually ≥8x ROI in year one.

Can I send you the model? Happy to walk through it on a call if useful.

Divyanshu | AxiTrust GTM`,

  regulatory_trigger: `Subject: IRDAI group KYC mandate — {company}'s readiness?

Hi {name},

With the new IRDAI group health KYC requirement coming into effect, we're seeing a lot of health insurers scrambling for a compliant verification layer that doesn't break existing UX.

AxiTrust solves exactly this — real-time KYC, IRDAI-compliant, API-first, 2-week integration.

Would love to share how we've set this up for two standalone health insurers in the last quarter.

Best,
Divyanshu | AxiTrust`,
};

// ─── ICONS (inline SVG to avoid external deps) ─────────────────────────────

const Icon = ({ name, size=16, color="currentColor" }) => {
  const paths = {
    users: <><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></>,
    zap: <><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></>,
    target: <><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></>,
    mail: <><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></>,
    trending: <><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></>,
    bar: <><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></>,
    plus: <><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></>,
    edit: <><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></>,
    trash: <><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></>,
    copy: <><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></>,
    check: <><polyline points="20 6 9 16 4 11"/></>,
    spark: <><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></>,
    send: <><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></>,
    filter: <><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></>,
    x: <><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></>,
    refresh: <><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></>,
    phone: <><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.15 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.09 1h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.09 8a16 16 0 0 0 6.91 6.91l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></>,
  };
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      {paths[name]}
    </svg>
  );
};

// ─── SCORE BADGE ────────────────────────────────────────────────────────────

const ScoreBadge = ({ score }) => {
  const color = score >= 80 ? "#059669" : score >= 65 ? "#D97706" : "#6B7280";
  return (
    <span style={{ display:"inline-flex", alignItems:"center", gap:4, background: score >= 80 ? "#ECFDF5" : score >= 65 ? "#FFFBEB" : "#F9FAFB", color, border:`1px solid ${color}30`, borderRadius:6, padding:"2px 8px", fontSize:12, fontWeight:600, fontFamily:"'JetBrains Mono', monospace" }}>
      {score}
    </span>
  );
};

// ─── STATUS BADGE ───────────────────────────────────────────────────────────

const StatusBadge = ({ status }) => {
  const color = STAGE_COLORS[status] || "#6B7280";
  return (
    <span style={{ display:"inline-block", background:`${color}18`, color, border:`1px solid ${color}40`, borderRadius:5, padding:"2px 8px", fontSize:11, fontWeight:600, letterSpacing:"0.02em", whiteSpace:"nowrap" }}>
      {status}
    </span>
  );
};

// ─── METRIC CARD ─────────────────────────────────────────────────────────────

const MetricCard = ({ label, value, sub, accent="#1D4ED8", icon }) => (
  <div style={{ background:"#FAFAF9", border:"1px solid #E5E3DC", borderRadius:10, padding:"16px 20px", display:"flex", flexDirection:"column", gap:4 }}>
    <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
      <span style={{ fontSize:11, color:"#71706B", fontWeight:500, letterSpacing:"0.06em", textTransform:"uppercase" }}>{label}</span>
      {icon && <span style={{ color: accent, opacity:0.7 }}><Icon name={icon} size={15} color={accent}/></span>}
    </div>
    <div style={{ fontSize:26, fontWeight:700, color:"#1C1C1A", fontFamily:"'JetBrains Mono', monospace", lineHeight:1.1 }}>{value}</div>
    {sub && <div style={{ fontSize:12, color:"#71706B" }}>{sub}</div>}
  </div>
);

// ─── PIPELINE FUNNEL ─────────────────────────────────────────────────────────

const PipelineFunnel = ({ leads }) => {
  const counts = PIPELINE_STAGES.map(s => ({ stage:s, count: leads.filter(l => l.status === s).length }));
  const max = Math.max(...counts.map(c => c.count), 1);
  return (
    <div style={{ display:"flex", flexDirection:"column", gap:6, marginTop:8 }}>
      {counts.map(({ stage, count }) => (
        <div key={stage} style={{ display:"flex", alignItems:"center", gap:10 }}>
          <span style={{ fontSize:11, color:"#71706B", width:120, textAlign:"right", flexShrink:0 }}>{stage}</span>
          <div style={{ flex:1, height:22, background:"#F3F2EF", borderRadius:4, overflow:"hidden" }}>
            <div style={{ height:"100%", width:`${(count/max)*100}%`, background: STAGE_COLORS[stage], borderRadius:4, display:"flex", alignItems:"center", paddingLeft:8, transition:"width 0.6s ease", minWidth: count > 0 ? 24 : 0 }}>
              {count > 0 && <span style={{ color:"#fff", fontSize:11, fontWeight:700 }}>{count}</span>}
            </div>
          </div>
          {count === 0 && <span style={{ fontSize:11, color:"#C4C3BC" }}>0</span>}
        </div>
      ))}
    </div>
  );
};

// ─── CAMPAIGN CARD ───────────────────────────────────────────────────────────

const CampaignCard = ({ c }) => {
  const openRate = c.sent > 0 ? ((c.opened/c.sent)*100).toFixed(0) : 0;
  const replyRate = c.sent > 0 ? ((c.replied/c.sent)*100).toFixed(0) : 0;
  const statusColor = c.status === "Active" ? "#059669" : c.status === "Paused" ? "#D97706" : "#6B7280";
  return (
    <div style={{ border:"1px solid #E5E3DC", borderRadius:10, padding:"16px 20px", background:"#fff", display:"flex", flexDirection:"column", gap:10 }}>
      <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between" }}>
        <div>
          <div style={{ fontWeight:700, fontSize:14, color:"#1C1C1A", marginBottom:2 }}>{c.name}</div>
          <div style={{ fontSize:12, color:"#71706B" }}>{c.segment} · {c.channel}</div>
        </div>
        <span style={{ fontSize:11, fontWeight:700, color: statusColor, background:`${statusColor}15`, padding:"3px 10px", borderRadius:20, border:`1px solid ${statusColor}30`, flexShrink:0 }}>{c.status}</span>
      </div>
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr 1fr", gap:8 }}>
        {[["Sent", c.sent, "#6B7280"], ["Opened", `${openRate}%`, "#2563EB"], ["Replied", `${replyRate}%`, "#7C3AED"], ["Demos", c.demos, "#059669"]].map(([l, v, col]) => (
          <div key={l} style={{ textAlign:"center", background:"#FAFAF9", borderRadius:6, padding:"8px 4px", border:"1px solid #F0EFEA" }}>
            <div style={{ fontSize:18, fontWeight:700, color: col, fontFamily:"'JetBrains Mono', monospace" }}>{v}</div>
            <div style={{ fontSize:10, color:"#9CA3AF", textTransform:"uppercase", letterSpacing:"0.05em" }}>{l}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

// ─── AI EMAIL GENERATOR ──────────────────────────────────────────────────────

const EmailGenerator = ({ leads }) => {
  const [selectedLead, setSelectedLead] = useState(leads[0]);
  const [template, setTemplate] = useState("compliance_pain");
  const [generatedEmail, setGeneratedEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const generateEmail = useCallback(async () => {
    setLoading(true);
    setGeneratedEmail("");
    const lead = selectedLead;
    const tpl = EMAIL_TEMPLATES[template];
    const filled = tpl
      .replace(/{name}/g, lead.contact.split(" ")[0])
      .replace(/{company}/g, lead.company)
      .replace(/{trigger_context}/g, lead.trigger)
      .replace(/{role}/g, lead.role);

    const prompt = `You are AxiTrust's B2B GTM specialist. AxiTrust sells AI-powered KYC verification, document authentication, and fraud scoring APIs to insurance companies in India.

Write a highly personalized, concise outreach email to:
- Name: ${lead.contact}
- Role: ${lead.role}
- Company: ${lead.company} (${lead.segment}, ${lead.revenue})
- Pain point: ${lead.pain}
- Trigger: ${lead.trigger}

Use this draft as base but make it sharper, more specific, and more compelling. Keep it under 120 words. No fluff. Lead with their specific pain. End with a clear CTA.

Draft:
${filled}

Return ONLY the email text (subject line + body). No commentary.`;

    try {
      const resp = await fetch("https://api.anthropic.com/v1/messages", {
        method:"POST",
        headers:{ "Content-Type":"application/json" },
        body: JSON.stringify({ model:"claude-sonnet-4-20250514", max_tokens:1000, messages:[{ role:"user", content: prompt }] })
      });
      const data = await resp.json();
      const text = data.content?.map(b => b.text || "").join("") || "Error generating email.";
      setGeneratedEmail(text);
    } catch {
      setGeneratedEmail("API error. Check connection.");
    }
    setLoading(false);
  }, [selectedLead, template]);

  const copyEmail = () => {
    navigator.clipboard.writeText(generatedEmail);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16 }}>
      <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
        <label style={{ fontSize:12, color:"#71706B", fontWeight:600, textTransform:"uppercase", letterSpacing:"0.06em" }}>Select Lead</label>
        <select value={selectedLead.id} onChange={e => setSelectedLead(leads.find(l => l.id === parseInt(e.target.value)))}
          style={{ border:"1px solid #E5E3DC", borderRadius:8, padding:"8px 12px", fontSize:13, background:"#fff", color:"#1C1C1A", cursor:"pointer" }}>
          {leads.map(l => <option key={l.id} value={l.id}>{l.company} — {l.contact}</option>)}
        </select>

        <label style={{ fontSize:12, color:"#71706B", fontWeight:600, textTransform:"uppercase", letterSpacing:"0.06em" }}>Outreach Template</label>
        <select value={template} onChange={e => setTemplate(e.target.value)}
          style={{ border:"1px solid #E5E3DC", borderRadius:8, padding:"8px 12px", fontSize:13, background:"#fff", color:"#1C1C1A", cursor:"pointer" }}>
          <option value="compliance_pain">IRDAI Compliance Pain</option>
          <option value="onboarding_friction">Onboarding Friction</option>
          <option value="roi_model">Claims Fraud ROI Model</option>
          <option value="regulatory_trigger">Regulatory Trigger</option>
        </select>

        {selectedLead && (
          <div style={{ background:"#F8F7F4", border:"1px solid #E5E3DC", borderRadius:8, padding:14, display:"flex", flexDirection:"column", gap:6 }}>
            <div style={{ fontSize:12, fontWeight:700, color:"#1C1C1A" }}>{selectedLead.company}</div>
            <div style={{ fontSize:11, color:"#71706B" }}>👤 {selectedLead.contact} · {selectedLead.role}</div>
            <div style={{ fontSize:11, color:"#71706B" }}>💰 {selectedLead.revenue}</div>
            <div style={{ fontSize:11, color:"#D97706" }}>⚡ {selectedLead.trigger}</div>
            <div style={{ fontSize:11, color:"#6B7280" }}>🎯 Pain: {selectedLead.pain}</div>
          </div>
        )}

        <button onClick={generateEmail} disabled={loading}
          style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:8, background: loading ? "#E5E3DC" : "#1C1C1A", color:"#fff", border:"none", borderRadius:8, padding:"11px 16px", fontSize:14, fontWeight:600, cursor: loading ? "not-allowed" : "pointer", transition:"all 0.2s" }}>
          <Icon name="spark" size={15} color="#fff"/>
          {loading ? "Generating with Claude..." : "Generate AI Email"}
        </button>
      </div>

      <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
          <label style={{ fontSize:12, color:"#71706B", fontWeight:600, textTransform:"uppercase", letterSpacing:"0.06em" }}>Generated Email</label>
          {generatedEmail && (
            <button onClick={copyEmail} style={{ display:"flex", alignItems:"center", gap:5, background:"transparent", border:"1px solid #E5E3DC", borderRadius:6, padding:"4px 10px", fontSize:11, color: copied ? "#059669" : "#71706B", cursor:"pointer" }}>
              <Icon name={copied ? "check" : "copy"} size={12} color={copied ? "#059669" : "#71706B"}/> {copied ? "Copied!" : "Copy"}
            </button>
          )}
        </div>
        <div style={{ flex:1, border:"1px solid #E5E3DC", borderRadius:8, padding:14, minHeight:320, background: loading ? "#FAFAF9" : "#fff", fontSize:12, lineHeight:1.7, color:"#1C1C1A", whiteSpace:"pre-wrap", fontFamily:"'JetBrains Mono', monospace", overflowY:"auto" }}>
          {loading && <span style={{ color:"#71706B", fontStyle:"italic" }}>Claude is writing your email...</span>}
          {!loading && !generatedEmail && <span style={{ color:"#C4C3BC" }}>Select a lead and template, then click Generate.</span>}
          {!loading && generatedEmail && generatedEmail}
        </div>
      </div>
    </div>
  );
};

// ─── LEAD TABLE ──────────────────────────────────────────────────────────────

const LeadTable = ({ leads, onEdit }) => {
  const [filter, setFilter] = useState("All");
  const [sortBy, setSortBy] = useState("score");
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    let l = [...leads];
    if (filter !== "All") l = l.filter(x => x.status === filter || (filter === "Tier 1" && x.tier === 1) || (filter === "Tier 2" && x.tier === 2));
    if (search) l = l.filter(x => x.company.toLowerCase().includes(search.toLowerCase()) || x.contact.toLowerCase().includes(search.toLowerCase()));
    l.sort((a, b) => sortBy === "score" ? b.score - a.score : a.company.localeCompare(b.company));
    return l;
  }, [leads, filter, sortBy, search]);

  return (
    <div>
      <div style={{ display:"flex", gap:8, marginBottom:14, flexWrap:"wrap", alignItems:"center" }}>
        <div style={{ position:"relative", flex:1, minWidth:180 }}>
          <input placeholder="Search company or contact..." value={search} onChange={e => setSearch(e.target.value)}
            style={{ width:"100%", border:"1px solid #E5E3DC", borderRadius:8, padding:"7px 12px 7px 32px", fontSize:13, background:"#fff", boxSizing:"border-box" }}/>
          <span style={{ position:"absolute", left:10, top:"50%", transform:"translateY(-50%)", opacity:0.4 }}><Icon name="filter" size={13}/></span>
        </div>
        <select value={sortBy} onChange={e => setSortBy(e.target.value)}
          style={{ border:"1px solid #E5E3DC", borderRadius:8, padding:"7px 12px", fontSize:12, background:"#fff", color:"#1C1C1A", cursor:"pointer" }}>
          <option value="score">Sort: Score</option>
          <option value="company">Sort: Company</option>
        </select>
        {["All","Tier 1","Tier 2","Demo Scheduled","Proposal Sent","Negotiation"].map(f => (
          <button key={f} onClick={() => setFilter(f)}
            style={{ border:`1px solid ${filter===f?"#1C1C1A":"#E5E3DC"}`, background: filter===f ? "#1C1C1A" : "#fff", color: filter===f ? "#fff" : "#71706B", borderRadius:6, padding:"5px 12px", fontSize:11, fontWeight:600, cursor:"pointer", whiteSpace:"nowrap" }}>
            {f}
          </button>
        ))}
      </div>
      <div style={{ overflowX:"auto" }}>
        <table style={{ width:"100%", borderCollapse:"collapse", fontSize:13 }}>
          <thead>
            <tr style={{ borderBottom:"2px solid #E5E3DC" }}>
              {["Company","Contact","Segment","Status","Score","Tier","Last Touch",""].map(h => (
                <th key={h} style={{ padding:"8px 10px", textAlign:"left", fontSize:11, color:"#9CA3AF", fontWeight:700, letterSpacing:"0.05em", textTransform:"uppercase", whiteSpace:"nowrap" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((l, i) => (
              <tr key={l.id} style={{ borderBottom:"1px solid #F0EFEA", background: i%2===0 ? "#fff" : "#FAFAF9", transition:"background 0.15s" }}
                onMouseEnter={e => e.currentTarget.style.background="#F3F2EF"}
                onMouseLeave={e => e.currentTarget.style.background= i%2===0 ? "#fff" : "#FAFAF9"}>
                <td style={{ padding:"10px 10px" }}>
                  <div style={{ fontWeight:600, color:"#1C1C1A", fontSize:13 }}>{l.company}</div>
                  <div style={{ fontSize:11, color:"#9CA3AF", marginTop:1 }}>{l.revenue}</div>
                </td>
                <td style={{ padding:"10px 10px" }}>
                  <div style={{ color:"#374151" }}>{l.contact}</div>
                  <div style={{ fontSize:11, color:"#9CA3AF" }}>{l.role}</div>
                </td>
                <td style={{ padding:"10px 10px", fontSize:12, color:"#71706B" }}>{l.segment}</td>
                <td style={{ padding:"10px 10px" }}><StatusBadge status={l.status}/></td>
                <td style={{ padding:"10px 10px" }}><ScoreBadge score={l.score}/></td>
                <td style={{ padding:"10px 10px" }}>
                  <span style={{ display:"inline-block", background: TIER_COLORS[l.tier]+"18", color: TIER_COLORS[l.tier], border:`1px solid ${TIER_COLORS[l.tier]}40`, borderRadius:5, padding:"2px 8px", fontSize:11, fontWeight:700 }}>T{l.tier}</span>
                </td>
                <td style={{ padding:"10px 10px", fontSize:12, color:"#71706B", fontFamily:"monospace" }}>{l.lastTouch}</td>
                <td style={{ padding:"10px 10px" }}>
                  <button onClick={() => onEdit(l)} style={{ background:"transparent", border:"1px solid #E5E3DC", borderRadius:6, padding:"4px 8px", cursor:"pointer", display:"flex", alignItems:"center", gap:4, fontSize:11, color:"#71706B" }}>
                    <Icon name="edit" size={11}/>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && <div style={{ textAlign:"center", padding:32, color:"#C4C3BC", fontSize:13 }}>No leads match this filter.</div>}
      </div>
      <div style={{ marginTop:10, fontSize:12, color:"#9CA3AF" }}>Showing {filtered.length} of {leads.length} leads</div>
    </div>
  );
};

// ─── LEAD DETAIL MODAL ───────────────────────────────────────────────────────

const LeadModal = ({ lead, onClose, onSave }) => {
  const [form, setForm] = useState({ ...lead });
  if (!lead) return null;
  return (
    <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.45)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:1000 }}>
      <div style={{ background:"#fff", borderRadius:14, padding:28, width:520, maxHeight:"80vh", overflowY:"auto", boxShadow:"0 20px 60px rgba(0,0,0,0.2)" }}>
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:20 }}>
          <div style={{ fontFamily:"'Playfair Display', serif", fontSize:18, fontWeight:700, color:"#1C1C1A" }}>{lead.company}</div>
          <button onClick={onClose} style={{ background:"transparent", border:"none", cursor:"pointer", color:"#9CA3AF" }}><Icon name="x" size={18}/></button>
        </div>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
          {[["company","Company"],["contact","Contact"],["role","Role"],["email","Email"],["revenue","Revenue"],["trigger","Trigger"],["pain","Pain Point"],["notes","Notes"],["outreach","Outreach Channel"]].map(([k, label]) => (
            <div key={k} style={{ gridColumn: ["pain","notes","trigger"].includes(k) ? "span 2" : "span 1" }}>
              <label style={{ fontSize:11, color:"#9CA3AF", fontWeight:700, textTransform:"uppercase", letterSpacing:"0.06em", display:"block", marginBottom:4 }}>{label}</label>
              <input value={form[k] || ""} onChange={e => setForm(f => ({...f, [k]:e.target.value}))}
                style={{ width:"100%", border:"1px solid #E5E3DC", borderRadius:6, padding:"6px 10px", fontSize:12, color:"#1C1C1A", boxSizing:"border-box" }}/>
            </div>
          ))}
          <div>
            <label style={{ fontSize:11, color:"#9CA3AF", fontWeight:700, textTransform:"uppercase", letterSpacing:"0.06em", display:"block", marginBottom:4 }}>Status</label>
            <select value={form.status} onChange={e => setForm(f => ({...f, status:e.target.value}))}
              style={{ width:"100%", border:"1px solid #E5E3DC", borderRadius:6, padding:"6px 10px", fontSize:12, background:"#fff", color:"#1C1C1A" }}>
              {PIPELINE_STAGES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div>
            <label style={{ fontSize:11, color:"#9CA3AF", fontWeight:700, textTransform:"uppercase", letterSpacing:"0.06em", display:"block", marginBottom:4 }}>Tier</label>
            <select value={form.tier} onChange={e => setForm(f => ({...f, tier:parseInt(e.target.value)}))}
              style={{ width:"100%", border:"1px solid #E5E3DC", borderRadius:6, padding:"6px 10px", fontSize:12, background:"#fff", color:"#1C1C1A" }}>
              <option value={1}>Tier 1 — Enterprise</option>
              <option value={2}>Tier 2 — Mid-market</option>
              <option value={3}>Tier 3 — SMB</option>
            </select>
          </div>
          <div>
            <label style={{ fontSize:11, color:"#9CA3AF", fontWeight:700, textTransform:"uppercase", letterSpacing:"0.06em", display:"block", marginBottom:4 }}>Score (0-100)</label>
            <input type="number" min={0} max={100} value={form.score} onChange={e => setForm(f => ({...f, score:parseInt(e.target.value)}))}
              style={{ width:"100%", border:"1px solid #E5E3DC", borderRadius:6, padding:"6px 10px", fontSize:12, color:"#1C1C1A" }}/>
          </div>
          <div>
            <label style={{ fontSize:11, color:"#9CA3AF", fontWeight:700, textTransform:"uppercase", letterSpacing:"0.06em", display:"block", marginBottom:4 }}>Last Touch</label>
            <input type="date" value={form.lastTouch} onChange={e => setForm(f => ({...f, lastTouch:e.target.value}))}
              style={{ width:"100%", border:"1px solid #E5E3DC", borderRadius:6, padding:"6px 10px", fontSize:12, color:"#1C1C1A" }}/>
          </div>
        </div>
        <div style={{ display:"flex", gap:8, marginTop:20, justifyContent:"flex-end" }}>
          <button onClick={onClose} style={{ background:"#F8F7F4", border:"1px solid #E5E3DC", borderRadius:8, padding:"8px 18px", fontSize:13, color:"#71706B", cursor:"pointer", fontWeight:600 }}>Cancel</button>
          <button onClick={() => { onSave(form); onClose(); }} style={{ background:"#1C1C1A", border:"none", borderRadius:8, padding:"8px 18px", fontSize:13, color:"#fff", cursor:"pointer", fontWeight:600 }}>Save Changes</button>
        </div>
      </div>
    </div>
  );
};

// ─── ICP SCORER ──────────────────────────────────────────────────────────────

const ICPScorer = () => {
  const [inputs, setInputs] = useState({ gwr:5000, digitalScore:3, regPressure:3, useCase:3, apiReady:true, existingPartners:false, recentPenalty:false });
  const [aiAnalysis, setAiAnalysis] = useState("");
  const [loading, setLoading] = useState(false);

  const score = useMemo(() => {
    let s = 0;
    s += Math.min(inputs.gwr / 1000 * 3, 25);
    s += inputs.digitalScore * 6;
    s += inputs.regPressure * 6;
    s += inputs.useCase * 5;
    if (inputs.apiReady) s += 10;
    if (inputs.existingPartners) s += 8;
    if (inputs.recentPenalty) s += 15;
    return Math.min(Math.round(s), 100);
  }, [inputs]);

  const tier = score >= 80 ? 1 : score >= 60 ? 2 : 3;
  const tierColor = TIER_COLORS[tier];

  const runAiAnalysis = async () => {
    setLoading(true);
    setAiAnalysis("");
    const prompt = `You are AxiTrust's B2B GTM strategist. Based on this prospect profile, give a 3-sentence strategic assessment for whether AxiTrust should prioritize this prospect and what the best outreach angle is:

- GWP/Revenue: ₹${inputs.gwr} Cr
- Digital maturity score: ${inputs.digitalScore}/5
- Regulatory pressure: ${inputs.regPressure}/5
- Use case fit: ${inputs.useCase}/5
- API-ready tech stack: ${inputs.apiReady}
- Has existing InsurTech partnerships: ${inputs.existingPartners}
- Recent IRDAI penalty: ${inputs.recentPenalty}
- Calculated ICP score: ${score}/100 (Tier ${tier})

Be direct. Name the outreach angle. Max 80 words.`;

    try {
      const resp = await fetch("https://api.anthropic.com/v1/messages", {
        method:"POST", headers:{"Content-Type":"application/json"},
        body: JSON.stringify({ model:"claude-sonnet-4-20250514", max_tokens:1000, messages:[{role:"user", content:prompt}] })
      });
      const data = await resp.json();
      setAiAnalysis(data.content?.map(b=>b.text||"").join("") || "Error.");
    } catch { setAiAnalysis("API error."); }
    setLoading(false);
  };

  const slider = (key, label, min, max) => (
    <div key={key}>
      <div style={{ display:"flex", justifyContent:"space-between", marginBottom:4 }}>
        <label style={{ fontSize:12, color:"#71706B", fontWeight:600 }}>{label}</label>
        <span style={{ fontSize:12, fontWeight:700, color:"#1C1C1A", fontFamily:"monospace" }}>{inputs[key]}{key==="gwr"?" Cr":"/5"}</span>
      </div>
      <input type="range" min={min} max={max} value={inputs[key]} onChange={e => setInputs(i => ({...i, [key]: Number(e.target.value)}))}
        style={{ width:"100%" }}/>
    </div>
  );

  return (
    <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:20 }}>
      <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
        <div style={{ fontSize:13, color:"#71706B", fontWeight:500, marginBottom:2 }}>Adjust parameters to score any prospect</div>
        {slider("gwr","Annual GWP / Revenue (₹ Cr)",100,30000)}
        {slider("digitalScore","Digital Maturity",1,5)}
        {slider("regPressure","Regulatory Pressure",1,5)}
        {slider("useCase","AxiTrust Use Case Fit",1,5)}
        <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
          {[["apiReady","API-ready tech stack"],["existingPartners","Has existing InsurTech partnerships"],["recentPenalty","Recent IRDAI penalty / compliance issue"]].map(([k, label]) => (
            <label key={k} style={{ display:"flex", alignItems:"center", gap:8, cursor:"pointer", fontSize:13, color:"#374151" }}>
              <input type="checkbox" checked={inputs[k]} onChange={e => setInputs(i => ({...i, [k]:e.target.checked}))} style={{ accentColor:"#1C1C1A", width:15, height:15 }}/>
              {label}
            </label>
          ))}
        </div>
      </div>
      <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
        <div style={{ background:"#FAFAF9", border:"2px solid #E5E3DC", borderRadius:12, padding:20, textAlign:"center" }}>
          <div style={{ fontSize:11, color:"#9CA3AF", textTransform:"uppercase", letterSpacing:"0.08em", marginBottom:8 }}>ICP Score</div>
          <div style={{ fontSize:56, fontWeight:800, color: score >= 80 ? "#059669" : score >= 60 ? "#D97706" : "#6B7280", fontFamily:"'JetBrains Mono', monospace", lineHeight:1 }}>{score}</div>
          <div style={{ fontSize:13, color:"#71706B", marginTop:6 }}>/ 100</div>
          <div style={{ marginTop:12, display:"inline-flex", alignItems:"center", gap:6, background:`${tierColor}15`, color:tierColor, border:`1px solid ${tierColor}40`, borderRadius:20, padding:"4px 14px", fontSize:12, fontWeight:700 }}>
            Tier {tier} — {tier===1?"Enterprise Priority":tier===2?"Mid-Market":"Low Priority"}
          </div>
        </div>
        <div style={{ background:"#F8F7F4", border:"1px solid #E5E3DC", borderRadius:8, padding:12, fontSize:11, color:"#71706B" }}>
          <div style={{ fontWeight:700, color:"#374151", marginBottom:6, fontSize:12 }}>Score breakdown</div>
          {[["Revenue signal", Math.min(Math.round(inputs.gwr/1000*3),25)],["Digital maturity", inputs.digitalScore*6],["Regulatory pressure", inputs.regPressure*6],["Use case fit", inputs.useCase*5],["API readiness", inputs.apiReady?10:0],["InsurTech partnerships", inputs.existingPartners?8:0],["Recent IRDAI penalty", inputs.recentPenalty?15:0]].map(([l,v])=>(
            <div key={l} style={{ display:"flex", justifyContent:"space-between", marginBottom:3 }}>
              <span>{l}</span><span style={{ fontFamily:"monospace", fontWeight:700, color:"#1C1C1A" }}>{v}</span>
            </div>
          ))}
        </div>
        <button onClick={runAiAnalysis} disabled={loading} style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:8, background: loading?"#E5E3DC":"#1C1C1A", color:"#fff", border:"none", borderRadius:8, padding:"10px 14px", fontSize:13, fontWeight:600, cursor: loading?"not-allowed":"pointer" }}>
          <Icon name="spark" size={14} color="#fff"/> {loading?"Analyzing...":"AI Strategic Assessment"}
        </button>
        {aiAnalysis && (
          <div style={{ background:"#EFF6FF", border:"1px solid #BFDBFE", borderRadius:8, padding:12, fontSize:12, color:"#1E40AF", lineHeight:1.7 }}>
            {aiAnalysis}
          </div>
        )}
      </div>
    </div>
  );
};

// ─── PLAYBOOK VIEW ──────────────────────────────────────────────────────────

const Playbook = () => {
  const sections = [
    { title:"Phase 1–2: ICP Definition & Lead Generation", weeks:"Weeks 1–4", color:"#1D4ED8", items:[
      "Run competitor teardowns of Signzy, IDfy, Bureau.id, Surepass, Perfios using Perplexity AI",
      "Build ICP matrix: Tier-1 (Enterprise BFSI, >₹500Cr), Tier-2 (Mid-market), Tier-3 (SMB/D2C)",
      "Use Clay + Apollo to scrape 500–700 enriched contacts across Tier-1 and Tier-2",
      "Tag each lead by trigger: IRDAI penalty, recent funding, digital transformation announcement",
      "Validate emails with Hunter.io + ZeroBounce; firmographic enrichment with Crunchbase",
      "Deliverable: ICP persona document (3 segments × 3 buyer personas = 9 profiles)",
    ]},
    { title:"Phase 3: AI-Assisted Multi-Channel Outreach", weeks:"Weeks 5–7", color:"#7C3AED", items:[
      "Build 4 outreach templates using Claude API (compliance pain, onboarding friction, ROI model, regulatory trigger)",
      "Deploy via Instantly.ai: A/B test 2 subject lines × 3 body variants per segment",
      "LinkedIn: PhantomBuster automation for connection requests → manual value-add DMs",
      "Attach KYC Failure Cost Calculator (Excel) as lead magnet in DM sequence",
      "Track open rate, reply rate, click-through by segment and template variant",
      "Target benchmarks: >35% open rate (Tier-1), >8% reply rate, >2% demo conversion",
    ]},
    { title:"Phase 4–5: CRM Pipeline + Integrations", weeks:"Weeks 5–10", color:"#059669", items:[
      "Configure HubSpot with 6-stage custom pipeline: Contacted → Replied → Demo → Proposal → Negotiation → Closed",
      "Set up automated lead scoring: reply = +10pts, demo booked = +30pts, clicked asset = +15pts",
      "Build live Google Sheets dashboard via Zapier: pipeline velocity, conversion by tier, avg deal cycle",
      "Integration 1: CRM ↔ Instantly.ai (bidirectional email sync)",
      "Integration 2: LinkedIn tracker ↔ CRM deal creation",
      "Integration 3: Calendly ↔ HubSpot (demo booking → auto deal creation)",
      "Integration 4: Slack bot for demo-booked notifications to CEO",
    ]},
    { title:"Phase 6: GTM Playbook Documentation", weeks:"Weeks 10–12", color:"#D97706", items:[
      "ICP personas + scoring matrix (Notion database with full methodology)",
      "Message framework library: 4 templates × 3 segments × 2 channels = 24 variants",
      "Outreach cadence maps: 3-touch email, LinkedIn parallel track, follow-up sequence",
      "CRM pipeline SOP with stage definitions, entry/exit criteria, and owner mapping",
      "AI tool stack guide: Clay, Perplexity, Claude API, Instantly, HubSpot, Zapier",
      "Campaign performance benchmarks by segment (12-week data)",
      "Deliverable: Version-controlled GTM Playbook in Notion + PDF export",
    ]},
  ];
  return (
    <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
      {sections.map(s => (
        <div key={s.title} style={{ border:`1px solid ${s.color}30`, borderLeft:`3px solid ${s.color}`, borderRadius:10, padding:"16px 20px", background:"#fff" }}>
          <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:10 }}>
            <div style={{ fontWeight:700, fontSize:14, color:"#1C1C1A" }}>{s.title}</div>
            <span style={{ fontSize:11, background:`${s.color}15`, color:s.color, border:`1px solid ${s.color}30`, borderRadius:5, padding:"3px 10px", fontWeight:600 }}>{s.weeks}</span>
          </div>
          <ul style={{ margin:0, paddingLeft:16, display:"flex", flexDirection:"column", gap:5 }}>
            {s.items.map((item, i) => (
              <li key={i} style={{ fontSize:12, color:"#374151", lineHeight:1.6 }}>{item}</li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
};

// ─── ANALYTICS DASHBOARD ─────────────────────────────────────────────────────

const Analytics = ({ leads, campaigns }) => {
  const totalLeads = leads.length;
  const avgScore = Math.round(leads.reduce((a,l) => a+l.score, 0) / leads.length);
  const demoCount = leads.filter(l => l.status === "Demo Scheduled").length;
  const hotLeads = leads.filter(l => l.score >= 80).length;
  const totalSent = campaigns.reduce((a,c) => a+c.sent, 0);
  const totalOpened = campaigns.reduce((a,c) => a+c.opened, 0);
  const totalReplied = campaigns.reduce((a,c) => a+c.replied, 0);
  const totalDemos = campaigns.reduce((a,c) => a+c.demos, 0);
  const avgOpen = totalSent > 0 ? ((totalOpened/totalSent)*100).toFixed(1) : 0;
  const avgReply = totalSent > 0 ? ((totalReplied/totalSent)*100).toFixed(1) : 0;

  const segCounts = {};
  leads.forEach(l => { segCounts[l.segment] = (segCounts[l.segment]||0)+1; });

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:20 }}>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(4, 1fr)", gap:12 }}>
        <MetricCard label="Total Leads" value={totalLeads} sub="in CRM" accent="#1D4ED8" icon="users"/>
        <MetricCard label="Avg ICP Score" value={avgScore} sub="across all leads" accent="#7C3AED" icon="target"/>
        <MetricCard label="Demos Booked" value={demoCount} sub="active pipeline" accent="#059669" icon="phone"/>
        <MetricCard label="Hot Leads ≥80" value={hotLeads} sub="priority outreach" accent="#D97706" icon="zap"/>
      </div>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(4, 1fr)", gap:12 }}>
        <MetricCard label="Emails Sent" value={totalSent} sub="across all campaigns" accent="#6B7280" icon="send"/>
        <MetricCard label="Open Rate" value={`${avgOpen}%`} sub={`target: >35%`} accent={parseFloat(avgOpen) >= 35 ? "#059669" : "#D97706"} icon="mail"/>
        <MetricCard label="Reply Rate" value={`${avgReply}%`} sub="target: >8%" accent={parseFloat(avgReply) >= 8 ? "#059669" : "#D97706"} icon="trending"/>
        <MetricCard label="Demo Conv." value={totalDemos} sub="from campaigns" accent="#1D4ED8" icon="bar"/>
      </div>
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16 }}>
        <div style={{ border:"1px solid #E5E3DC", borderRadius:10, padding:16, background:"#fff" }}>
          <div style={{ fontWeight:700, fontSize:14, color:"#1C1C1A", marginBottom:12 }}>Pipeline breakdown</div>
          <PipelineFunnel leads={leads}/>
        </div>
        <div style={{ border:"1px solid #E5E3DC", borderRadius:10, padding:16, background:"#fff" }}>
          <div style={{ fontWeight:700, fontSize:14, color:"#1C1C1A", marginBottom:12 }}>Leads by segment</div>
          {Object.entries(segCounts).map(([seg, count]) => (
            <div key={seg} style={{ display:"flex", alignItems:"center", gap:10, marginBottom:8 }}>
              <span style={{ fontSize:12, color:"#71706B", width:170, flexShrink:0 }}>{seg}</span>
              <div style={{ flex:1, height:20, background:"#F3F2EF", borderRadius:4 }}>
                <div style={{ height:"100%", width:`${(count/totalLeads)*100}%`, background:"#1D4ED8", borderRadius:4, display:"flex", alignItems:"center", paddingLeft:6 }}>
                  <span style={{ color:"#fff", fontSize:11, fontWeight:700 }}>{count}</span>
                </div>
              </div>
            </div>
          ))}
          <div style={{ marginTop:16, fontWeight:700, fontSize:14, color:"#1C1C1A", marginBottom:12 }}>Campaign performance</div>
          {campaigns.map(c => (
            <div key={c.id} style={{ display:"flex", alignItems:"center", gap:10, marginBottom:6 }}>
              <span style={{ fontSize:11, color:"#71706B", width:170, flexShrink:0 }}>{c.name.split(" ").slice(0,3).join(" ")}…</span>
              <div style={{ flex:1, height:16, background:"#F3F2EF", borderRadius:4 }}>
                <div style={{ height:"100%", width:`${c.sent>0?(c.opened/c.sent)*100:0}%`, background: c.status==="Active"?"#059669":"#9CA3AF", borderRadius:4 }}/>
              </div>
              <span style={{ fontSize:11, fontFamily:"monospace", color:"#374151", width:36, textAlign:"right" }}>{c.sent>0?((c.opened/c.sent)*100).toFixed(0):0}%</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// ─── MAIN APP ─────────────────────────────────────────────────────────────────

export default function TrustPipeline() {
  const [leads, setLeads] = useState(INITIAL_LEADS);
  const [activeTab, setActiveTab] = useState("analytics");
  const [editingLead, setEditingLead] = useState(null);

  const tabs = [
    { id:"analytics", label:"Analytics", icon:"bar" },
    { id:"leads", label:"Lead CRM", icon:"users" },
    { id:"campaigns", label:"Campaigns", icon:"send" },
    { id:"icp", label:"ICP Scorer", icon:"target" },
    { id:"email", label:"AI Outreach", icon:"spark" },
    { id:"playbook", label:"GTM Playbook", icon:"trending" },
  ];

  const saveLead = (updated) => {
    setLeads(ls => ls.map(l => l.id === updated.id ? updated : l));
  };

  return (
    <div style={{ fontFamily:"'DM Sans', 'Helvetica Neue', sans-serif", background:"#F8F7F4", minHeight:"100vh" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Playfair+Display:wght@700&family=JetBrains+Mono:wght@400;700&display=swap');
        * { box-sizing: border-box; }
        input[type=range] { -webkit-appearance: none; height: 4px; background: #E5E3DC; border-radius: 2px; outline: none; }
        input[type=range]::-webkit-slider-thumb { -webkit-appearance: none; width: 16px; height: 16px; border-radius: 50%; background: #1C1C1A; cursor: pointer; border: 2px solid #fff; box-shadow: 0 1px 4px rgba(0,0,0,0.2); }
        select { cursor: pointer; }
        button:hover { opacity: 0.88; }
      `}</style>

      {/* Header */}
      <div style={{ background:"#1C1C1A", padding:"16px 28px", display:"flex", alignItems:"center", justifyContent:"space-between", borderBottom:"1px solid #2D2D2B" }}>
        <div>
          <div style={{ fontFamily:"'Playfair Display', serif", fontSize:22, color:"#F8F7F4", fontWeight:700, letterSpacing:"-0.02em" }}>TrustPipeline</div>
          <div style={{ fontSize:11, color:"#71706B", letterSpacing:"0.08em", textTransform:"uppercase", marginTop:1 }}>AxiTrust · GTM Execution Engine · PS-II 2026</div>
        </div>
        <div style={{ display:"flex", gap:8, alignItems:"center" }}>
          <div style={{ background:"#059669", width:8, height:8, borderRadius:"50%", boxShadow:"0 0 0 3px #05966930" }}/>
          <span style={{ fontSize:12, color:"#A8A8A2" }}>Live CRM · {leads.length} leads tracked</span>
        </div>
      </div>

      {/* Nav tabs */}
      <div style={{ background:"#fff", borderBottom:"1px solid #E5E3DC", padding:"0 28px", display:"flex", gap:0, overflowX:"auto" }}>
        {tabs.map(t => (
          <button key={t.id} onClick={() => setActiveTab(t.id)}
            style={{ display:"flex", alignItems:"center", gap:7, padding:"14px 18px", background:"transparent", border:"none", borderBottom:`2px solid ${activeTab===t.id?"#1C1C1A":"transparent"}`, color: activeTab===t.id?"#1C1C1A":"#9CA3AF", fontWeight: activeTab===t.id?700:500, fontSize:13, cursor:"pointer", transition:"all 0.15s", whiteSpace:"nowrap", fontFamily:"'DM Sans', sans-serif" }}>
            <Icon name={t.icon} size={14} color={activeTab===t.id?"#1C1C1A":"#9CA3AF"}/> {t.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div style={{ padding:"24px 28px", maxWidth:1200, margin:"0 auto" }}>
        {activeTab === "analytics" && <Analytics leads={leads} campaigns={CAMPAIGNS}/>}
        {activeTab === "leads" && <LeadTable leads={leads} onEdit={setEditingLead}/>}
        {activeTab === "campaigns" && (
          <div>
            <div style={{ fontWeight:700, fontSize:16, color:"#1C1C1A", marginBottom:16 }}>Campaign tracker — {CAMPAIGNS.length} campaigns</div>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14 }}>
              {CAMPAIGNS.map(c => <CampaignCard key={c.id} c={c}/>)}
            </div>
          </div>
        )}
        {activeTab === "icp" && (
          <div>
            <div style={{ fontWeight:700, fontSize:16, color:"#1C1C1A", marginBottom:4 }}>ICP Scoring Engine</div>
            <div style={{ fontSize:13, color:"#71706B", marginBottom:16 }}>Score any insurance prospect against AxiTrust's partner attractiveness matrix</div>
            <ICPScorer/>
          </div>
        )}
        {activeTab === "email" && (
          <div>
            <div style={{ fontWeight:700, fontSize:16, color:"#1C1C1A", marginBottom:4 }}>AI Outreach Generator</div>
            <div style={{ fontSize:13, color:"#71706B", marginBottom:16 }}>Claude API writes hyper-personalized emails for each lead using trigger-based templates</div>
            <EmailGenerator leads={leads}/>
          </div>
        )}
        {activeTab === "playbook" && (
          <div>
            <div style={{ fontWeight:700, fontSize:16, color:"#1C1C1A", marginBottom:4 }}>GTM Playbook — 12-Week Execution Plan</div>
            <div style={{ fontSize:13, color:"#71706B", marginBottom:16 }}>Version-controlled, reusable playbook for AxiTrust's B2B insurance acquisition motion</div>
            <Playbook/>
          </div>
        )}
      </div>

      {editingLead && <LeadModal lead={editingLead} onClose={() => setEditingLead(null)} onSave={saveLead}/>}
    </div>
  );
}