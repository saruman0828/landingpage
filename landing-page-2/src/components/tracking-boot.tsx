"use client";

import { useEffect } from "react";
import { trackEvent } from "./cta-link";

export function TrackingBoot() {
  useEffect(() => {
    trackEvent("page_view");

    const params = new URLSearchParams(window.location.search);
    if (params.get("booked") === "1") {
      trackEvent("calendar_booked", { source: "return_url" });
    }
  }, []);

  return null;
}
