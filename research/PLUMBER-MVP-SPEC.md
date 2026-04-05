# 🔧 PLUMBERS MVP SPECIFICATION
**Target**: Buildable in 2.5 hours | Deploy in 1 week | First customer in 10 days

---

## WHAT WE'RE BUILDING

A dead-simple lead + dispatch + payment system for plumbers with 1-3 employees.

**Core Promise**: "Never lose a lead. Dispatch the right person. Get paid faster."

---

## MVP FEATURE SET (5 FEATURES ONLY)

### Feature 1: Lead Intake Board
**Problem**: Plumbers miss leads from Google My Business, Yelp, manual inquiries

**Solution**:
- Dashboard shows all incoming leads (Google My Business pull via API + manual paste box)
- Lead card: Customer name, phone, address, job type, time requested
- Status: New → Assigned → In Progress → Done → Paid
- One click: "Assign to Tech" (dropdown of techs)

**Implementation** (45 min):
- Dashboard component (React table or Airtable embedded)
- Google My Business API integration (pull "Messages" feed)
- Manual lead paste box (JSON or CSV)
- Status dropdown (New/Assigned/In Progress/Done/Paid)
- Save lead to database (Firebase or Supabase)

---

### Feature 2: Dispatch Board
**Problem**: No one knows who's doing what, where they are, when they'll arrive

**Solution**:
- Simple Kanban board: [Unassigned] → [Tech 1] → [Tech 2] → [Tech 3]
- Drag-drop lead card from Unassigned to any Tech lane
- One-click: "Send SMS to customer" + "Send SMS to tech"

**Implementation** (45 min):
- Kanban board (React DnD or similar)
- Tech lane = one person + current capacity (e.g., "Tom (1 job in progress)")
- Drag-drop trigger = auto-send SMS templates (pre-configured)
- Track lead location on simple map (optional in future)

---

### Feature 3: Automated SMS Notifications
**Problem**: Customers have no idea where their plumber is, when to expect them

**Solution**:
- **To Customer**: Auto SMS when assigned ("A plumber is on the way. ETA 2 hours.")
- **To Tech**: Auto SMS when assigned ("Job: 123 Main St, Kitchen leak. Customer expecting you.")
- **To Customer**: Auto SMS when job done ("Your job is complete. Please review the work.")
- **Trigger**: Manually send via button or auto-trigger on status change

**Implementation** (40 min):
- SMS template system (Twilio)
- Pre-configured templates:
  - "We've assigned a plumber to your job. ETA [TIME]. Tech name: [TECH]"
  - "[CUSTOMER], your plumber [TECH] is on the way. ETA [TIME]"
  - "Job complete! Rate your experience: [LINK]"
- Send button (one-click per lead)
- Track SMS delivery (log in lead record)

---

### Feature 4: Payment Reminder SMS
**Problem**: Invoices sit unpaid. Manual follow-up = lost revenue

**Solution**:
- On job completion, show "Send payment reminder SMS"
- Template: "Your [SERVICE] is complete. Total: $[AMOUNT]. Pay here: [PAYMENT_LINK]"
- Payment link = Stripe Checkout or Square (one-time invoice)
- Track payment status (paid/unpaid)

**Implementation** (30 min):
- Job completion screen: "Ready to collect payment?"
- Auto-generate Stripe payment link for amount
- Send SMS with payment link
- Webhook: Listen for payment, auto-update job status to "Paid"

---

### Feature 5: One-Click Google Review Request
**Problem**: Satisfied customers don't leave reviews. Lost word-of-mouth

**Solution**:
- On job "Paid", show button: "Ask for review"
- SMS template: "Thanks for using [BUSINESS]! Would you rate us? [GOOGLE_REVIEW_LINK]"
- Capture review link (direct to Google My Business)

**Implementation** (20 min):
- Button on completed job
- Pre-configured SMS template
- Use pre-built Google review URL (https://search.google.com/local/writereview?placeid=[PLACE_ID])

---

## TECH STACK (What We Use)

| Component | Tech | Cost/mo |
|---|---|---|
| **Frontend** | React (Vite) | Free |
| **Backend** | Node.js + Express | Free |
| **Database** | Firebase or Supabase | Free tier, then $25/100 users |
| **SMS** | Twilio | $0.0075/SMS (negligible) |
| **Payments** | Stripe Connect | 2.2% + $0.30/transaction |
| **Auth** | Firebase Auth | Free |
| **Hosting** | Vercel (frontend) + Railway (backend) | $20-50/month |

**Total cost to us**: ~$50-100/month to run (pass through to customer = $25/month = healthy margin)

---

## USER FLOW (Happy Path)

### Day 1: Plumber Signs Up
1. Visit landing page
2. Enter: Name, phone, email, business name, # of techs
3. Auto-create account
4. Add tech names (Tom, Mike, etc.)
5. Get SMS API key + Google API key instructions

### Day 2: First Lead Comes In
1. Lead arrives (from Google My Business or manual paste)
2. Dashboard shows "New Lead: John Smith, 123 Main St, Leak"
3. Plumber clicks "Assign to Tom"
4. System auto-sends SMS:
   - To customer: "Tom is on the way, ETA 2 hours"
   - To Tom: "Job: 123 Main St, kitchen leak"
5. Tom shows up, fixes it, takes photo (optional)

### Same Day: Payment + Review
1. Plumber marks job "Done"
2. Clicks "Send payment reminder"
3. SMS goes to customer: "Your service is complete. Total: $250. Pay here: [LINK]"
4. Customer clicks link, pays via Stripe
5. Job auto-marks "Paid"
6. Plumber clicks "Ask for review"
7. SMS goes to customer with Google review link

---

## DATABASE SCHEMA (Minimal)

```
Users
├── id
├── email
├── phone
├── business_name
├── stripe_customer_id
├── created_at

Techs
├── id
├── user_id
├── name
├── phone
├── created_at

Leads
├── id
├── user_id
├── customer_name
├── customer_phone
├── customer_address
├── job_type (leak, new install, maintenance, etc.)
├── assigned_tech_id
├── status (new, assigned, in_progress, done, paid)
├── created_at
├── completed_at
├── amount
├── stripe_invoice_id
├── notes

SMS_Logs
├── id
├── lead_id
├── recipient_phone
├── message
├── type (to_customer, to_tech, payment, review)
├── status (sent, delivered, failed)
├── sent_at
```

---

## DEPLOYMENT CHECKLIST

### Day 1-3: Build
- [ ] Set up React + Node skeleton
- [ ] Create Supabase project
- [ ] Build Dashboard UI (lead table)
- [ ] Build Dispatch board UI (Kanban)
- [ ] Integrate Firebase Auth
- [ ] Build SMS templates
- [ ] Integrate Twilio

### Day 4: Integration
- [ ] Test Google My Business API
- [ ] Test Stripe payment flow
- [ ] Test SMS sending (send 5 test messages)
- [ ] End-to-end testing (sign up → add lead → dispatch → pay)

### Day 5-6: Refining
- [ ] Fix bugs from testing
- [ ] Polish UI (simple, clean)
- [ ] Add loading states
- [ ] Error handling
- [ ] Help documentation (1-pager)

### Day 7: Deploy
- [ ] Deploy frontend to Vercel
- [ ] Deploy backend to Railway
- [ ] Set up domain (or use vercel subdomain for beta)
- [ ] Create landing page (simple Webflow or HTML)
- [ ] Set up Stripe Connect

### Day 8-10: Beta Launch
- [ ] Email 10 beta plumbers (personal outreach)
- [ ] Free trial: "30 days free, then $25/month"
- [ ] Get feedback via Slack or email
- [ ] Iterate on feedback

---

## PRICING & PACKAGING

### Tier 1: Starter ($25/month)
- Up to 3 techs
- Unlimited leads
- Unlimited SMS
- Google My Business integration
- Payment reminders
- For: Solo + 2-person shops

### Tier 2: Pro ($50/month) [Future]
- Up to 10 techs
- Advanced reporting
- Custom SMS templates
- Calendar integration
- For: 3-10 person shops

### Tier 3: Team ($100/month) [Future]
- Unlimited techs
- API access
- Priority support
- For: 10+ person shops

---

## GTM PLAYBOOK

### Week 1: Soft Launch (Free Beta)
- Target: 10 beta plumbers
- Channel: Direct email to local plumbers (personal outreach)
- Pitch: "Free 30 days, need your feedback"
- Goal: Testimonials, feedback, viral video demo

### Week 2-3: Paid Launch ($25/month)
- Launch: Public landing page
- Ad spend: $500 Yelp ads + $500 Google Local ads
- Target: Plumbers searching "scheduling software" or "dispatch software"
- Pitch: "Stop losing leads. $25/month."
- Goal: 20-30 customers

### Week 4-6: Scale
- Ad spend: $2K/month (expand to Facebook, Instagram)
- Viral channel: Referral program ($50 credit per referral)
- Goal: 100+ customers

### Week 7-12: Aggressive Growth
- Ad spend: $5K/month
- Partnerships: Plumber associations, local supplier networks
- Goal: 500+ customers, $12.5K MRR

---

## LANDING PAGE (Simple)

**Headline**: "The plumber's dispatch board. Stop losing leads."

**Subheading**: "Never miss a lead again. Dispatch the right person. Get paid faster."

**Three Sections**:
1. **Lead Board** - Never lose a job lead
   - Aggregates Google My Business + manual upload
   - All leads in one place
   - One-click assignment

2. **Dispatch** - Know who's doing what, where
   - Simple dispatch board
   - Auto SMS to customer + tech
   - No confusion, no "Where's my plumber?" calls

3. **Get Paid Fast** - Payment reminder SMS
   - Auto payment link after job
   - Reduces unpaid invoices
   - One click, one customer pays

**CTA Button**: "Start Free Trial" → Sign up, add techs, import first lead

**Social Proof** (add as we get them):
- "Recovered 5 lost leads in the first week" — Tom, licensed plumber
- "Reduced no-shows by 30%"
- "Customers love tracking their plumber"

---

## SUCCESS METRICS (MVP)

| Metric | Target | Rationale |
|---|---|---|
| **Onboarding time** | < 5 min | Should be frictionless |
| **Time to first lead** | < 2 min | Tech adoption must be instant |
| **First payment** | Within 3 days | Proof of value |
| **Churn (Day 30)** | < 20% | MVP shouldn't leak customers |
| **NPS** | > 50 | Strong satisfaction on basics |
| **Feature usage** | 80%+ | Each feature should get used |

---

## WHAT WE DON'T BUILD (YET)

❌ Route optimization  
❌ Mobile app (use web responsive)  
❌ Advanced reporting  
❌ Calendar integration  
❌ Invoicing (just payment links)  
❌ Accounting sync  
❌ Custom branding  

**Why**: Feature creep kills launches. Perfect is the enemy of good.

---

## RISK: GOOGLE API RATE LIMITS

**Problem**: Google My Business API has rate limits. If we onboard 500 plumbers, 500 API calls = pricey.

**Solution**: 
- For MVP: Manual lead paste (no Google integration yet)
- Later: Batch API calls, caching layer
- Cost: $0.005-0.01 per API call (acceptable at scale)

---

## FINAL CHECKLIST

**Before launch:**
- [ ] Spec approved by Perry
- [ ] Dev assigned
- [ ] API keys created (Twilio, Stripe, Firebase)
- [ ] Domain reserved
- [ ] Landing page copywritten
- [ ] 10 beta plumbers identified
- [ ] Support email set up (help@dispatch.plumber or similar)

**Go/No-Go Decision**: Day 7

---

## NEXT STEPS

1. **Perry approves this spec** (today)
2. **Dev starts building** (tomorrow)
3. **Internal testing** (day 5)
4. **Beta launch** (day 8)
5. **First paying customers** (day 14)
6. **Scale to 500 customers** (by day 90)

---

**Questions?** This is a 2.5-hour build with 80% of the features we need to validate the model. Everything else can wait.
