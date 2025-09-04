"use server";

import nodemailer from "nodemailer";
import fs from "fs";
import path from "path";
import Handlebars from "handlebars";
import { getCurrentUser, getProfile } from "@/actions";

// Configure mail transporter
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.gmail.com",
  port: Number(process.env.SMTP_PORT) || 587,
  secure: process.env.SMTP_SECURE === "true",
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
});

// Template directory path
const TEMPLATE_DIR = path.join(process.cwd(), "services", "templates");

// Load template function
function loadTemplate(templateName: string): HandlebarsTemplateDelegate {
  const templatePath = path.join(TEMPLATE_DIR, `${templateName}.html`);
  const templateSource = fs.readFileSync(templatePath, "utf-8");
  return Handlebars.compile(templateSource);
}

// Mail sending interface
interface SendMailOptions {
  to: string;
  subject: string;
  templateName: string;
  context: Record<string, any>;
  from?: string;
  cc?: string[];
  bcc?: string[];
}

// Send email function
export async function sendMail({
  to,
  subject,
  templateName,
  context,
  from = process.env.DEFAULT_FROM_EMAIL || "noreply@example.com",
  cc,
  bcc,
}: SendMailOptions) {
  try {
    // Load and compile the template
    const template = loadTemplate(templateName);
    const html = template(context);

    console.log("Email template loaded:", html);

    console.log("Sending email with context:", context);

    // Send email
    const info = await transporter.sendMail({
      from,
      to,
      cc,
      bcc,
      subject,
      html,
    });

    console.log(`Email sent: ${info.messageId}`);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error("Error sending email:", error);
    return { success: false, error };
  }
}

// Convenience function for sending "cause under review" emails
export async function sendCauseUnderReviewEmail(context: {
  causeName: string;
  reviewTimeframe?: string;
}) {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error("User not found");
  }
  const profile = await getProfile(user.id);
  return sendMail({
    to: profile?.email || "",
    subject: "Your Cause is Under Review",
    templateName: "cause-under-review",
    context: {
      ...context,
      userName: profile?.full_name || "User",
      organizationName: "Refreeg",
      reviewTimeframe: context.reviewTimeframe || "3-5 business days",
    },
  });
}

// Convenience function for sending "petition under review" emails
export async function sendPetitionUnderReviewEmail(context: {
  petitionName: string;
  reviewTimeframe?: string;
}) {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error("User not found");
  }
  const profile = await getProfile(user.id);
  return sendMail({
    to: profile?.email || "",
    subject: "Your Petition is Under Review",
    templateName: "petition-under-review",
    context: {
      ...context,
      userName: profile?.full_name || "User",
      organizationName: "Refreeg",
      reviewTimeframe: context.reviewTimeframe || "3-5 business days",
    },
  });
}

// Send petition approved email to a specific user (by userId)
export async function sendPetitionApprovedEmailForUser(
  userId: string,
  context: { petitionName: string }
) {
  const profile = await getProfile(userId);
  if (!profile?.email) throw new Error("Recipient email not found");
  return sendMail({
    to: profile.email,
    subject: "Your Petition Has Been Approved ✅",
    templateName: "petition-approved",
    context: {
      ...context,
      userName: profile.full_name || "User",
      organizationName: "Refreeg",
    },
  });
}

// Send petition rejected email to a specific user (by userId)
export async function sendPetitionRejectedEmailForUser(
  userId: string,
  context: { petitionName: string; rejectionReason?: string }
) {
  const profile = await getProfile(userId);
  if (!profile?.email) throw new Error("Recipient email not found");
  return sendMail({
    to: profile.email,
    subject: "Update on Your Petition ❌",
    templateName: "petition-rejected",
    context: {
      ...context,
      userName: profile.full_name || "User",
      organizationName: "Refreeg",
    },
  });
}

export async function sendBankAccountAddedEmail(context: {
  bankName: string;
  accountNumber: string;
  accountName: string;
}) {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error("User not found");
  }
  const profile = await getProfile(user.id);
  return sendMail({
    to: profile?.email || "",
    subject: "Did You Just Add a Bank Account to RefreeG? 🏦",
    templateName: "bank-account-added",
    context: {
      ...context,
      userName: profile?.full_name || "Refreegerian",
      currentYear: new Date().getFullYear().toString(),
    },
  });
}
