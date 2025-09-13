// Configure for Edge Runtime (required for vercel-email)
export const runtime = 'edge';

import Email from 'vercel-email';

// Interface for contact form data
interface ContactFormData {
  name: string;
  company: string;
  email: string;
  challenge: string;
}

export default async function handler(req: Request) {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { 
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      }
    });
  }

  // Only allow POST requests
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  try {
    // Parse and validate request body
    const { name, company, email, challenge }: ContactFormData = await req.json();

    if (!name || !company || !email || !challenge) {
      return new Response(JSON.stringify({ 
        error: 'Missing required fields',
        required: ['name', 'company', 'email', 'challenge']
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Send email using vercel-email (completely free via Cloudflare)
    await Email.send({
      to: 'paul@mattheneus.com', // Your forwarding email
      from: 'noreply@replit.app', // Use replit domain as sender
      replyTo: email, // User's email for easy reply
      subject: `Portfolio Contact: ${name} from ${company}`,
      text: `
New contact form submission from your portfolio:

Name: ${name}
Company: ${company}
Email: ${email}

Message:
${challenge}

---
Sent from Paul Mattheneus Portfolio
Reply directly to this email to respond to ${name}
      `,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2563eb;">New Portfolio Contact</h2>
          
          <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p><strong>Name:</strong> ${name}</p>
            <p><strong>Company:</strong> ${company}</p>
            <p><strong>Email:</strong> <a href="mailto:${email}">${email}</a></p>
          </div>
          
          <div style="margin: 20px 0;">
            <h3 style="color: #374151;">Message:</h3>
            <p style="background: #ffffff; padding: 15px; border-left: 4px solid #2563eb; white-space: pre-wrap;">${challenge}</p>
          </div>
          
          <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;">
          <p style="color: #6b7280; font-size: 14px;">
            Sent from <strong>Paul Mattheneus Portfolio</strong><br>
            Reply directly to this email to respond to ${name}
          </p>
        </div>
      `
    });

    // Log successful submission (for debugging)
    console.log(`Contact form submitted by ${name} (${email}) from ${company}`);

    // Return success response
    return new Response(JSON.stringify({ 
      success: true, 
      message: 'Email sent successfully via Cloudflare',
      timestamp: new Date().toISOString()
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Contact form error:', error);
    
    // Return error response
    return new Response(JSON.stringify({ 
      success: false,
      error: 'Failed to send email',
      details: error instanceof Error ? error.message : 'Unknown error'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}