"use client";

import { useEffect, useState } from "react";

export function DynamicFavicon() {
  const [faviconUrl, setFaviconUrl] = useState<string | null>(null);

  useEffect(() => {
    const fetchFavicon = async () => {
      try {
        const response = await fetch("/api/public/settings");
        if (response.ok) {
          const data = await response.json();
          if (data.settings?.site?.faviconUrl) {
            setFaviconUrl(data.settings.site.faviconUrl);
          }
        }
      } catch (error) {
        console.error("Error fetching favicon:", error);
      }
    };

    fetchFavicon();
  }, []);

  useEffect(() => {
    if (faviconUrl) {
      // Remove existing favicon links
      const existingLinks = document.querySelectorAll('link[rel="icon"], link[rel="shortcut icon"], link[rel="apple-touch-icon"]');
      existingLinks.forEach(link => link.remove());

      // Add new favicon
      const link = document.createElement('link');
      link.rel = 'icon';
      link.href = faviconUrl;
      link.type = 'image/x-icon';
      document.head.appendChild(link);

      // Also add shortcut icon for older browsers
      const shortcutLink = document.createElement('link');
      shortcutLink.rel = 'shortcut icon';
      shortcutLink.href = faviconUrl;
      shortcutLink.type = 'image/x-icon';
      document.head.appendChild(shortcutLink);
    }
  }, [faviconUrl]);

  return null; // This component doesn't render anything
}
