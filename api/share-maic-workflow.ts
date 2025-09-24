import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const userAgent = req.headers['user-agent'] || '';
  const isCrawler = /bot|crawler|spider|linkedinbot|facebookexternalhit|twitterbot|whatsapp/i.test(userAgent);
  
  console.log(`Share endpoint - User-Agent: ${userAgent}, isCrawler: ${isCrawler}`);
  
  if (isCrawler) {
    // Serve minimal HTML with clean OG tags for crawlers
    const protocol = req.headers['x-forwarded-proto'] || 'https';
    const host = req.headers.host;
    const baseUrl = `${protocol}://${host}`;
    
    const shareHtml = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8" />
    <meta property="og:title" content="MAIC AI Analysis Ecosystem - Workflow & Reliability Architecture" />
    <meta property="og:description" content="AI-Enhanced Matching-Adjusted Indirect Comparison Platform featuring the CLARA System: Clinical AI Reliability Assessment System" />
    <meta property="og:type" content="article" />
    <meta property="og:url" content="${baseUrl}/api/share-maic-workflow" />
    <meta property="og:image" content="${baseUrl}/maic-workflow-og.jpg?v=1" />
    <meta property="og:image:secure_url" content="${baseUrl}/maic-workflow-og.jpg?v=1" />
    <meta property="og:image:width" content="1200" />
    <meta property="og:image:height" content="627" />
    <meta property="og:image:alt" content="MAIC Analysis Ecosystem - AI-Enhanced Clinical Research Workflow featuring CLARA System by Paul Mattheneus" />
    <meta property="og:site_name" content="Paul Mattheneus" />
    <meta name="description" content="AI-Enhanced Matching-Adjusted Indirect Comparison Platform featuring the CLARA System: Clinical AI Reliability Assessment System" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="MAIC AI Analysis Ecosystem - Workflow & Reliability Architecture" />
    <meta name="twitter:description" content="AI-Enhanced Matching-Adjusted Indirect Comparison Platform featuring the CLARA System: Clinical AI Reliability Assessment System" />
    <meta name="twitter:image" content="${baseUrl}/maic-workflow-og.jpg?v=1" />
    <title>MAIC AI Analysis Ecosystem - Paul Mattheneus</title>
</head>
<body></body>
</html>`;
    
    res.setHeader('Content-Type', 'text/html');
    res.send(shareHtml);
    return;
  }
  
  // Redirect humans to the actual page
  const protocol = req.headers['x-forwarded-proto'] || 'https';
  const host = req.headers.host;
  res.redirect(302, `${protocol}://${host}/maic-workflow`);
}