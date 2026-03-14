/**
 * Meta Pixel + Conversions API (CAPI) Dual Tracking
 * 
 * Advanced tracking with:
 * - Browser-side Pixel events
 * - Server-side CAPI events via edge function
 * - Event deduplication via shared event_id
 * - User data hashing (SHA-256) for Advanced Matching
 * - Custom parameters per event
 * - Automatic fbp/fbc cookie capture
 */

import { supabase } from "@/integrations/supabase/client";

// ---- Types ----

interface UserData {
  email?: string;
  phone?: string;
  firstName?: string;
  lastName?: string;
  city?: string;
  state?: string;
  country?: string;
}

interface CustomData {
  value?: number;
  currency?: string;
  content_name?: string;
  content_category?: string;
  contents?: Array<{ id: string; quantity: number }>;
  [key: string]: unknown;
}

interface TrackEventOptions {
  eventName: string;
  userData?: UserData;
  customData?: CustomData;
  eventId?: string;
  sourceUrl?: string;
}

// ---- Pixel ID (loaded from env at build time) ----

const PIXEL_ID = import.meta.env.VITE_META_PIXEL_ID || "";

// ---- Helpers ----

let pixelInitialized = false;

function generateEventId(): string {
  return `${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
}

function getCookie(name: string): string | null {
  const match = document.cookie.match(new RegExp(`(^| )${name}=([^;]+)`));
  return match ? decodeURIComponent(match[2]) : null;
}

function getFbp(): string | null {
  return getCookie("_fbp");
}

function getFbc(): string | null {
  // First check cookie
  const fbc = getCookie("_fbc");
  if (fbc) return fbc;
  
  // Fallback: construct from fbclid URL param
  const urlParams = new URLSearchParams(window.location.search);
  const fbclid = urlParams.get("fbclid");
  if (fbclid) {
    const timestamp = Math.floor(Date.now() / 1000);
    return `fb.1.${timestamp}.${fbclid}`;
  }
  return null;
}

function getPageUrl(): string {
  return window.location.href;
}

function getUserAgent(): string {
  return navigator.userAgent;
}

// ---- Pixel (Browser-side) ----

export function initPixel(): void {
  if (pixelInitialized || !PIXEL_ID) return;
  
  const fbq = (window as any).fbq;
  if (!fbq) {
    console.warn("[Meta Tracking] fbq not loaded yet");
    return;
  }
  
  fbq("init", PIXEL_ID);
  pixelInitialized = true;
  console.log("[Meta Tracking] Pixel initialized:", PIXEL_ID);
}

function firePixelEvent(
  eventName: string,
  eventId: string,
  params?: Record<string, unknown>
): void {
  const fbq = (window as any).fbq;
  if (!fbq || !PIXEL_ID) return;

  // Standard events that Meta recognizes
  const standardEvents = [
    "PageView", "Lead", "CompleteRegistration", "Contact",
    "ViewContent", "Search", "AddToCart", "Purchase",
    "InitiateCheckout", "AddPaymentInfo", "Subscribe",
  ];

  const eventParams = { ...params, eventID: eventId };

  if (standardEvents.includes(eventName)) {
    fbq("track", eventName, eventParams, { eventID: eventId });
  } else {
    fbq("trackCustom", eventName, eventParams, { eventID: eventId });
  }
  
  console.log(`[Meta Pixel] ${eventName}`, { eventId, params });
}

// ---- CAPI (Server-side via Edge Function) ----

async function fireCAPIEvent(options: TrackEventOptions): Promise<void> {
  const { eventName, userData, customData, eventId, sourceUrl } = options;
  
  try {
    const payload = {
      event_name: eventName,
      event_id: eventId,
      event_time: Math.floor(Date.now() / 1000),
      event_source_url: sourceUrl || getPageUrl(),
      action_source: "website",
      user_agent: getUserAgent(),
      fbp: getFbp(),
      fbc: getFbc(),
      user_data: userData || {},
      custom_data: customData || {},
    };

    const { error } = await supabase.functions.invoke("meta-conversions", {
      body: payload,
    });

    if (error) {
      console.error("[Meta CAPI] Error:", error);
    } else {
      console.log(`[Meta CAPI] ${eventName} sent`, { eventId });
    }
  } catch (err) {
    console.error("[Meta CAPI] Failed:", err);
  }
}

// ---- Main Track Function (Dual) ----

export function trackEvent(options: TrackEventOptions): void {
  const eventId = options.eventId || generateEventId();
  const optionsWithId = { ...options, eventId };

  // 1. Browser Pixel
  firePixelEvent(options.eventName, eventId, options.customData as Record<string, unknown>);

  // 2. Server CAPI (async, non-blocking)
  fireCAPIEvent(optionsWithId);
}

// ---- Convenience Functions ----

export function trackPageView(): void {
  trackEvent({ eventName: "PageView" });
}

export function trackLead(userData?: UserData): void {
  trackEvent({
    eventName: "Lead",
    userData,
    customData: {
      content_name: "Quiz Alphaville",
      content_category: "Locação Comercial",
    },
  });
}

export function trackQuizStep(
  step: number,
  stepName: string,
  answer: string,
  userData?: UserData
): void {
  trackEvent({
    eventName: `QuizStep${step}`,
    userData,
    customData: {
      content_name: stepName,
      content_category: "Quiz Alphaville",
      quiz_step: step,
      quiz_answer: answer,
    } as CustomData,
  });
}

export function trackCompleteRegistration(userData: UserData): void {
  trackEvent({
    eventName: "CompleteRegistration",
    userData,
    customData: {
      content_name: "Quiz Alphaville Completo",
      content_category: "Locação Comercial",
      value: 30000,
      currency: "BRL",
    },
  });
}

export function trackContact(userData: UserData): void {
  trackEvent({
    eventName: "Contact",
    userData,
    customData: {
      content_name: "WhatsApp Click",
      content_category: "Locação Comercial",
      value: 30000,
      currency: "BRL",
    },
  });
}

export function trackViewContent(contentName: string): void {
  trackEvent({
    eventName: "ViewContent",
    customData: {
      content_name: contentName,
      content_category: "Locação Comercial",
    },
  });
}
