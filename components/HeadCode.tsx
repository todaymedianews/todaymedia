'use client';

import { useEffect } from 'react';

interface HeadCodeProps {
  code: string | null;
}

/**
 * Optimized component to inject HTML code into the document head
 * Performance optimizations:
 * - Batch DOM queries to reduce reflows
 * - Use Maps for O(1) duplicate checking
 * - Batch DOM appends using document fragments
 * - Execute non-critical scripts with requestIdleCallback
 */
export function HeadCode({ code }: HeadCodeProps) {
  useEffect(() => {
    if (!code || typeof document === 'undefined') return;

    // Use requestIdleCallback for non-blocking execution (fallback to setTimeout)
    const scheduleExecution = (callback: () => void) => {
      if ('requestIdleCallback' in window) {
        requestIdleCallback(callback, { timeout: 2000 });
      } else {
        setTimeout(callback, 0);
      }
    };

    scheduleExecution(() => {
      // Create a temporary container to parse the HTML (single DOM operation)
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = code;

      // Batch query all existing elements once (instead of per-element queries)
      const existingScripts = document.head.querySelectorAll('script');
      const existingMetas = document.head.querySelectorAll('meta');
      const existingLinks = document.head.querySelectorAll('link');
      const existingStyles = document.head.querySelectorAll('style');

      // Build lookup maps for O(1) duplicate checking
      const scriptIds = new Set<string>();
      const scriptSrcs = new Set<string>();
      existingScripts.forEach((script) => {
        const id = script.getAttribute('id');
        const src = script.getAttribute('src');
        if (id) scriptIds.add(id);
        if (src) scriptSrcs.add(src);
      });

      const metaKeys = new Map<string, Element>();
      existingMetas.forEach((meta) => {
        const name = meta.getAttribute('name');
        const property = meta.getAttribute('property');
        const httpEquiv = meta.getAttribute('http-equiv');
        if (name) metaKeys.set(`name:${name}`, meta);
        if (property) metaKeys.set(`property:${property}`, meta);
        if (httpEquiv) metaKeys.set(`http-equiv:${httpEquiv}`, meta);
      });

      const linkKeys = new Set<string>();
      existingLinks.forEach((link) => {
        const href = link.getAttribute('href');
        const rel = link.getAttribute('rel');
        if (href && rel) linkKeys.add(`${href}:${rel}`);
      });

      // Process scripts (critical - execute immediately)
      const scripts = Array.from(tempDiv.querySelectorAll('script'));
      const scriptsToAdd: HTMLScriptElement[] = [];

      scripts.forEach((script) => {
        const scriptId = script.getAttribute('id');
        const scriptSrc = script.getAttribute('src');
        
        // Fast O(1) duplicate check using Set
        if (scriptId && scriptIds.has(scriptId)) return;
        if (scriptSrc && scriptSrcs.has(scriptSrc)) return;

        // Mark as processed to avoid duplicates in same batch
        if (scriptId) scriptIds.add(scriptId);
        if (scriptSrc) scriptSrcs.add(scriptSrc);

        const newScript = document.createElement('script');
        
        // Copy attributes efficiently
        const attrs = script.attributes;
        for (let i = 0; i < attrs.length; i++) {
          const attr = attrs[i];
          if (attr.name === 'async') {
            newScript.async = true;
          } else if (attr.name === 'defer') {
            newScript.defer = true;
          } else if (attr.name === 'crossorigin' || attr.name === 'crossOrigin') {
            newScript.crossOrigin = attr.value || 'anonymous';
          } else {
            newScript.setAttribute(attr.name, attr.value);
          }
        }
        
        // Handle inline scripts
        if (script.innerHTML || script.textContent) {
          newScript.textContent = script.innerHTML || script.textContent || '';
        }
        
        scriptsToAdd.push(newScript);
      });

      // Batch append scripts (scripts must execute in order, so append individually)
      scriptsToAdd.forEach((script) => {
        document.head.appendChild(script);
      });

      // Process meta tags (batch append)
      const metaTags = Array.from(tempDiv.querySelectorAll('meta'));
      const metasToAdd: HTMLMetaElement[] = [];

      metaTags.forEach((meta) => {
        const name = meta.getAttribute('name');
        const property = meta.getAttribute('property');
        const httpEquiv = meta.getAttribute('http-equiv');
        
        let existingMeta: Element | null = null;
        if (name) {
          existingMeta = metaKeys.get(`name:${name}`) || null;
        } else if (property) {
          existingMeta = metaKeys.get(`property:${property}`) || null;
        } else if (httpEquiv) {
          existingMeta = metaKeys.get(`http-equiv:${httpEquiv}`) || null;
        }
        
        if (existingMeta) {
          // Update existing meta tag
          const attrs = meta.attributes;
          for (let i = 0; i < attrs.length; i++) {
            existingMeta.setAttribute(attrs[i].name, attrs[i].value);
          }
          return;
        }

        const newMeta = document.createElement('meta');
        const attrs = meta.attributes;
        for (let i = 0; i < attrs.length; i++) {
          newMeta.setAttribute(attrs[i].name, attrs[i].value);
        }
        metasToAdd.push(newMeta);
      });

      // Batch append meta tags using fragment
      if (metasToAdd.length > 0) {
        const metaFragment = document.createDocumentFragment();
        metasToAdd.forEach((meta) => metaFragment.appendChild(meta));
        document.head.appendChild(metaFragment);
      }

      // Process link tags (batch append)
      const linkTags = Array.from(tempDiv.querySelectorAll('link'));
      const linksToAdd: HTMLLinkElement[] = [];

      linkTags.forEach((link) => {
        const href = link.getAttribute('href');
        const rel = link.getAttribute('rel');
        
        if (href && rel) {
          if (linkKeys.has(`${href}:${rel}`)) return;
          linkKeys.add(`${href}:${rel}`);
        }

        const newLink = document.createElement('link');
        const attrs = link.attributes;
        for (let i = 0; i < attrs.length; i++) {
          newLink.setAttribute(attrs[i].name, attrs[i].value);
        }
        linksToAdd.push(newLink);
      });

      // Batch append link tags using fragment
      if (linksToAdd.length > 0) {
        const linkFragment = document.createDocumentFragment();
        linksToAdd.forEach((link) => linkFragment.appendChild(link));
        document.head.appendChild(linkFragment);
      }

      // Process style tags (batch append)
      const styleTags = Array.from(tempDiv.querySelectorAll('style'));
      const stylesToAdd: HTMLStyleElement[] = [];

      styleTags.forEach((style) => {
        const newStyle = document.createElement('style');
        if (style.innerHTML) {
          newStyle.innerHTML = style.innerHTML;
        } else if (style.textContent) {
          newStyle.textContent = style.textContent;
        }
        stylesToAdd.push(newStyle);
      });

      // Batch append style tags using fragment
      if (stylesToAdd.length > 0) {
        const styleFragment = document.createDocumentFragment();
        stylesToAdd.forEach((style) => styleFragment.appendChild(style));
        document.head.appendChild(styleFragment);
      }
    });
  }, [code]);

  return null;
}

