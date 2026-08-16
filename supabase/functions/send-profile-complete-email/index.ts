import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { email, full_name, profile_id } = await req.json();

    if (!email) {
      return new Response(
        JSON.stringify({ error: "Missing required field: email" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const candidateName = full_name || "Valued Candidate";
    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

    if (RESEND_API_KEY) {
      // Send email via Resend API
      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${RESEND_API_KEY}`,
        },
        body: JSON.stringify({
          from: "Vadhu Var Matrimony <notifications@vadhu-var.vercel.app>",
          to: [email],
          subject: `🎉 Congratulations ${candidateName}! Your Profile is Active on Vadhu Var`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #ffffff;">
              <h1 style="color: #0284c7; font-size: 24px; margin-bottom: 12px;">वधू - वर / Vadhu Var Matrimony</h1>
              <p style="font-size: 16px; color: #1e293b; line-height: 1.6;">
                Namaste <strong>${candidateName}</strong>,
              </p>
              <p style="font-size: 14px; color: #475569; line-height: 1.6;">
                Congratulations! Your matrimony candidate profile has been successfully created and submitted on Vadhu Var.
              </p>
              <div style="background-color: #f0f9ff; border: 1px solid #bae6fd; border-radius: 8px; padding: 16px; margin: 20px 0;">
                <h3 style="color: #0369a1; margin-top: 0; font-size: 15px;">Next Steps:</h3>
                <ul style="margin: 0; padding-left: 20px; color: #334155; font-size: 13px; line-height: 1.6;">
                  <li>Our verification team will review your attached Government ID document to assign your green trust badge.</li>
                  <li>You can now browse verified bride and groom profiles tailored to your partner preferences.</li>
                  <li>Send and receive expressions of interest with 100-point match compatibility scores.</li>
                </ul>
              </div>
              <p style="text-align: center; margin: 28px 0;">
                <a href="https://vadhu-var.vercel.app" style="background-color: #0284c7; color: #ffffff; text-decoration: none; padding: 12px 28px; border-radius: 6px; font-weight: bold; font-size: 14px; display: inline-block;">
                  Discover Matching Profiles →
                </a>
              </p>
              <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 24px 0;" />
              <p style="font-size: 11px; color: #94a3b8; text-align: center;">
                Vadhu Var Matrimony • Maharashtra & All India Verified Profiles<br />
                This is an automated notification sent to ${email}.
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
        message: "Profile completion event recorded (configure RESEND_API_KEY in Supabase secrets to send outgoing emails)",
        data: { email, candidateName, profile_id },
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
