import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

/**
 * Cleanly formats a candidate's name to Title Case and removes extra whitespace
 */
function formatCandidateName(name?: string): string {
  if (!name || !name.trim()) return "Valued Candidate";
  const trimmed = name.trim().replace(/\s+/g, " ");
  
  // If the input is entirely UPPERCASE or lowercase, convert each word to Title Case
  const isAllCaps = trimmed === trimmed.toUpperCase() && /[A-Za-z]/.test(trimmed);
  const isAllLower = trimmed === trimmed.toLowerCase();

  if (isAllCaps || isAllLower) {
    return trimmed
      .toLowerCase()
      .split(" ")
      .map((word) => {
        if (word.startsWith("dr.") || word === "dr") return "Dr.";
        if (word.startsWith("mr.") || word === "mr") return "Mr.";
        if (word.startsWith("mrs.") || word === "mrs") return "Mrs.";
        if (word.startsWith("ms.") || word === "ms") return "Ms.";
        return word.charAt(0).toUpperCase() + word.slice(1);
      })
      .join(" ");
  }

  return trimmed;
}

serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const payload = await req.json();
    const { 
      email, 
      full_name, 
      profile_id, 
      type = "profile_completed",
      sender_name,
      receiver_name
    } = payload;

    const recipientEmail = (email || "").trim();
    if (!recipientEmail) {
      return new Response(
        JSON.stringify({ error: "Missing required field: email" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const candidateName = formatCandidateName(full_name || receiver_name);
    const senderFormattedName = formatCandidateName(sender_name);
    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

    let subject = `🎉 Congratulations ${candidateName}! Your Profile is Active on Vadhu Var`;
    let heading = `वधू - वर / Vadhu Var Matrimony`;
    let contentHtml = `
      <p style="font-size: 16px; color: #1e293b; line-height: 1.6; margin-bottom: 12px;">
        Namaste <strong>${candidateName}</strong>,
      </p>
      <p style="font-size: 14px; color: #475569; line-height: 1.6; margin-bottom: 16px;">
        Congratulations! Your matrimony candidate profile has been successfully registered and published on Vadhu Var.
      </p>
      <div style="background-color: #f0f9ff; border: 1px solid #bae6fd; border-radius: 8px; padding: 18px; margin: 20px 0;">
        <h3 style="color: #0369a1; margin-top: 0; font-size: 15px; margin-bottom: 10px;">What Happens Next:</h3>
        <ul style="margin: 0; padding-left: 20px; color: #334155; font-size: 13px; line-height: 1.6;">
          <li style="margin-bottom: 6px;">Our verification team reviews your attached Government ID document to assign your official verified trust badge.</li>
          <li style="margin-bottom: 6px;">Your profile is now discoverable to verified candidates matching your partner preferences.</li>
          <li>You can start browsing profiles and express proposal interests with 100-point compatibility matching.</li>
        </ul>
      </div>
      <p style="text-align: center; margin: 32px 0 20px 0;">
        <a href="https://vadhu-var.vercel.app/#browse" style="background-color: #0284c7; color: #ffffff; text-decoration: none; padding: 12px 32px; border-radius: 6px; font-weight: bold; font-size: 14px; display: inline-block;">
          Discover Matching Profiles →
        </a>
      </p>
    `;

    if (type === "interest_received" && sender_name) {
      subject = `💌 ${candidateName}, you received a new proposal interest from ${senderFormattedName}`;
      contentHtml = `
        <p style="font-size: 16px; color: #1e293b; line-height: 1.6; margin-bottom: 12px;">
          Namaste <strong>${candidateName}</strong>,
        </p>
        <p style="font-size: 14px; color: #475569; line-height: 1.6; margin-bottom: 16px;">
          Great news! <strong>${senderFormattedName}</strong> has viewed your profile on Vadhu Var and expressed interest in connecting for marriage.
        </p>
        <p style="text-align: center; margin: 28px 0;">
          <a href="https://vadhu-var.vercel.app/#interests" style="background-color: #0284c7; color: #ffffff; text-decoration: none; padding: 12px 28px; border-radius: 6px; font-weight: bold; font-size: 14px; display: inline-block;">
            View Proposal & Respond →
          </a>
        </p>
      `;
    }

    if (RESEND_API_KEY) {
      // Send email via Resend API
      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${RESEND_API_KEY}`,
        },
        body: JSON.stringify({
          from: Deno.env.get("RESEND_FROM_EMAIL") || "Vadhu Var Matrimony <onboarding@resend.dev>",
          to: [recipientEmail],
          subject: subject,
          html: `
            <div style="font-family: Arial, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 28px 24px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #ffffff;">
              <h1 style="color: #0284c7; font-size: 22px; margin-bottom: 16px; border-bottom: 2px solid #f1f5f9; padding-bottom: 12px;">
                ${heading}
              </h1>
              ${contentHtml}
              <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 28px 0 16px 0;" />
              <p style="font-size: 11px; color: #94a3b8; text-align: center; line-height: 1.5; margin: 0;">
                Vadhu Var Matrimony • Maharashtra & All India Verified Profiles<br />
                This automated notification was securely sent to ${recipientEmail}.
              </p>
            </div>
          `,
        }),
      });

      const resData = await res.json();
      return new Response(
        JSON.stringify({ success: true, message: "Email sent successfully via Resend", data: resData }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Default response if Resend API key is not configured
    return new Response(
      JSON.stringify({
        success: true,
        message: "Email event logged (configure RESEND_API_KEY in Supabase secrets)",
        data: { email: recipientEmail, candidateName, profile_id },
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
