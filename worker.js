/**
 * Thryve Coaching - Cloudflare Worker API
 * Handles enquiry submissions and admin queries
 */

export default {
  async fetch(request, env, ctx) {
    const { pathname, searchParams } = new URL(request.url);

    // CORS Headers
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    };

    // Handle preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    // POST /api/enquiry - Create new enquiry
    if (pathname === '/api/enquiry' && request.method === 'POST') {
      return handleCreateEnquiry(request, env, corsHeaders);
    }

    // GET /api/enquiries - List enquiries (admin only)
    if (pathname === '/api/enquiries' && request.method === 'GET') {
      return handleListEnquiries(request, env, corsHeaders);
    }

    return new Response(JSON.stringify({ error: 'Not found' }), {
      status: 404,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
};

async function handleCreateEnquiry(request, env, corsHeaders) {
  try {
    const { name, company, enquiry } = await request.json();

    // Validate input
    if (!name || !enquiry) {
      return new Response(
        JSON.stringify({ success: false, message: 'Name and enquiry are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Generate UUID
    const id = crypto.randomUUID();
    const created_at = new Date().toISOString();

    // Insert into D1
    const db = env.DB;
    const result = await db
      .prepare(
        'INSERT INTO enquiries (id, name, company, enquiry, created_at, status) VALUES (?, ?, ?, ?, ?, ?)'
      )
      .bind(id, name, company || null, enquiry, created_at, 'new')
      .run();

    // Send email notification
    if (env.MAILCHANNELS_API_TOKEN) {
      ctx.waitUntil(sendEmailNotification(env, name, company, enquiry, created_at));
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Enquiry received',
        id
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error creating enquiry:', error);
    return new Response(
      JSON.stringify({ success: false, message: 'Internal server error', error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
}

async function handleListEnquiries(request, env, corsHeaders) {
  try {
    // Check authorization
    const auth = request.headers.get('Authorization');
    const token = auth?.replace('Bearer ', '');

    if (token !== env.ADMIN_API_KEY) {
      return new Response(
        JSON.stringify({ success: false, message: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Query database
    const db = env.DB;
    const { results } = await db
      .prepare('SELECT * FROM enquiries ORDER BY created_at DESC LIMIT 100')
      .all();

    return new Response(
      JSON.stringify({
        success: true,
        count: results.length,
        enquiries: results
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error listing enquiries:', error);
    return new Response(
      JSON.stringify({ success: false, message: 'Internal server error', error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
}

async function sendEmailNotification(env, name, company, enquiry, created_at) {
  try {
    const subject = `New enquiry from ${name}`;
    const body = `
Hello Andrew,

You have a new enquiry from the Thryve website.

Name: ${name}
Company: ${company || '(not provided)'}
Received: ${created_at}

Message:
${enquiry}

---
Reply to: (Implement in next phase)
`.trim();

    const response = await fetch('https://api.mailchannels.net/tx/v1/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${env.MAILCHANNELS_API_TOKEN}`
      },
      body: JSON.stringify({
        personalizations: [
          {
            to: [{ email: env.CONTACT_EMAIL }],
            subject: subject
          }
        ],
        from: {
          email: 'noreply@thryvecoaching.io',
          name: 'Thryve Coaching'
        },
        content: [
          {
            type: 'text/plain',
            value: body
          }
        ]
      })
    });

    if (!response.ok) {
      console.error('Email send failed:', await response.text());
    }
  } catch (error) {
    console.error('Error sending email:', error);
  }
}
