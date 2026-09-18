# Thryve Sales Coaching Website

Complete sales coaching website with integrated chatbot, built on Cloudflare Pages, Workers, and D1.

## Project Structure

```
thryve-coaching/
├── index.html              # Main website (deploy to Pages)
├── worker.js               # API Worker (handles /api/enquiry, /api/enquiries)
├── wrangler.toml           # Cloudflare Worker configuration
├── schema.sql              # D1 database schema
├── DEPLOYMENT_GUIDE.md     # Step-by-step deployment instructions
├── README.md               # This file
└── admin-dashboard.html    # (Future) Private dashboard for viewing enquiries
```

## Quick Start

1. **Read** `DEPLOYMENT_GUIDE.md` for step-by-step setup
2. **Update** `wrangler.toml` with your Cloudflare account ID and database ID
3. **Deploy** using Wrangler CLI
4. **Test** the chatbot at thryvecoaching.io

## Features

### Live Day 1
- ✅ Beautiful, minimalist website (Thryve brand aligned)
- ✅ Chat widget in bottom-right corner (non-intrusive)
- ✅ Collects: name, company, enquiry
- ✅ Stores enquiries in D1 database (encrypted at rest)
- ✅ Email notifications when enquiry received
- ✅ Cloudflare security: Bot management, DDoS protection, email obfuscation

### Ready for Future Phases
- 🔮 Surveys & assessments (database tables ready, no UI day 1)
- 🔮 Private admin dashboard (view, filter, export enquiries)
- 🔮 Advanced analytics

## API Endpoints

### Create Enquiry
```bash
POST /api/enquiry
Content-Type: application/json

{
    "name": "John Doe",
    "company": "Acme Corp",
    "enquiry": "What's the first step?"
  }

Response: {
    "success": true,
    "message": "Enquiry received",
    "id": "uuid-here"
  }
```

### List Enquiries (Admin)
```bash
GET /api/enquiries
Authorization: Bearer YOUR_ADMIN_API_KEY

Response: {
    "success": true,
    "count": 5,
    "enquiries": [
          {
                  "id": "...",
                  "name": "John Doe",
                  "company": "Acme Corp",
                  "enquiry": "...",
                  "created_at": "2025-01-15T10:30:00Z",
                  "status": "new"
                },
          ...
        ]
  }
```

## Brand Alignment

The website uses the Thryve brand system:
- **Tagline**: "Better questions. Greater possibilities."
- **Colors**: 
  - Green: #2B6444 (primary)
  - Blue: #10C0D8 (secondary)
  - Violet: #7048A8 (accent)
- **Typography**: Inter + IBM Plex Mono
- **Logo**: Gradient thryve. wordmark

## Chatbot Widget

Non-intrusive design:
- Green button in bottom-right corner
- Slides in smoothly when clicked
- Minimalist form (3 fields only)
- Closes when clicking outside
- Mobile-responsive

Collects:
- **Name** (required)
- **Company** (optional)
- **Enquiry** (required)

## Security

Cloudflare provides:
- **Bot Management**: Stops scraping and automated attacks
- **DDoS Protection**: Free on all plans
- **Email Obfuscation**: Hides email addresses from bots
- **DNSSEC**: Protects DNS records
- **WAF Rules**: Ready to configure for additional protection

Worker endpoints are protected:
- `/api/enquiry` - Public (rate-limited by Cloudflare)
- `/api/enquiries` - Private (requires Bearer token)

## Database Schema

### enquiries (Active Day 1)
Stores all chatbot enquiries:
- `id` - UUID
- `name` - Sender's name
- `company` - Optional company name
- `enquiry` - The message
- `created_at` - Timestamp
- `status` - 'new', 'read', 'replied', 'archived'
- `notes` - Admin notes

Indexes: status, created_at

### surveys (Prepared for Future)
- `id` - UUID
- `title` - Survey name
- `description` - Survey details
- `created_at` - When created
- `is_active` - Boolean
- Relates to `survey_responses` table

### assessments (Prepared for Future)
- `id` - UUID
- `title` - Assessment name
- `description` - Assessment details
- `created_at` - When created
- `is_active` - Boolean
- Relates to `assessment_results` table

### audit_log (Prepared for Admin)
Tracks all admin actions:
- `action` - 'create', 'update', 'delete'
- `resource_type` - 'enquiry', 'survey', 'assessment'
- `resource_id` - UUID of resource
- `user_email` - Admin who performed action
- `details` - JSON with change details

## Environment Variables

Required secrets (set via `wrangler secret put`):

```env
CONTACT_EMAIL=hello@thryvecoaching.io          # Email for notifications
ADMIN_API_KEY=your-secure-random-key           # For /api/enquiries endpoint
MAILCHANNELS_API_TOKEN=your-mailchannels-token # Email service
```

## Deployment

### Prerequisites
- Node.js + npm
- Cloudflare account with Wrangler CLI
- Domain thryvecoaching.io pointed to Cloudflare

### Deploy Steps
```bash
# 1. Install Wrangler
npm install -g @cloudflare/wrangler

# 2. Authenticate
wrangler login

# 3. Create D1 database
wrangler d1 create thryve-coaching

# 4. Update wrangler.toml with your IDs
# 5. Set secrets
wrangler secret put CONTACT_EMAIL --env production
wrangler secret put ADMIN_API_KEY --env production
wrangler secret put MAILCHANNELS_API_TOKEN --env production

# 6. Deploy database schema
wrangler d1 execute thryve-coaching --file=schema.sql --env production

# 7. Deploy worker
wrangler deploy worker.js --env production

# 8. Deploy static site to Pages (via GitHub or direct upload)

# 9. Set up route: thryvecoaching.io/api/* → your worker
```

See `DEPLOYMENT_GUIDE.md` for detailed instructions.

## Architecture Diagram

```
User visits thryvecoaching.io
        ↓
  [Cloudflare Pages]
    index.html
        ↓
   User clicks chat
        ↓
  Submits form
        ↓
   Fetch /api/enquiry
        ↓
  [Cloudflare Worker]
    worker.js
        ↓
   Validate input
        ↓
   ├→ Save to D1
   └→ Send email (Mailchannels)
        ↓
   Response to user
```

## Performance

- **Page load**: ~1s (static HTML on edge)
- **Chatbot submit**: ~200ms (Worker processes in region)
- **Database save**: ~50ms (D1 is SQLite, co-located)
- **Email send**: ~2s (async, doesn't block response)

Cloudflare's global network means these happen in the data center closest to your users.

## Monitoring

### View Worker Logs
```bash
wrangler tail --env production
```

### Check D1 Status
```bash
wrangler d1 info thryve-coaching --env production
```

### Query Enquiries Manually
```bash
curl https://thryvecoaching.io/api/enquiries \
  -H "Authorization: Bearer YOUR_API_KEY"
```

## Support & Next Steps

### Day 1 (Done)
- Website live
- Chatbot functional
- Enquiries captured

### Week 1 (Optional)
- Add Google Analytics
- Set up Slack notifications for new enquiries
- Create admin dashboard

### Month 1 (Future Phase)
- Build survey builder UI
- Add assessment scoring
- Create private dashboard for Andrew

## Questions?

The system is designed to be minimal and extensible. Each component (Pages, Worker, D1) can be scaled independently:
- Need to add 100 fields to surveys? Extend the schema.
- Need to handle 1000x traffic? Cloudflare scales automatically.
- Need AI-powered chatbot responses? Replace worker.js logic.

All infrastructure is on Cloudflare's free/cheap tier to start. Upgrade only when you need to.

---

**Live at**: https://thryvecoaching.io  
**Built with**: Cloudflare Pages, Workers, D1, Mailchannels  
**Brand**: Thryve Sales Coaching  
**Created**: January 2025
