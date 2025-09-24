import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const userAgent = req.headers['user-agent'] || '';
  const isCrawler = /bot|crawler|spider|linkedinbot|facebookexternalhit|twitterbot|whatsapp/i.test(userAgent);
  
  console.log(`Share endpoint - User-Agent: ${userAgent}, isCrawler: ${isCrawler}`);
  
  if (isCrawler) {
    // Serve minimal HTML with clean OG tags for crawlers
    const protocol = req.headers['x-forwarded-proto'] || 'https';
    const host = req.headers.host;
    
    const shareHtml = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8" />
    <meta property="og:title" content="MAIC AI Analysis Ecosystem - Workflow & Reliability Architecture" />
    <meta property="og:description" content="What does a complete MAIC AI ecosystem look like? Click ↑ to explore the full architecture blueprint" />
    <meta property="og:type" content="article" />
    <meta property="og:url" content="https://www.mattheneus.com/api/share-maic-workflow" />
    <meta property="og:image" content="https://www.mattheneus.com/maic-workflow-screenshot.png?v=3" />
    <meta property="og:image:width" content="1200" />
    <meta property="og:image:height" content="627" />
    <meta property="og:image:alt" content="MAIC Analysis Ecosystem - AI-Enhanced Clinical Research Workflow featuring CLARA System by Paul Mattheneus" />
    <meta property="og:site_name" content="Paul Mattheneus" />
    <meta name="description" content="What does a complete MAIC AI ecosystem look like? Click ↑ to explore the full architecture blueprint" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="MAIC AI Analysis Ecosystem - Workflow & Reliability Architecture" />
    <meta name="twitter:description" content="What does a complete MAIC AI ecosystem look like? Click ↑ to explore the full architecture blueprint" />
    <meta name="twitter:image" content="https://www.mattheneus.com/maic-workflow-screenshot.png?v=3" />
    <title>MAIC AI Analysis Ecosystem - Paul Mattheneus</title>
</head>
<body></body>
</html>`;
    
    res.setHeader('Content-Type', 'text/html');
    res.send(shareHtml);
    return;
  }
  
  // Redirect humans to the actual page
  res.redirect(302, 'https://www.mattheneus.com/maic-workflow');
}