/**
 * Clean and prepare ad banner HTML for rendering
 * Converts AMP HTML to regular HTML while preserving inline styles and CSS
 * 
 * @param adBanner - Raw HTML string from WordPress
 * @returns Cleaned HTML string ready for rendering
 */
export function cleanAdBanner(adBanner: string | null | undefined): string | null {
  if (!adBanner || adBanner.trim() === '') {
    return null;
  }

  try {
    const cleaned = adBanner
      .trim()
      // Preserve line breaks in style tags and scripts
      .replace(/<style([^>]*)>([\s\S]*?)<\/style>/gi, (match) => {
        return match; // Keep style tags as-is
      })
      .replace(/<script([^>]*)>([\s\S]*?)<\/script>/gi, (match) => {
        return match; // Keep script tags as-is
      })
      // Replace line breaks with spaces only outside of style/script tags
      .replace(/\r\n/g, ' ')
      .replace(/\n/g, ' ')
      // Normalize excessive whitespace (but preserve single spaces in inline styles)
      .replace(/\s{2,}/g, ' ')
      // Convert AMP components to regular HTML
      .replace(/<amp-img\s+/gi, '<img ')
      .replace(/<\/amp-img>/gi, '')
      .replace(/<amp-ad\s+/gi, '<div ')
      .replace(/<\/amp-ad>/gi, '</div>')
      // Remove AMP-specific attributes that might break rendering
      .replace(/\s+layout=["'][^"']*["']/gi, '')
      .replace(/\s+heights=["'][^"']*["']/gi, '')
      .replace(/\s+data-amp[^=]*=["'][^"']*["']/gi, '')
      // Preserve style attributes (inline CSS)
      // No changes needed - style attributes are already preserved
      // Fix img tags - ensure they're properly closed
      .replace(/<img([^>]*?)(?:\s*\/)?>/gi, (match, attrs) => {
        // Remove any remaining AMP attributes
        let cleanAttrs = attrs
          .replace(/\s+layout=["'][^"']*["']/gi, '')
          .trim();
        
        // Ensure self-closing
        return `<img${cleanAttrs ? ' ' + cleanAttrs : ''} />`;
      })
      // Ensure proper closing of self-closing tags
      .replace(/<(br|hr|input|meta|link)([^>]*?)(?:\s*\/)?>/gi, '<$1$2 />')
      .trim();

    return cleaned;
  } catch (error) {
    console.error('Error cleaning ad banner:', error);
    return null;
  }
}

