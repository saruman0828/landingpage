"use client";

import type { ReactNode } from "react";
import { track } from "@vercel/analytics";

type CtaLinkProps = {
  href: string;
  location: string;
  children: ReactNode;
};

export function trackEvent(eventName: string, payload: Record<string, string> = {}) {
  if (typeof window === "undefined") return;

  const sessionId = (() => {
    try {
      const key = "lp_analytics_session_id";
      const existing = window.sessionStorage.getItem(key);
      if (existing) return existing;
      const generated = `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
      window.sessionStorage.setItem(key, generated);
      return generated;
    } catch {
      return "";
    }
  })();

  const analyticsPayload = {
    event: eventName,
    page: "two_days_lp",
    path: window.location.pathname,
    title: document.title,
    referrer: document.referrer || "",
    sessionId,
    ...payload,
  };

  window.dispatchEvent(new CustomEvent(eventName, { detail: payload }));

  const dataLayer = (window as Window & { dataLayer?: unknown[] }).dataLayer;
  if (Array.isArray(dataLayer)) {
    dataLayer.push({ event: eventName, ...payload });
  }

  track(eventName, payload);

  if (navigator.sendBeacon) {
    const body = JSON.stringify(analyticsPayload);
    if (navigator.sendBeacon("/api/analytics", new Blob([body], { type: "application/json" }))) {
      return;
    }
  }

  fetch("/api/analytics", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(analyticsPayload),
    keepalive: true,
  }).catch(() => null);
}

export function CtaLink({ href, location, children }: CtaLinkProps) {
  return (
    <a
      href={href}
      onClick={() => trackEvent("cta_click", { location })}
      className="inline-flex min-h-14 w-full items-center justify-center bg-[#F26A21] px-6 py-4 text-center text-base font-black leading-6 text-white transition hover:bg-[#d95715] focus:outline-none focus:ring-4 focus:ring-[#F26A21]/30 sm:w-auto sm:px-8"
    >
      {children}
    </a>
  );
}
