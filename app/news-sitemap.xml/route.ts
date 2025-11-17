import { NextResponse } from 'next/server';
import { siteConfig } from '@/lib/metadata';
import { fetchLatestPostsForNewsSitemap } from '@/lib/api/sitemap';

// Revalidate news sitemap every 30 minutes
export const revalidate = 1800;

/**
 * Format date to W3C format (ISO 8601) for news sitemap
 */
function formatDate(dateString: string): string {
  try {
    return new Date(dateString).toISOString();
  } catch {
    return new Date().toISOString();
  }
}

/**
 * Escape XML special characters
 */
function escapeXml(unsafe: string): string {
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

/**
 * Generate Google News Sitemap XML
 */
function generateNewsSitemapXml(posts: Array<{
  databaseId: number;
  title: string;
  slug: string;
  date: string;
  categories: {
    nodes: Array<{
      slug: string;
    }>;
  };
}>): string {
  const siteUrl = siteConfig.url;
  const siteName = siteConfig.name;
  
  const urlEntries = posts
    .map((post) => {
      const categorySlug = post.categories?.nodes?.[0]?.slug || 'general';
      const url = `${siteUrl}/${categorySlug}/${post.databaseId}`;
      const publicationDate = formatDate(post.date);
      const title = escapeXml(post.title);

      return `  <url>
    <loc>${escapeXml(url)}</loc>
    <news:news>
      <news:publication>
        <news:name>${escapeXml(siteName)}</news:name>
        <news:language>ar</news:language>
      </news:publication>
      <news:publication_date>${publicationDate}</news:publication_date>
      <news:title>${title}</news:title>
    </news:news>
  </url>`;
    })
    .join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:news="http://www.google.com/schemas/sitemap-news/0.9">
${urlEntries}
</urlset>`;
}

export async function GET() {
  try {
    // Fetch latest posts from the last 2 days
    const posts = await fetchLatestPostsForNewsSitemap();

    // Generate XML
    const newsSitemapXml = generateNewsSitemapXml(posts);

    return new NextResponse(newsSitemapXml, {
      status: 200,
      headers: {
        'Content-Type': 'application/xml',
        'Cache-Control': 'public, s-maxage=1800, stale-while-revalidate=3600',
      },
    });
  } catch (error) {
    console.error('Error generating news sitemap:', error);
    
    // Return minimal sitemap on error
    const minimalSitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:news="http://www.google.com/schemas/sitemap-news/0.9">
</urlset>`;

    return new NextResponse(minimalSitemap, {
      status: 200,
      headers: {
        'Content-Type': 'application/xml',
      },
    });
  }
}

