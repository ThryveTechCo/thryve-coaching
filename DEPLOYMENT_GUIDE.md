# Thryve Sales Coaching Website - Deployment Guide

This guide walks you through deploying the sales coaching website to Cloudflare Pages with integrated chatbot functionality, Cloudflare Workers API, and D1 database.

## What You're Deploying

- **Static Site**: `index.html` on Cloudflare Pages (thryvecoaching.io)
- - **API Worker**: `worker.js` handles chatbot enquiries (runs on Cloudflare Workers)
  - - **D1 Database**: Stores enquiries, surveys, and assessments
    - - **Email Notifications**: Sends you alerts when new enquiries arrive
     
      - ---

      ## Step 1: Prepare Your Environment

      ### Prerequisites
      - Cloudflare account (free plan works, but Workers and D1 need paid plan)
      - - Node.js & npm installed locally
        - - Git installed locally
          - - Your domain (thryvecoaching.io) added to Cloudflare
           
            - ### Install Wrangler CLI
            - ```bash
              npm install -g @cloudflare/wrangler
              ```

              Verify installation:
              ```bash
              wrangler --version
              ```

              ### Authenticate with Cloudflare
              ```bash
              wrangler login
              ```

              This opens a browser to authorize Wrangler with your Cloudflare account.

              ---

              ## Step 2: Create D1 Database

              ### Create the database
              ```bash
              wrangler d1 create thryve-coaching
              ```

              This returns output with your **database_id**. Save it—you'll need it for `wrangler.toml`.

              ### Verify creation
              ```bash
              wrangler d1 list
              ```

              You should see `thryve-coaching` in the list.

              ---

              ## Step 3: Update Configuration Files

              ### Edit `wrangler.toml`

              Replace placeholders:
              - `YOUR_CLOUDFLARE_ACCOUNT_ID` → Found in Cloudflare dashboard → Account Settings
              - - `YOUR_D1_DATABASE_ID` → From Step 2 output
                - - `YOUR_SECURE_API_KEY_HERE` → Generate a random string (for securing admin endpoints)
                 
                  - Example:
                  - ```toml
                    account_id = "a1b2c3d4e5f6g7h8i9j0"

                    [[d1_databases]]
                    database_id = "12345678-abcd-efgh-ijkl-mnopqrstuvwx"
                    ```

                    ---

                    ## Step 4: Set Environment Secrets

                    These are sensitive values that won't be visible in `wrangler.toml`:

                    ```bash
                    # Set your contact email for enquiry notifications
                    wrangler secret put CONTACT_EMAIL --env production
                    # Enter: hello@thryvecoaching.io (or your email)

                    # Set admin API key for accessing enquiry list
                    wrangler secret put ADMIN_API_KEY --env production
                    # Enter: A long random string (e.g., generated from https://generate-random.org/)

                    # Set Mailchannels token (for email notifications)
                    wrangler secret put MAILCHANNELS_API_TOKEN --env production
                    # Enter: Your Mailchannels API token (see step below)
                    ```

                    ### Getting Mailchannels Token

                    Mailchannels is Cloudflare's free email service for Workers:

                    1. Go to https://mailchannels.com/
                    2. 2. Click "Get Free API Token"
                       3. 3. Enter your domain (thryvecoaching.io)
                          4. 4. Copy the API token and paste it into the `wrangler secret put` command above
                            
                             5. Or use a simple command to test without email:
                             6. ```bash
                                wrangler secret put MAILCHANNELS_API_TOKEN --env production
                                # Enter: test (you'll need to set up properly before going live)
                                ```

                                ---

                                ## Step 5: Deploy D1 Database Schema

                                Initialize the database tables:

                                ```bash
                                wrangler d1 migrations create thryve-coaching initial_schema
                                ```

                                This creates a migration file. Edit it to contain your schema from `schema.sql`, then run:

                                ```bash
                                wrangler d1 execute thryve-coaching --file=schema.sql --env production
                                ```

                                Verify tables were created:
                                ```bash
                                wrangler d1 info thryve-coaching --env production
                                ```

                                ---

                                ## Step 6: Deploy Worker

                                Deploy your API worker:

                                ```bash
                                wrangler deploy worker.js --env production
                                ```

                                You'll see output with your Worker URL:
                                ```
                                Uploaded thryve-coaching-prod to Cloudflare Workers
                                https://thryve-coaching-prod.YOUR-ACCOUNT.workers.dev
                                ```

                                Test the Worker:
                                ```bash
                                curl https://thryve-coaching-prod.YOUR-ACCOUNT.workers.dev/api/enquiries \
                                  -H "Authorization: Bearer YOUR_SECURE_API_KEY"
                                ```

                                ---

                                ## Step 7: Deploy Static Site to Cloudflare Pages

                                ### Option A: Connect GitHub (Recommended)

                                1. Push your files to a GitHub repo:
                                2. ```bash
                                   git init
                                   git add index.html
                                   git commit -m "Add thryve coaching website"
                                   git remote add origin https://github.com/YOUR-USERNAME/thryve-coaching.git
                                   git push -u origin main
                                   ```

                                   2. In Cloudflare dashboard:
                                   3.    - Go to **Pages**
                                         -    - Click **Create a Project**
                                              -    - Select **Connect to Git** → GitHub
                                                   -    - Authorize Cloudflare with GitHub
                                                        -    - Select your `thryve-coaching` repo
                                                             -    - Branch: `main`
                                                                  -    - Build settings: Leave blank (we're serving static HTML)
                                                                       -    - Click **Deploy**
                                                                        
                                                                            - ### Option B: Direct Upload (Simpler for Now)
                                                                        
                                                                            - 1. In Cloudflare dashboard:
                                                                              2.    - Go to **Pages**
                                                                                    -    - Click **Create a Project** → **Direct Upload**
                                                                                         -    - Upload `index.html`
                                                                                              -    - Click **Deploy**
                                                                                               
                                                                                                   - ---

                                                                                                   ## Step 8: Connect Worker to Pages (Route Handler)

                                                                                                   Your Worker needs to handle `/api/*` requests. Set this up:

                                                                                                   1. In Cloudflare dashboard → **Zones** → Select your domain
                                                                                                   2. 2. Go to **Workers** → **Routes**
                                                                                                      3. 3. Add a route:
                                                                                                         4.    - Pattern: `thryvecoaching.io/api/*`
                                                                                                               -    - Service: Your deployed worker (e.g., `thryve-coaching-prod`)
                                                                                                                
                                                                                                                    - Now requests to `https://thryvecoaching.io/api/enquiry` go to your Worker.
                                                                                                                
                                                                                                                    - ---
                                                                                                                    
                                                                                                                    ## Step 9: Update HTML to Use Your Worker
                                                                                                                    
                                                                                                                    The `index.html` already sends enquiries to `/api/enquiry`. This will work if your Worker route is set up correctly.
                                                                                                                    
                                                                                                                    If you're testing before the route is active, update the fetch URL in the script:
                                                                                                                    ```javascript
                                                                                                                    const response = await fetch('/api/enquiry', {  // This path works after routing is set
                                                                                                                    ```
                                                                                                                    
                                                                                                                    ---
                                                                                                                    
                                                                                                                    ## Step 10: Test the Chatbot
                                                                                                                    
                                                                                                                    1. Visit `https://thryvecoaching.io`
                                                                                                                    2. 2. Click the green chat bubble (bottom right)
                                                                                                                       3. 3. Fill in: Name, Company (optional), Question
                                                                                                                          4. 4. Click "Send enquiry"
                                                                                                                             5. 5. You should see: "Thanks [Name]! I've passed this along to Andrew. He'll be in touch soon."
                                                                                                                               
                                                                                                                                6. Check your email for the notification within 30 seconds.
                                                                                                                               
                                                                                                                                7. ---
                                                                                                                               
                                                                                                                                8. ## Step 11: Access Your Enquiries
                                                                                                                               
                                                                                                                                9. ### Via Command Line
                                                                                                                                10. ```bash
                                                                                                                                    curl https://thryvecoaching.io/api/enquiries \
                                                                                                                                      -H "Authorization: Bearer YOUR_SECURE_API_KEY"
                                                                                                                                    ```
                                                                                                                                    
                                                                                                                                    ### Create a Simple Admin Dashboard (Optional, Future)
                                                                                                                                    Once you're ready, we can build a private dashboard to view all enquiries with D1 query filters.
                                                                                                                                    
                                                                                                                                    ---
                                                                                                                                    
                                                                                                                                    ## Troubleshooting
                                                                                                                                    
                                                                                                                                    ### "Worker not found" error
                                                                                                                                    - Make sure you've deployed the Worker: `wrangler deploy worker.js --env production`
                                                                                                                                    - - Make sure the route pattern is set to `thryvecoaching.io/api/*`
                                                                                                                                     
                                                                                                                                      - ### Enquiry not saving to D1
                                                                                                                                      - - Verify the database binding in `wrangler.toml`: `binding = "DB"`
                                                                                                                                        - - Check Worker logs: `wrangler tail --env production`
                                                                                                                                         
                                                                                                                                          - ### Email notification not sent
                                                                                                                                          - - Verify Mailchannels token is set: `wrangler secret list --env production`
                                                                                                                                            - - Check Worker logs for errors
                                                                                                                                              - - Temporarily remove email code to test the core flow
                                                                                                                                               
                                                                                                                                                - ### Chatbot form not submitting
                                                                                                                                                - - Open browser DevTools (F12) → Console tab
                                                                                                                                                  - - Check for error messages
                                                                                                                                                    - - Verify the `/api/enquiry` route exists
                                                                                                                                                     
                                                                                                                                                      - ### CORS errors
                                                                                                                                                      - - The Worker includes CORS headers—should work fine
                                                                                                                                                        - - If issues, check that routes are properly configured
                                                                                                                                                         
                                                                                                                                                          - ---
                                                                                                                                                          
                                                                                                                                                          ## What's Ready Day 1
                                                                                                                                                          
                                                                                                                                                          ✅ Website deployed and live
                                                                                                                                                          ✅ Chatbot widget functional
                                                                                                                                                          ✅ Enquiries stored in D1
                                                                                                                                                          ✅ Email notifications to you
                                                                                                                                                          ✅ Security: Bot management, email obfuscation (already configured)
                                                                                                                                                          
                                                                                                                                                          ---
                                                                                                                                                          
                                                                                                                                                          ## What's Ready for Next Phase
                                                                                                                                                          
                                                                                                                                                          🔮 Survey functionality (tables exist, ready for form)
                                                                                                                                                          🔮 Assessment system (tables exist, ready for scoring)
                                                                                                                                                          🔮 Private admin dashboard (view all enquiries, filter, export)
                                                                                                                                                          🔮 Analytics integration
                                                                                                                                                          
                                                                                                                                                          ---
                                                                                                                                                          
                                                                                                                                                          ## Final Checklist
                                                                                                                                                          
                                                                                                                                                          - [ ] D1 database created
                                                                                                                                                          - [ ] - [ ] Wrangler.toml updated with account ID and database ID
                                                                                                                                                          - [ ] - [ ] Secrets set (CONTACT_EMAIL, ADMIN_API_KEY, MAILCHANNELS_API_TOKEN)
                                                                                                                                                          - [ ] - [ ] D1 schema deployed
                                                                                                                                                          - [ ] - [ ] Worker deployed
                                                                                                                                                          - [ ] - [ ] Static site deployed to Pages
                                                                                                                                                          - [ ] - [ ] Worker route configured (thryvecoaching.io/api/*)
                                                                                                                                                          - [ ] - [ ] Chatbot tested end-to-end
                                                                                                                                                          - [ ] - [ ] Email notification received
                                                                                                                                                         
                                                                                                                                                          - [ ] ---
                                                                                                                                                         
                                                                                                                                                          - [ ] ## Support
                                                                                                                                                         
                                                                                                                                                          - [ ] If you hit issues:
                                                                                                                                                          - [ ] 1. Check Cloudflare dashboard → Workers → Real-time logs
                                                                                                                                                          - [ ] 2. Check D1 status: `wrangler d1 info thryve-coaching --env production`
                                                                                                                                                          - [ ] 3. Test the API directly with curl commands above
                                                                                                                                                          - [ ] 4. Verify all secrets are set: `wrangler secret list --env production`
                                                                                                                                                         
                                                                                                                                                          - [ ] You're all set! The website is now live at **thryvecoaching.io** with a fully functional chatbot. 🎉
