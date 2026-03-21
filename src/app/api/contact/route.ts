import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: NextRequest) {
  try {
    const { sujet, message, expediteur } = await request.json();

    if (!message?.trim()) {
      return NextResponse.json({ error: "Message vide" }, { status: 400 });
    }

    const now = new Date().toLocaleString("fr-FR", {
      timeZone: "Europe/Paris",
      day: "2-digit", month: "long", year: "numeric",
      hour: "2-digit", minute: "2-digit",
    });

    const { error } = await resend.emails.send({
      from: "Prodige RH Connect <noreply@prodige-rh.fr>",
      to: ["houllegatte.arnaud@gmail.com"],
      subject: sujet?.trim() || "Message support – Prodige RH Connect",
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 560px; margin: 0 auto; background: #f9f9f9; border-radius: 12px; overflow: hidden;">
          <div style="background: linear-gradient(135deg, #081F34 0%, #0d2a45 100%); padding: 28px 32px;">
            <div style="display: flex; align-items: center; gap: 12px;">
              <div style="background: #B5E467; width: 8px; height: 8px; border-radius: 50%;"></div>
              <span style="color: #B5E467; font-size: 11px; font-weight: 600; letter-spacing: 0.15em; text-transform: uppercase;">Prodige RH Connect · Support</span>
            </div>
            <h1 style="color: white; margin: 12px 0 0; font-size: 20px; font-weight: 700;">${sujet?.trim() || "Nouveau message"}</h1>
          </div>
          <div style="padding: 28px 32px; background: white;">
            <p style="color: #64748b; font-size: 12px; margin: 0 0 20px; border-left: 3px solid #B5E467; padding-left: 10px;">
              ${expediteur ? `De : <strong>${expediteur}</strong> · ` : ""}Reçu le ${now}
            </p>
            <div style="background: #f8fafc; border-radius: 8px; padding: 20px; border: 1px solid #e2e8f0;">
              <p style="color: #1e293b; font-size: 14px; line-height: 1.7; margin: 0; white-space: pre-wrap;">${message.trim()}</p>
            </div>
          </div>
          <div style="padding: 16px 32px; background: #f1f5f9; text-align: center;">
            <p style="color: #94a3b8; font-size: 11px; margin: 0;">Prodige RH Connect · houllegatte.arnaud@gmail.com</p>
          </div>
        </div>
      `,
    });

    if (error) {
      console.error("Resend error:", error);
      return NextResponse.json({ error: "Échec de l'envoi" }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Contact API error:", err);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
