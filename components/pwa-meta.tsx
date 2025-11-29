"use client";

import { useEffect } from "react";

export function PWAMeta() {
  useEffect(() => {
    // Add iOS-specific meta tags that aren't fully supported in Next.js metadata API
    const addMetaTag = (name: string, content: string) => {
      if (!document.querySelector(`meta[name="${name}"]`)) {
        const meta = document.createElement("meta");
        meta.name = name;
        meta.content = content;
        document.head.appendChild(meta);
      }
    };

    const addLinkTag = (rel: string, href: string) => {
      if (!document.querySelector(`link[rel="${rel}"]`)) {
        const link = document.createElement("link");
        link.rel = rel;
        link.href = href;
        document.head.appendChild(link);
      }
    };

    // iOS-specific meta tags
    addMetaTag("apple-mobile-web-app-capable", "yes");
    addMetaTag("apple-mobile-web-app-status-bar-style", "black-translucent");
    addMetaTag("apple-mobile-web-app-title", "FinMate");
    addMetaTag("mobile-web-app-capable", "yes");
    addMetaTag("msapplication-TileColor", "#8b5cf6");
    addMetaTag("msapplication-tap-highlight", "no");

    // Ensure manifest link exists
    addLinkTag("manifest", "/manifest.json");
    addLinkTag("apple-touch-icon", "/apple-touch-icon.png");
  }, []);

  return null;
}

