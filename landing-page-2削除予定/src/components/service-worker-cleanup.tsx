"use client";

import { useEffect } from "react";

export function ServiceWorkerCleanup() {
  useEffect(() => {
    let cancelled = false;

    async function cleanup() {
      const deletions: Promise<unknown>[] = [];

      if ("serviceWorker" in navigator) {
        const registrations = await navigator.serviceWorker.getRegistrations();
        deletions.push(...registrations.map((registration) => registration.unregister()));
      }

      if ("caches" in window) {
        const cacheNames = await caches.keys();
        deletions.push(...cacheNames.map((cacheName) => caches.delete(cacheName)));
      }

      await Promise.allSettled(deletions);

      if (!cancelled && window.location.search.includes("swfix=1")) {
        window.location.replace("/");
      }
    }

    cleanup().catch(() => null);

    return () => {
      cancelled = true;
    };
  }, []);

  return null;
}
