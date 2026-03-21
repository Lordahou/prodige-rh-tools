import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { requireAuth } from "@/lib/auth-api";

const resend = new Resend(process.env.RESEND_API_KEY);

// Correspondance email → prénom affiché
const USERS: Record<string, string> = {
  "delphine@prodige-rh.fr":  "Delphine Pilorge",
  "clemence@prodige-rh.fr":  "Clémence Retière",
  "marie-laure@prodige-rh.fr": "Marie-Laure",
};

function getPrenom(email: string): string {
  return USERS[email.toLowerCase()] ?? email;
}

export async function POST(request: NextRequest) {
  const auth = await requireAuth(request);
  if (auth instanceof NextResponse) return auth;

  try {
    const { sujet, message } = await request.json();

    if (!message?.trim()) {
      return NextResponse.json({ error: "Message vide" }, { status: 400 });
    }

    const expediteur = getPrenom(auth.email);
    const now = new Date().toLocaleString("fr-FR", {
      timeZone: "Europe/Paris",
      day: "2-digit", month: "long", year: "numeric",
      hour: "2-digit", minute: "2-digit",
    });

    const { error } = await resend.emails.send({
      from: "Prodige RH Connect <onboarding@resend.dev>",
      to: ["houllegatte.arnaud@gmail.com"],
      replyTo: auth.email,
      subject: `[${expediteur}] ${sujet?.trim() || "Message support – Prodige RH Connect"}`,
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
            <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 20px; padding: 12px 14px; background: #f0fdf4; border-radius: 8px; border: 1px solid #bbf7d0;">
              <div style="width: 32px; height: 32px; border-radius: 50%; background: #B5E467; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 13px; color: #081F34; flex-shrink: 0;">
                ${expediteur.charAt(0).toUpperCase()}
              </div>
              <div>
                <p style="margin: 0; font-size: 13px; font-weight: 600; color: #081F34;">${expediteur}</p>
                <p style="margin: 0; font-size: 11px; color: #64748b;">${auth.email} · ${now}</p>
              </div>
            </div>
            <div style="background: #f8fafc; border-radius: 8px; padding: 20px; border: 1px solid #e2e8f0;">
              <p style="color: #1e293b; font-size: 14px; line-height: 1.7; margin: 0; white-space: pre-wrap;">${message.trim()}</p>
            </div>
          </div>
          <div style="padding: 16px 32px; background: #f1f5f9; text-align: center;">
            <p style="color: #94a3b8; font-size: 11px; margin: 0;">Prodige RH Connect · Répondre à ${auth.email}</p>
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
