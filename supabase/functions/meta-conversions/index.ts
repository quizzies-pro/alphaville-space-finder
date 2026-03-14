import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// SHA-256 hash helper
async function sha256(value: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(value.trim().toLowerCase());
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

// Normalize phone to E.164 (Brazil)
function normalizePhone(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  if (digits.startsWith("55")) return `+${digits}`;
  return `+55${digits}`;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const PIXEL_ID = Deno.env.get("META_PIXEL_ID");
    if (!PIXEL_ID) throw new Error("META_PIXEL_ID not configured");

    const ACCESS_TOKEN = Deno.env.get("META_CONVERSIONS_API_TOKEN");
    if (!ACCESS_TOKEN) throw new Error("META_CONVERSIONS_API_TOKEN not configured");

    const body = await req.json();
    const {
      event_name,
      event_id,
      event_time,
      event_source_url,
      action_source,
      user_agent,
      fbp,
      fbc,
      user_data = {},
      custom_data = {},
    } = body;

    // Build hashed user data for Advanced Matching
    const hashedUserData: Record<string, unknown> = {};

    if (user_data.email) {
      hashedUserData.em = [await sha256(user_data.email)];
    }
    if (user_data.phone) {
      hashedUserData.ph = [await sha256(normalizePhone(user_data.phone))];
    }
    if (user_data.firstName) {
      hashedUserData.fn = [await sha256(user_data.firstName)];
    }
    if (user_data.lastName) {
      hashedUserData.ln = [await sha256(user_data.lastName)];
    }
    if (user_data.city) {
      hashedUserData.ct = [await sha256(user_data.city)];
    }
    if (user_data.state) {
      hashedUserData.st = [await sha256(user_data.state)];
    }
    if (user_data.country) {
      hashedUserData.country = [await sha256(user_data.country)];
    }

    // Add browser identifiers
    if (fbp) hashedUserData.fbp = fbp;
    if (fbc) hashedUserData.fbc = fbc;
    if (user_agent) hashedUserData.client_user_agent = user_agent;

    // Get client IP from request headers
    const clientIp =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      req.headers.get("x-real-ip") ||
      "";
    if (clientIp) hashedUserData.client_ip_address = clientIp;

    // Build event payload
    const eventPayload = {
      data: [
        {
          event_name,
          event_time: event_time || Math.floor(Date.now() / 1000),
          event_id,
          event_source_url,
          action_source: action_source || "website",
          user_data: hashedUserData,
          custom_data,
        },
      ],
      // Test event code - remove in production
      // test_event_code: "TEST12345",
    };

    console.log(`[Meta CAPI] Sending ${event_name}`, {
      event_id,
      has_email: !!user_data.email,
      has_phone: !!user_data.phone,
      has_fbp: !!fbp,
      has_fbc: !!fbc,
      has_ip: !!clientIp,
    });

    // Send to Meta Conversions API
    const metaUrl = `https://graph.facebook.com/v21.0/${PIXEL_ID}/events?access_token=${ACCESS_TOKEN}`;

    const metaResponse = await fetch(metaUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(eventPayload),
    });

    const metaResult = await metaResponse.json();

    if (!metaResponse.ok) {
      console.error("[Meta CAPI] API Error:", JSON.stringify(metaResult));
      return new Response(
        JSON.stringify({ success: false, error: metaResult }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("[Meta CAPI] Success:", JSON.stringify(metaResult));

    return new Response(
      JSON.stringify({ success: true, result: metaResult }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("[Meta CAPI] Error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
