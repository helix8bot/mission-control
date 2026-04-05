# AI Customer Service Solutions — Risk Assessment Matrix

**Date:** April 4, 2026  
**Scope:** Elixser Peptides & Elixser Health Email Support

---

## RISK MATRIX (by solution)

### OFF-THE-SHELF SOLUTIONS

#### **Zendesk Answer Bot**
| Risk | Severity | Likelihood | Mitigation |
|------|----------|-----------|-----------|
| Vendor lock-in (high switching cost) | 🔴 HIGH | HIGH | Budget for migration cost if switching; negotiate annual vs. 3-year |
| RUO language not enforced | 🟡 MEDIUM | MEDIUM | Create custom knowledge base; quarterly compliance audit |
| Escalation overload (weak AI = more hand-offs) | 🟡 MEDIUM | HIGH | Set escalation threshold; monitor agent utilization |
| High monthly cost | 🔴 HIGH | CONFIRMED | Accept cost or choose lower-tier solution |
| Complex integration with GHL | 🟡 MEDIUM | MEDIUM | Use Zapier Pro; invest in webhook setup |

**Overall Risk Profile:** HIGH (cost + vendor lock-in)

---

#### **Intercom Resolution Bot**
| Risk | Severity | Likelihood | Mitigation |
|------|----------|-----------|-----------|
| Limited ability to handle niche peptide Q&A | 🟡 MEDIUM | HIGH | Use hybrid approach: Intercom for simple Q, custom API for complex |
| CRM lock-in | 🟡 MEDIUM | MEDIUM | Confirm you can export contact history before committing |
| API rate limits on order lookups | 🟠 LOW | LOW | Cache frequently accessed orders |
| GHL sync complexity | 🟡 MEDIUM | HIGH | Use Zapier; test sync before going live |

**Overall Risk Profile:** MEDIUM (capability gaps)

---

#### **Freshdesk Freddy**
| Risk | Severity | Likelihood | Mitigation |
|------|----------|-----------|-----------|
| AI too weak for peptide research Q&A | 🔴 HIGH | CONFIRMED | Use as agent-assist only; expect 30-40% escalation rate |
| RUO compliance not enforced | 🔴 HIGH | MEDIUM | Manual review of all peptide-related responses (defeats automation purpose) |
| Scaling limitations on complex queries | 🔴 HIGH | CONFIRMED | Don't expect >50% resolution rate for non-order questions |
| Not designed for research inquiries | 🔴 HIGH | CONFIRMED | Keep this for order status ONLY; staff human team for research Q&A |

**Overall Risk Profile:** VERY HIGH (underpowered for stated requirements)

**Recommendation:** NOT suitable for Elixser's full scope. Only if using as agent-assist layer for order status.

---

#### **Gorgias**
| Risk | Severity | Likelihood | Mitigation |
|------|----------|-----------|-----------|
| AI has limits on complex peptide Q&A | 🟡 MEDIUM | HIGH | Use custom guardrails layer for research questions; Gorgias for order context |
| Order context may be incomplete | 🟠 LOW | LOW | Verify WooCommerce sync completeness before launch |
| GHL integration via Zapier (not native) | 🟠 LOW | MEDIUM | Test Zapier workflows; add error logging |
| RUO guardrails not built-in | 🟡 MEDIUM | MEDIUM | Create custom prompt rules; weekly compliance spot-check |

**Overall Risk Profile:** MEDIUM-LOW (hybrid approach recommended)

---

#### **HubSpot Service Hub**
| Risk | Severity | Likelihood | Mitigation |
|------|----------|-----------|-----------|
| Complex setup/learning curve | 🟡 MEDIUM | HIGH | Allocate 2-3 weeks for onboarding; hire HubSpot consultant if needed |
| High cost for pure-support use case | 🟡 MEDIUM | CONFIRMED | Justify by expanding to full CRM later or reduce agent seats |
| AI is general-purpose (not peptide-optimized) | 🟡 MEDIUM | HIGH | Use for simple queries; staff peptide expert for research Q&A |
| Contact duplication risk in CRM | 🟠 LOW | MEDIUM | Set up deduplication rules immediately |

**Overall Risk Profile:** MEDIUM (complexity + cost + capability)

---

### CUSTOM SOLUTIONS

#### **OpenAI + RAG**
| Risk | Severity | Likelihood | Mitigation |
|------|----------|-----------|-----------|
| AI hallucination (false product info) | 🔴 HIGH | MEDIUM | Strong RAG + guardrails; sample 20% of responses for QA; monthly audits |
| Development delays/scope creep | 🔴 HIGH | MEDIUM | Fixed-price contract; clear specs; weekly check-ins |
| Data quality in RAG (garbage in = garbage out) | 🟡 MEDIUM | HIGH | Spend 2 weeks curating product knowledge base; mark deprecated products |
| API cost volatility (OpenAI price changes) | 🟠 LOW | LOW | Budget 20% buffer; monitor usage monthly |
| RUO compliance drift over time | 🟡 MEDIUM | MEDIUM | Automated testing for RUO keywords; quarterly audits |
| Outdated WooCommerce/GHL API integrations | 🟠 LOW | MEDIUM | Use well-maintained libraries; test monthly |

**Overall Risk Profile:** MEDIUM (solvable with good process)

**Mitigation: Hire experienced Claude/OpenAI developer; clear contracts; phased rollout**

---

#### **Claude + RAG** ⭐
| Risk | Severity | Likelihood | Mitigation |
|------|----------|-----------|-----------|
| AI hallucination (but lower than OpenAI) | 🟠 LOW | LOW | Claude is better at instruction-following; same RAG + guardrails |
| Development timeline (4-8 weeks) | 🟡 MEDIUM | MEDIUM | Start immediately; hire 2 devs if needed |
| Dependent on Anthropic API availability | 🟠 LOW | VERY LOW | Anthropic has strong uptime; fallback to OpenAI available |
| RAG knowledge base curation | 🟡 MEDIUM | HIGH | Allocate 100 hours to curate product data |
| Cost scaling with volume (cheap but grows) | 🟠 LOW | CONFIRMED | Budget $500-800/month at 100-200 emails/day |

**Overall Risk Profile:** LOW (best-mitigated custom approach)

---

#### **Cohere + RAG**
| Risk | Severity | Likelihood | Mitigation |
|------|----------|-----------|-----------|
| Weaker reasoning for complex peptide Q&A | 🟡 MEDIUM | CONFIRMED | Accept lower accuracy on complex research questions; escalate more |
| Smaller ecosystem (fewer examples/support) | 🟡 MEDIUM | MEDIUM | Hire Cohere-experienced dev or accept steeper learning curve |
| Hallucination risk higher than Claude | 🔴 HIGH | MEDIUM | Need stronger RAG + guardrails; more human review |
| Cost advantage may not justify weaker AI | 🟡 MEDIUM | MEDIUM | Only choose if cost is critical bottleneck |

**Overall Risk Profile:** MEDIUM-HIGH (capability trade-off for cost)

**Better option:** Pay more for Claude; get better accuracy and compliance.

---

### HYBRID SOLUTIONS

#### **Custom OpenAI + Zendesk**
| Risk | Severity | Likelihood | Mitigation |
|------|----------|-----------|-----------|
| Complexity of two-system management | 🟡 MEDIUM | CONFIRMED | Clear ownership: ops team for Zendesk, dev team for AI |
| Escalation routing failures | 🟡 MEDIUM | MEDIUM | Set SLAs for escalation time; monitor daily |
| Cost accumulation (both systems) | 🔴 HIGH | CONFIRMED | Accept $24K+/year or negotiate lower Zendesk tier |
| Data sync between systems | 🟡 MEDIUM | HIGH | Implement bidirectional webhooks; test weekly |
| RUO compliance across both layers | 🟡 MEDIUM | MEDIUM | Each system needs its own compliance guardrails |

**Overall Risk Profile:** MEDIUM-HIGH (solvable but complex)

---

#### **Gorgias + Custom Guardrails**
| Risk | Severity | Likelihood | Mitigation |
|------|----------|-----------|-----------|
| Custom API may have bugs | 🟡 MEDIUM | MEDIUM | Code review; staging environment; gradual rollout (10% → 50% → 100%) |
| Gorgias becomes bottleneck (order context) | 🟠 LOW | LOW | Cache order data; implement caching layer |
| RUO compliance needs monitoring | 🟡 MEDIUM | MEDIUM | Automated testing + spot-check samples |
| Maintenance burden (lighter than full custom) | 🟠 LOW | MEDIUM | Single developer can maintain; clear documentation |

**Overall Risk Profile:** LOW-MEDIUM (good balance)

---

## RISK SCORING SUMMARY

| Solution | Capability Risk | Cost Risk | Implementation Risk | Compliance Risk | Overall |
|----------|----------------|-----------|-------------------|-----------------|---------|
| Zendesk | 🟡 | 🔴 | 🟠 | 🟡 | 🔴 HIGH |
| Intercom | 🟡 | 🟡 | 🟠 | 🟡 | 🟡 MEDIUM |
| Freshdesk | 🔴 | 🟢 | 🟢 | 🔴 | 🔴 VERY HIGH |
| Gorgias | 🟡 | 🟢 | 🟢 | 🟡 | 🟠 MEDIUM-LOW |
| HubSpot | 🟡 | 🟡 | 🟡 | 🟢 | 🟡 MEDIUM |
| OpenAI RAG | 🟡 | 🟠 | 🟡 | 🟡 | 🟡 MEDIUM |
| **Claude RAG** | 🟢 | 🟠 | 🟡 | 🟢 | 🟢 **LOW** |
| Cohere RAG | 🟡 | 🟢 | 🟡 | 🟡 | 🟡 MEDIUM |
| Custom + Zendesk | 🟡 | 🔴 | 🟡 | 🟡 | 🟡 MEDIUM-HIGH |
| Gorgias + Custom | 🟢 | 🟠 | 🟡 | 🟡 | 🟠 LOW-MEDIUM |

---

## COMPLIANCE-SPECIFIC RISKS

### RUO (Research Use Only) Compliance Challenges

**All solutions face this challenge:**
- AI may inadvertently suggest therapeutic use
- Peptide research language is nuanced (few competitors have trained models)
- Regulatory environment is changing (FDA enforcement increasing)

**Risk Matrix:**

| Solution | RUO Guardrail Strength | Manual Review Load | Regulatory Drift Risk |
|----------|----------------------|-------------------|----------------------|
| Zendesk | 🟡 Medium | 🔴 High | 🟡 Medium |
| Intercom | 🟡 Medium | 🔴 High | 🟡 Medium |
| Freshdesk | 🔴 Low | 🔴 Very High | 🔴 High |
| Gorgias | 🟡 Medium | 🔴 High | 🟡 Medium |
| HubSpot | 🟡 Medium | 🔴 High | 🟡 Medium |
| OpenAI RAG | 🟢 High | 🟠 Medium | 🟠 Low-Medium |
| **Claude RAG** | 🟢 **Very High** | 🟢 **Low** | 🟢 **Low** |
| Cohere RAG | 🟡 Medium | 🟠 Medium-High | 🟡 Medium |
| Custom + Zendesk | 🟢 High | 🟡 Medium | 🟠 Low-Medium |
| Gorgias + Custom | 🟢 High | 🟡 Medium | 🟠 Low-Medium |

**Why Claude wins on compliance:**
- Stronger instruction-following for careful language
- Better at understanding nuance (research vs. therapeutic claims)
- Can be prompted to flag RUO violations proactively
- Easier to audit ("explain your reasoning")

---

## FAILURE SCENARIOS & RECOVERY

### Scenario 1: AI makes false claim about peptide efficacy
**Platforms affected:** All
**Impact:** 🔴 HIGH (legal/compliance risk)
**Recovery time:**
- Zendesk/Intercom/HubSpot: 2-4 hours (manual update to knowledge base)
- Custom solution: 1 hour (prompt update) + 30 min (re-deploy)
- Gorgias: 3-5 hours (platform config + API)
**Mitigation:** Monthly audit of 100 random responses; automated RUO keyword detection

---

### Scenario 2: System goes offline during peak email volume
**Platforms affected:** Custom solutions (most critical)
**Impact:** 🟡 MEDIUM (missed SLAs, customer frustration)
**Recovery time:**
- Zendesk/Intercom/Gorgias: 15 min (provider failover)
- Custom: 30-60 min (reboot servers + check API status)
**Mitigation:** Implement automated failover; queue emails for batch processing; alert on downtime >15 min

---

### Scenario 3: Data breach / compliance audit failure
**Platforms affected:** Custom solutions > Cloud platforms > Zendesk/HubSpot
**Impact:** 🔴 CRITICAL (legal exposure, regulatory fine)
**Recovery time:** Days-weeks (investigation + remediation)
**Mitigation:** 
- Regular security audits (quarterly)
- Encryption at rest + in transit
- Access logs for all customer data
- Incident response plan before launch

---

### Scenario 4: Integration breaks (WooCommerce API change)
**Platforms affected:** Custom solutions (most dependent on external APIs)
**Impact:** 🟠 MEDIUM (incomplete order info, confused customers)
**Recovery time:**
- Detection: 2-4 hours
- Fix: 2-8 hours
- Rollback: 30 min
**Mitigation:** 
- API monitoring (Sentry, DataDog)
- Test integrations monthly
- Maintain fallback: human review if order lookup fails

---

## FINAL RECOMMENDATION SUMMARY

### IF YOU WANT MAXIMUM SAFETY & COMPLIANCE:
→ **Claude + RAG** (4-8 weeks, $15.8K first year)
- Lowest risk across capability, compliance, hallucination
- Best for RUO-sensitive work
- Scales well with volume

### IF YOU WANT FASTEST DEPLOYMENT:
→ **Gorgias** (1-2 weeks, $5.6K first year)
- Deploy order tracking immediately
- Add custom AI layer later
- Hybrid approach acceptable as interim

### IF YOU WANT PROFESSIONAL HELPDESK:
→ **Zendesk + Custom AI** (6-10 weeks, $24.8K first year)
- Enterprise-grade system
- Strong escalation + audit trails
- Overkill for pure support (no sales/marketing tiers needed)

### IF YOU WANT LOWEST COST:
→ **Cohere + RAG** (4-8 weeks, $13.2K first year)
- Cheapest custom option
- Accept lower accuracy on complex peptide Q&A
- Better fallback to Claude if Cohere underperforms

---

## RED FLAGS TO WATCH

🚩 **If choosing off-shelf (Zendesk/Intercom/Gorgias):**
1. Expect 30-40% escalation rate for peptide research Q&A
2. RUO compliance will require manual review
3. Cost will grow as volume increases
4. Vendor lock-in is real (switching cost $5-10K)

🚩 **If choosing custom without experienced developer:**
1. Timeline will slip (plan for 10-12 weeks, not 4-8)
2. Hallucination risk increases
3. Maintenance burden will be underestimated
4. RAG quality depends on data curation (easy to get wrong)

🚩 **If choosing Freshdesk Freddy:**
1. Don't expect it to solve peptide research Q&A
2. Manual review overhead will negate time savings
3. Only works for order tracking / simple FAQ
4. Budget will need to scale with headcount for complex Q&A

---

## CONTINGENCY BUDGET

Add to any solution budget:
- **Compliance audit:** $2,000-5,000 (quarterly)
- **Custom integration fixes:** $2,000-5,000/year
- **Emergency support:** $1,000-2,000 (on-call developer)
- **Data curation/updates:** $1,000-2,000/year

**Total Year 1 buffer:** +$6,000-14,000

This ensures you have runway to fix issues without stopping operations.

