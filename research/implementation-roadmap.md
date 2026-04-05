# Implementation Roadmap: Claude + RAG Solution

**Recommended Solution:** Custom-built AI with Claude API + RAG (Retrieval Augmented Generation)  
**Timeline:** 8 weeks to full deployment  
**Budget:** $15,800 Year 1; $450-650/month Year 2+  
**Owner:** VP Engineering (Perry or delegated dev lead)

---

## EXECUTIVE SUMMARY

Deploy an AI customer service system that:
- Autonomously handles 70-80% of Elixser Peptides & Health email inquiries
- Integrates directly with WooCommerce (order data) + GHL (contact/pipeline management)
- Maintains strict RUO compliance with automated guardrails + human review
- Scales cost-efficiently from 50 emails/day to 500+ emails/day
- Offloads repetitive work: order status, shipping, billing, basic product Q&A

---

## PHASE BREAKDOWN

### **PHASE 1: DISCOVERY & PLANNING (Weeks 1-2)**

**Objective:** Define scope, gather data, build requirements doc

**Week 1: Current State Audit**
- [ ] Export last 30 days of support emails (Elixser Peptides + Elixser Health)
- [ ] Categorize into buckets: order tracking (%), VIP billing (%), product Q&A (%), peptide research (%), other (%)
- [ ] Identify top 50 most common questions
- [ ] Map which questions should be automated vs. escalated to human
- [ ] Document current SLAs (response time, resolution time)
- [ ] Meet with support team: what struggles them most?

**Deliverable:** Support Analytics Sheet
```
Question Type | Volume/Month | Current Automation | Escalation Risk | AI Suitable? | Priority
Order status  | 250         | 0%                 | Low             | Yes          | P1
Shipping      | 150         | 0%                 | Low             | Yes          | P1
VIP billing   | 80          | 0%                 | Medium          | Yes          | P2
Product Q&A   | 200         | 0%                 | Low             | Yes          | P2
Peptide research| 40         | 0%                 | High            | Yes (with care) | P3
Returns       | 30          | 0%                 | Medium          | Yes          | P3
```

**Week 2: Technical Architecture**
- [ ] Design data flow: Email → Classifier → Claude API → WooCommerce/GHL API → Response
- [ ] Choose vector DB: Pinecone (easiest) vs. Chroma (self-hosted) vs. Weaviate
- [ ] Design escalation triggers (high-risk queries, missing order info, etc.)
- [ ] Plan integration endpoints:
  - WooCommerce: GET /orders, GET /customers, GET /products
  - GHL: POST /contacts, POST /notes, GET /pipelines
  - Email: Webhook from Gmail API or SMTP relay
- [ ] Design response quality metrics: accuracy, compliance, escalation rate, latency

**Deliverable:** Technical Specification Doc
- System architecture diagram
- API integration flowchart
- Data model for RAG knowledge base
- Escalation decision tree

**Budget for Phase 1:** $0 (internal team) + $2,000 for architecture consulting (optional)

---

### **PHASE 2: DATA PREPARATION & RAG TRAINING (Weeks 3-4)**

**Objective:** Build knowledge base that Claude will query

**Week 3: Knowledge Base Curation**
- [ ] Export all product data from WooCommerce:
  - Product names, descriptions, ingredients, dosing
  - RUO disclaimers (must be in every response)
  - Contraindications (if any)
  - Stock status for each SKU
  
- [ ] Create VIP Membership Knowledge Base:
  - VIP tiers and benefits
  - Billing cycle + renewal dates
  - Common billing questions + answers
  
- [ ] Create Order Policy Knowledge Base:
  - Shipping times by region
  - Return/refund policy
  - Tracking status meanings
  
- [ ] Create Peptide Research Knowledge Base:
  - What peptides do (facts)
  - Research vs. therapeutic distinction (RUO compliance)
  - Approved use cases
  - What NOT to claim
  - Regulatory landscape (2026 FDA stance)

**Document Structure (Markdown):**
```markdown
# Peptide Name: BPC-157

## Description
A synthetic peptide being studied for...

## Research Status
In vitro studies show... [cite sources]

## RUO Disclaimer
This product is sold for research use only. Not intended for human consumption.
Statements have not been evaluated by FDA.

## Common Questions
Q: Can I use this for X?
A: This product is for research use only. Please consult applicable regulations.

## Related Compounds
Sermorelin, CJC-1295, etc.
```

- [ ] Create FAQ Knowledge Base from last 30 days of email:
  - 50+ common Q&A pairs
  - Group by category
  - Include human-written answer (to show tone)

**Week 4: RAG Setup & Embeddings**
- [ ] Choose vector DB provider (recommend Pinecone for simplicity):
  - Set up account
  - Create index: `elixser-products`, `elixser-policies`, `elixser-peptides`, `elixser-faq`
  - Set embedding model: OpenAI text-embedding-3-small or Cohere
  
- [ ] Embed all documents into Pinecone:
  - ~500 product descriptions
  - ~100 policy/FAQ documents
  - ~50 peptide research resources
  - Total: ~650 documents
  
- [ ] Test retrieval quality:
  - Ask test queries ("What's the shipping time to California?")
  - Verify relevant docs are returned
  - Tune similarity threshold if needed

**Deliverable:** Pinecone vector database with embedded knowledge base

**Budget for Phase 2:** 
- Vector DB (Pinecone): $50/month (negotiate annual: $600)
- Embedding API calls: ~$20 (one-time)
- **Total Phase 2: $620**

---

### **PHASE 3: AI TRAINING & GUARDRAILS (Weeks 5-6)**

**Objective:** Build Claude prompts + compliance layer + escalation rules

**Week 5: Claude Prompt Engineering**
- [ ] Build system prompt (instruct Claude how to respond):

```
You are customer support for Elixser Peptides and Elixser Health.

CORE RULES:
1. You help with order tracking, shipping, VIP billing, and general product questions.
2. For peptide research questions, you provide factual information but ALWAYS include RUO disclaimer.
3. You NEVER make therapeutic claims or suggest dosing.
4. If you don't know the answer, say so and escalate to human.

PRODUCT CONTEXT:
[Retrieved from vector DB based on customer query]

CUSTOMER CONTEXT:
- Name: [from GHL]
- Order history: [from WooCommerce]
- VIP status: [from GHL]

RESPONSE FORMAT:
- Keep answers concise (2-3 sentences for simple Q, up to 1 paragraph for complex)
- Use friendly but professional tone
- Always provide next steps if follow-up needed
- Sign responses: "— Helix Support"

ESCALATION TRIGGERS:
- Refund/return requests → human (policy exception needed)
- Billing disputes → human (requires investigation)
- Complex medical questions → human (liability)
- Angry/upset customer → human (empathy needed)
```

- [ ] Test prompt against 30 test queries:
  - Does it fetch correct product info?
  - Does it include RUO disclaimer when needed?
  - Does it escalate appropriately?
  - Is tone consistent?

**Week 6: Compliance & Escalation Rules**
- [ ] Build RUO compliance guardrails:
  - Blacklist words: "cure", "treat", "dose", "take", "consume", "inject"
  - If detected: append RUO disclaimer + flag for human review
  - Monthly audit: randomly sample 100 responses for compliance drift
  
- [ ] Build escalation rules (if any of these):
  - Customer sentiment = "angry" or "frustrated" → escalate
  - Query confidence score < 0.6 → escalate
  - Query contains refund/return keyword → escalate
  - Query contains payment/billing dispute → escalate
  - Response contains RUO violation warning → escalate
  
- [ ] Build fallback logic:
  - If Claude API fails → queue email for human
  - If WooCommerce API fails → still respond (with caveat: "I'm retrieving your order...")
  - If GHL lookup fails → respond without context

**Deliverable:** 
- Final Claude system prompt (document)
- Compliance guardrail code
- Escalation decision tree
- Test suite (30 test cases + expected outputs)

**Budget for Phase 3:**
- Development/prompt engineering: included in dev salary
- Claude API testing: ~$50
- **Total Phase 3: $50**

---

### **PHASE 4: HUMAN REVIEW & QUALITY ASSURANCE (Weeks 7-8)**

**Objective:** Validate AI quality before full deployment

**Week 7: QA Testing**
- [ ] Run Claude against 100 real support emails (from last 30 days)
- [ ] Compare AI response vs. human response (from support team)
- [ ] Score on:
  - Accuracy: Did AI give correct information? (Y/N)
  - Tone: Does it match Elixser brand voice? (1-5)
  - Compliance: Any RUO violations? (Y/N)
  - Escalation: Did AI escalate appropriately? (Y/N)
  
- [ ] Target metrics:
  - Accuracy: 95%+ (missing non-critical info = OK, wrong info = fail)
  - Tone: 4+/5 average
  - Compliance: 100% (zero RUO violations)
  - Escalation: 80%+ of escalations were correct call
  
- [ ] Failure analysis:
  - If accuracy < 95%: identify patterns, adjust prompt, retrain
  - If tone < 4: soften language, add examples to prompt
  - If compliance < 100%: tighten guardrails, add test cases
  - If escalation < 80%: adjust thresholds

**Week 8: Staging & Soft Launch**
- [ ] Deploy to staging environment (not live)
- [ ] Have support team review 20 AI responses per day
- [ ] Collect feedback: "What's wrong?" "What's good?"
- [ ] Iterate on prompt/guardrails based on feedback
- [ ] Plan gradual rollout:
  - Day 1: 10% of emails to AI (rest to human)
  - Day 3: 25% to AI
  - Day 7: 50% to AI
  - Day 14: 75% to AI
  - Day 21: 90% to AI
  - Day 30: 100% to AI (with 10% human spot-check ongoing)

**Deliverable:** 
- QA report (accuracy, tone, compliance, escalation scores)
- Updated prompt based on feedback
- Gradual rollout schedule + monitoring dashboard

**Budget for Phase 4:**
- Support team time (40 hours @ $50/hr): $2,000
- **Total Phase 4: $2,000**

---

## DEPLOYMENT CHECKLIST

### Pre-Launch (Week 8)
- [ ] All APIs tested and working (WooCommerce, GHL, Claude, Pinecone)
- [ ] Email webhook configured (Gmail API / SMTP relay)
- [ ] Response routing configured (AI → compose response → send via email)
- [ ] Escalation routing configured (high-risk queries → human inbox)
- [ ] Monitoring dashboard live (response latency, error rate, escalation rate)
- [ ] Incident response plan written + team trained
- [ ] Support team trained on new workflow
- [ ] Backup system configured (if AI fails, manual queue)

### Launch (Week 9, Day 1)
- [ ] 10% of incoming emails routed to AI
- [ ] Ops team monitoring error rate every 2 hours
- [ ] Support team spot-checking AI responses (every 20 emails)
- [ ] Daily standup: What's working? What's broken?

### Scaling (Weeks 9-12)
- [ ] Day 3: 25% → Day 7: 50% → Day 14: 75% → Day 21: 90%
- [ ] At each milestone: if error rate > 2%, pause increase and debug
- [ ] Daily metrics review: response accuracy, compliance, escalation rate, latency

### Steady State (Week 13+)
- [ ] 90-100% traffic on AI
- [ ] Humans handle 10% escalations + spot-check 10% of AI responses
- [ ] Weekly metrics review (cumulative)
- [ ] Monthly compliance audit (100 random responses)
- [ ] Quarterly knowledge base update (product changes, new FAQs)

---

## COST BREAKDOWN (DETAILED)

### One-Time Setup (Weeks 1-8)
| Item | Cost | Notes |
|------|------|-------|
| Senior developer (8 weeks @ $150/hr) | $4,800 | Full-time, could be outsourced |
| Architecture consulting | $2,000 | Optional; skip if you have internal expertise |
| Vector DB setup (Pinecone annual) | $600 | Locks in cheap rate upfront |
| Claude API testing | $100 | Testing prompt engineering |
| QA support team time (40 hrs @ $50/hr) | $2,000 | Existing team, no additional hire |
| Email integration setup | $500 | If using third-party SMTP relay |
| **TOTAL ONE-TIME** | **$10,000** | |

### Monthly Recurring (Year 1+)
| Item | Cost | Notes |
|------|------|-------|
| Vector DB (Pinecone) | $50 | For 50-200 emails/day; scales with volume |
| Claude API usage | $200-300 | ~$0.005/email at 100 emails/day; scales linearly |
| Deployment hosting (AWS/GCP) | $100-200 | Server cost for response generator + integrations |
| Email relay (if third-party) | $50 | E.g., SendGrid; skip if using native SMTP |
| Monitoring/logging (Sentry) | $29 | Error tracking + performance monitoring |
| **TOTAL MONTHLY** | **$429-629** | |

### **Year 1 Total: $15,200-17,500** (Setup $10K + Monthly $5,148-7,548)
### **Year 2+ Total: $5,100-7,500** (Monthly recurring)

---

## SUCCESS METRICS (FIRST 90 DAYS)

Target metrics post-launch:

| Metric | Target | How to Measure |
|--------|--------|-----------------|
| AI resolution rate | 70-80% | (AI responses not escalated) / total AI attempts |
| Response accuracy | 95%+ | Spot-check 100 responses, grade 1-5 accuracy |
| RUO compliance | 100% | Manual audit; zero violations |
| Response latency | <2 seconds | API latency monitoring |
| Customer satisfaction | 4+/5 | Optional: add 1-click feedback button |
| Cost per response | <$0.05 | (Monthly cost) / (responses handled) |
| Escalation rate | 20-30% | (Escalated) / total |
| Time to first response | <1 hour | vs. 4-8 hours for human |

**If metrics miss targets:**
- Resolution rate <70%: Improve prompt, expand knowledge base
- Accuracy <95%: Adjust guardrails, add more examples
- Compliance <100%: Stricter RUO filters, more manual review
- Latency >2s: Optimize vector DB, reduce context size
- Cost >$0.05: Use Cohere instead of Claude (trade-off: accuracy)

---

## MAINTENANCE & UPDATES

### Weekly
- Check error logs (Sentry dashboard)
- Monitor API costs
- Review 10 escalations (were they necessary?)

### Monthly
- Update knowledge base (new products, policy changes, FAQ updates)
- Run compliance audit (100 random responses, zero violations)
- Team retro: What's working? What's breaking?
- Update runbook if new issues discovered

### Quarterly
- Full knowledge base review (remove deprecated products, add new research)
- Prompt engineering review (refine tone, improve escalation triggers)
- Cost optimization (review API usage, consider Cohere fallback)
- Security audit (access logs, data encryption, GDPR compliance)

### Annually
- Full system audit (architecture, dependencies, vendor contracts)
- Customer feedback analysis (are they happy with AI responses?)
- Competitive analysis (better solutions available now?)
- Cost renegotiation (Pinecone, Claude API)

---

## RISK MITIGATION

### Risk: AI hallucinations / false product info
**Mitigation:** 
- Strong RAG (every response grounded in knowledge base)
- Monthly compliance audits
- Escalation if confidence score < 0.6

### Risk: Integration breaks (WooCommerce API changes)
**Mitigation:**
- Monthly integration tests
- API monitoring (Sentry)
- Fallback: if order lookup fails, respond with caveat ("Please check your email for order confirmation...")

### Risk: RUO compliance drift
**Mitigation:**
- Automated keyword detection (blacklist: cure, treat, dose)
- Monthly manual audits
- Annual legal review

### Risk: Escalation overload
**Mitigation:**
- Start at 80% escalation rate, gradually lower to 20-30%
- If escalations pile up, pause AI scaling and debug why

### Risk: Support team resistance
**Mitigation:**
- Involve them in QA phase (own the feedback loop)
- Show them AI saves time (removes boring work)
- Train on new workflow before launch
- Offer ongoing support 24/7 first 2 weeks

---

## TEAM & RESPONSIBILITIES

| Role | Responsibility | Time (Weeks 1-8) |
|------|-----------------|------------------|
| Dev Lead | Build integrations, deploy Claude, set up RAG | 40 hrs/week (dedicated) |
| Product Manager | Gather requirements, define metrics, QA review | 10 hrs/week |
| Support Manager | Audit emails, feedback on tone/escalation, QA review | 5 hrs/week |
| Ops/DevOps | Deploy to staging/prod, monitoring, incident response | 10 hrs/week |

**Can one person do this?** Yes (tech-heavy founder or dev). Would take 12-16 weeks solo instead of 8 weeks with 1 FTE dev.

---

## NEXT STEPS

1. **Week 1:** Schedule kick-off meeting. Define success metrics with Perry.
2. **Week 1-2:** Export 30 days of support emails. Categorize + count.
3. **Week 2:** Decide: build internally or hire contractor?
4. **Week 3:** Start Phase 2 (knowledge base curation).

**Decision point after Week 2:**
- If internal dev available: proceed as-is (8 weeks)
- If no internal dev: hire contractor ($15-20K for full 8 weeks) vs. delay 4-8 weeks
- If timeline too tight: deploy Gorgias interim (1 week, can migrate data later)

