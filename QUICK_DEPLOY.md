# Quick Deployment (TL;DR)

Copy-paste version of deployment. Full details in `DEPLOYMENT_GUIDE.md`.

## 1. Install & Authenticate
```bash
npm install -g @cloudflare/wrangler
wrangler login
```

## 2. Create D1 Database
```bash
wrangler d1 create thryve-coaching
```
Save the database_id from the output.

## 3. Edit `wrangler.toml`
Update these lines:
```toml
account_id = "YOUR_ACCOUNT_ID"     # From Cloudflare dashboard
database_id = "YOUR_DATABASE_ID"   # From step 2
```

## 4. Set Secrets
```bash
wrangler secret put CONTACT_EMAIL --env production
# Enter: hello@thryvecoaching.io

wrangler secret put ADMIN_API_KEY --env production
# Enter: Generate random string (32 chars): $(openssl rand -base64 32)

wrangler secret put MAILCHANNELS_API_TOKEN --env production
# Enter: Your token from mailchannels.com
```

## 5. Deploy Schema
```bash
wrangler d1 execute thryve-coaching --file=schema.sql --env production
```

## 6. Deploy Worker
```bash
wrangler deploy worker.js --env production
```

## 7. Deploy Static Site
In Cloudflare dashboard:
- **Pages** → **Create a Project** → **Direct Upload**
- - Upload `index.html`
  - - Set custom domain: `thryvecoaching.io`
   
    - ## 8. Set Worker Route
    - In Cloudflare dashboard:
    - - **Zones** → **thryvecoaching.io** → **Workers**
      - - Add Route:
        -   - Pattern: `thryvecoaching.io/api/*`
            -   - Service: Your deployed worker
             
                - ## 9. Test
                - ```bash
                  curl https://thryvecoaching.io/api/enquiries \
                    -H "Authorization: Bearer YOUR_ADMIN_API_KEY"
                  ```

                  Visit https://thryvecoaching.io and test the chat.

                  ## Done! ✅

                  Website live with working chatbot, enquiry storage, and email notifications.

                  ---

                  **Full guide**: See `DEPLOYMENT_GUIDE.md` for detailed explanations and troubleshooting.
