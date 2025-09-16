// Use Node.js runtime for SendGrid compatibility
import { Resend } from 'resend';
import type { VercelRequest, VercelResponse } from '@vercel/node';

// Interface for contact form data
interface ContactFormData {
  name: string;
  company: string;
  email: string;
  challenge: string;
}

// Rate limiting (simple in-memory for serverless)
const requests = new Map<string, number[]>();
const MAX_REQUESTS = 3;
const WINDOW_MS = 15 * 60 * 1000; // 15 minutes

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const userRequests = requests.get(ip) || [];
  
  // Clean old requests
  const recentRequests = userRequests.filter(time => now - time < WINDOW_MS);
  
  if (recentRequests.length >= MAX_REQUESTS) {
    return true;
  }
  
  recentRequests.push(now);
  requests.set(ip, recentRequests);
  return false;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Handle CORS with restricted origins
  const allowedOrigins = [
    'https://www.mattheneus.com',
    'https://mattheneus.com', 
    'https://paul-mattheneus-portfolio.vercel.app',
    'https://folio-site-pro-git-main-paul-mattheneus-projects.vercel.app',
    'http://localhost:5000' // For development
  ];
  
  const origin = req.headers.origin || req.headers.referer;
  const isAllowedOrigin = allowedOrigins.some(allowed => 
    origin?.startsWith(allowed)
  );
  
  // Set CORS headers
  if (isAllowedOrigin && origin) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Rate limiting
  const ip = req.headers['x-forwarded-for'] || req.connection?.remoteAddress || 'unknown';
  if (isRateLimited(ip as string)) {
    return res.status(429).json({ 
      error: 'Too many requests. Please try again later.' 
    });
  }

  try {
    // Parse and validate request body
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
    const { name, company, email, challenge }: ContactFormData = body;

    if (!name || !company || !email || !challenge) {
      return res.status(400).json({ 
        error: 'Missing required fields',
        required: ['name', 'company', 'email', 'challenge']
      });
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ 
        error: 'Invalid email address' 
      });
    }

    // Initialize Resend (production-ready)
    const apiKey = process.env.RESEND_API_KEY;
    const toEmail = process.env.TO_EMAIL || 'paul@mattheneus.com';
    
    if (!apiKey) {
      console.error('Resend API key not configured');
      return res.status(500).json({ 
        error: 'Email service not configured' 
      });
    }

    const resend = new Resend(apiKey);

    // Send email using Resend
    await resend.emails.send({
      to: toEmail,
      from: process.env.FROM_EMAIL || toEmail, // Must be verified sender
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
    return res.status(200).json({ 
      success: true, 
      message: 'Email sent successfully via Resend',
      timestamp: new Date().toISOString()
    });

  } catch (error: any) {
    console.error('Contact form error:', error?.response?.body || error.message);
    
    // Return error response
    return res.status(500).json({ 
      success: false,
      error: 'Failed to send email',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}