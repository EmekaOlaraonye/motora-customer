import { useEffect, useMemo } from 'react';
import { metaTags, type PageMeta } from '../utils/meta';

/**
 * Applies page metadata to the live document.
 *
 * This covers browser tab titles, bookmarks, and crawlers that do execute
 * JavaScript (Googlebot does). It does **not** cover WhatsApp, Facebook or
 * LinkedIn, none of which run scripts — those read whatever the server sent,
 * which is why `server/meta-injector.mjs` exists.
 *
 * Tags written here are marked so they can be removed cleanly on navigation
 * without disturbing anything the server already placed.
 */

const MANAGED_ATTR = 'data-page-meta';

/** The site origin, used to build absolute URLs for canonical and og:url. */
export function siteOrigin(): string {
  const configured = import.meta.env.VITE_SITE_URL;
  if (configured) return configured.replace(/\/$/, '');
  if (typeof window !== 'undefined') return window.location.origin;
  return 'https://motora.co.bw';
}

export function usePageMeta(meta: PageMeta | undefined): void {
  // Callers routinely build the object inline, so the effect keys off the
  // content rather than the object identity. These payloads are small.
  const key = meta ? JSON.stringify(meta) : '';

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const stable = useMemo(() => meta, [key]);

  useEffect(() => {
    if (!stable) return;
    const meta = stable;

    const previousTitle = document.title;
    document.title = meta.title;

    const created: Element[] = [];

    /** Replaces a server-rendered tag if present, otherwise adds one. */
    function setTag(attr: 'name' | 'property', key: string, content: string) {
      const existing = document.head.querySelector(`meta[${attr}="${key}"]`);

      if (existing) {
        existing.setAttribute('content', content);
        return;
      }

      const element = document.createElement('meta');
      element.setAttribute(attr, key);
      element.setAttribute('content', content);
      element.setAttribute(MANAGED_ATTR, 'true');
      document.head.appendChild(element);
      created.push(element);
    }

    for (const tag of metaTags(meta)) {
      if (tag.property) setTag('property', tag.property, tag.content);
      else if (tag.name) setTag('name', tag.name, tag.content);
    }

    // Canonical link
    let canonical = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    const previousCanonical = canonical?.href;
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.rel = 'canonical';
      canonical.setAttribute(MANAGED_ATTR, 'true');
      document.head.appendChild(canonical);
      created.push(canonical);
    }
    canonical.href = meta.canonical;

    // Structured data.
    //
    // The server injector may already have written a block for this URL, and
    // on a client-side navigation it would otherwise be left describing the
    // previous page. So the hook owns the slot outright: it reuses whatever is
    // there, and clears it when the new page has nothing to say.
    const script = document.head.querySelector<HTMLScriptElement>(
      'script[type="application/ld+json"]',
    );
    const previousLd = script?.textContent ?? undefined;
    let ownedScript = script;

    if (meta.structuredData) {
      if (!ownedScript) {
        ownedScript = document.createElement('script');
        ownedScript.type = 'application/ld+json';
        ownedScript.setAttribute(MANAGED_ATTR, 'true');
        document.head.appendChild(ownedScript);
        created.push(ownedScript);
      }
      ownedScript.textContent = JSON.stringify(meta.structuredData);
    } else if (ownedScript) {
      ownedScript.textContent = '';
    }

    return () => {
      document.title = previousTitle;
      if (canonical && previousCanonical) canonical.href = previousCanonical;
      if (ownedScript && previousLd !== undefined) ownedScript.textContent = previousLd;
      for (const element of created) element.remove();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stable]);
}
