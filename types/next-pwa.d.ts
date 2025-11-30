declare module "next-pwa" {
  import type { NextConfig } from "next";

  interface RuntimeCacheOptions {
    cacheName?: string;
    expiration?: {
      maxEntries?: number;
      maxAgeSeconds?: number;
    };
  }

  interface RuntimeCacheEntry {
    urlPattern: RegExp | string;
    handler: "NetworkFirst" | "CacheFirst" | "StaleWhileRevalidate" | "NetworkOnly" | "CacheOnly" | string;
    options?: RuntimeCacheOptions;
  }

  interface PWAConfig {
    dest?: string;
    register?: boolean;
    skipWaiting?: boolean;
    disable?: boolean;
    runtimeCaching?: RuntimeCacheEntry[];
    buildExcludes?: string[];
    publicExcludes?: string[];
    fallbacks?: {
      document?: string;
      image?: string;
      audio?: string;
      video?: string;
      font?: string;
    };
  }

  function withPWA(config: PWAConfig): (nextConfig: NextConfig) => NextConfig;
  export default withPWA;
}

