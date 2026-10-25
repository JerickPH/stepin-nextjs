import { NextResponse } from "next/server";
import forms from "@/content/forms.json";

/**
 * Replaces WordPress's admin-ajax.php for Elementor Pro forms.
 * Elementor posts FormData here (action=elementor_pro_forms_send_form) and expects
 * WordPress-style JSON: { success, data: { message, errors?, data } }.
 *
 * Email delivery uses Resend's HTTP API (no SDK needed). Configure in Vercel:
 *   RESEND_API_KEY   – required to send
 *   FORM_TO_EMAIL    – where submissions go (comma-separated allowed)
 *   FORM_FROM_EMAIL  – verified sender, e.g. "STEP IN Website <noreply@stepinrecruitment.com.au>"
 */

type FormDef = { name: string; fields: Record<string, string> };
const FORM_DEFS = forms as Record<string, FormDef>;

const SUCCESS_MSG = "Your submission was successful.";
const ERROR_MSG = "Your submission failed because of an error. Please try again or email us directly.";

const wpJson = (success: boolean, message: string, extra: Record<string, unknown> = {}, status = 200) =>
  NextResponse.json({ success, data: { message, data: [], ...extra } }, { status });

const esc = (s: string) =>
  s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);

export async function POST(req: Request) {
  let fd: FormData;
  try {
    fd = await req.formData();
  } catch {
    return wpJson(false, ERROR_MSG, {}, 400);
  }

  // Other Elementor AJAX actions (none needed on this site) get a harmless success.
  if (fd.get("action") !== "elementor_pro_forms_send_form") {
    return NextResponse.json({ success: true, data: {} });
  }

  const formId = String(fd.get("form_id") || "");
  const def = FORM_DEFS[formId];
  const page = String(fd.get("referer_title") || "Website");

  // Collect form_fields[...] entries, joining multi-value checkboxes.
  const values: Record<string, string[]> = {};
  for (const [key, value] of fd.entries()) {
    const m = key.match(/^form_fields\[([^\]]+)\](\[\])?$/);
    if (!m || typeof value !== "string") continue;
    (values[m[1]] ||= []).push(value.trim());
  }

  // Honeypot fields (Elementor names them field_* with type honeypot) – silently accept bots.
  if (Object.keys(values).some((k) => k.startsWith("honeypot") && values[k].join(""))) {
    return wpJson(true, SUCCESS_MSG);
  }

  const errors: Record<string, string> = {};
  const email = values.email?.[0] || "";
  if (values.email !== undefined && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.email = "Please enter a valid email address.";
  }
  if (Object.keys(errors).length) return wpJson(false, "Please check the highlighted fields.", { errors });

  const rows = Object.entries(values).map(([key, v]) => [def?.fields[key] || key, v.join(", ")] as const);
  const subject = `New website enquiry – ${page}`;
  const text = rows.map(([k, v]) => `${k}: ${v}`).join("\n") + `\n\nPage: ${page}`;
  const html =
    `<h2 style="font-family:Arial,sans-serif">${esc(subject)}</h2><table cellpadding="6" style="font-family:Arial,sans-serif;border-collapse:collapse">` +
    rows.map(([k, v]) => `<tr><td style="font-weight:bold;vertical-align:top">${esc(k)}</td><td>${esc(v).replace(/\n/g, "<br>")}</td></tr>`).join("") +
    `</table><p style="font-family:Arial,sans-serif;color:#666">Sent from the ${esc(page)} page.</p>`;

  const apiKey = process.env.RESEND_API_KEY;
  const to = (process.env.FORM_TO_EMAIL || "").split(",").map((s) => s.trim()).filter(Boolean);
  if (!apiKey || !to.length) {
    console.error("[forms] RESEND_API_KEY / FORM_TO_EMAIL not configured – submission not delivered", { subject, text });
    return wpJson(false, ERROR_MSG);
  }

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from: process.env.FORM_FROM_EMAIL || "STEP IN Website <onboarding@resend.dev>",
      to,
      reply_to: email || undefined,
      subject,
      text,
      html,
    }),
  });

  if (!res.ok) {
    console.error("[forms] Resend error", res.status, await res.text());
    return wpJson(false, ERROR_MSG);
  }
  return wpJson(true, SUCCESS_MSG);
}
