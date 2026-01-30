// Cloudflare Pages Function to handle SPA routing
export async function onRequest(context: any) {
  const url = new URL(context.request.url);
  const pathname = url.pathname;

  // Check if this is a detail page request (e.g., /classes/123)
  const pathParts = pathname.split('/').filter(Boolean);
  
  if (pathParts.length === 2) {
    const [section, id] = pathParts;
    const validSections = ['classes', 'students', 'volunteers', 'activity-log', 'tags'];
    
    if (validSections.includes(section) && id !== 'new') {
      // Rewrite to the section page, preserving the URL
      const sectionUrl = new URL(`/${section}`, url.origin);
      const response = await context.env.ASSETS.fetch(sectionUrl);
      
      // Return the section page HTML but keep the original URL
      return new Response(response.body, {
        status: 200,
        headers: response.headers
      });
    }
  }

  // For all other requests, continue normally
  return context.next();
}
