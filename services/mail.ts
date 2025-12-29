"use server";

import nodemailer from "nodemailer";
import fs from "fs";
import path from "path";
import Handlebars from "handlebars";
import { getCurrentUser, getProfile } from "@/actions";

export async function getDeviceInfo() {
  if (typeof window === "undefined") return "Unknown Device";
  const ua = window.navigator.userAgent;
  if (/android/i.test(ua)) return "Android";
  if (/iPad|iPhone|iPod/.test(ua)) return "iOS";
  if (/Windows NT/.test(ua)) return "Windows";
  if (/Macintosh/.test(ua)) return "Mac";
  if (/Linux/.test(ua)) return "Linux";
  return "Other";
}
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
  from = process.env.SMTP_USER ||
    process.env.EMAIL_FROM ||
    "noreply@example.com",
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
  dashboardUrl?: string;
}) {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error("User not found");
  }
  const profile = await getProfile(user.id);
  const currentYear = new Date().getFullYear();

  return sendMail({
    to: profile?.email || "",
    subject: "Your Cause is Under Review",
    templateName: "cause-under-review",
    context: {
      ...context,
      userName: profile?.full_name || "User",
      organizationName: "Refreeg",
      reviewTimeframe: context.reviewTimeframe || "3-5 business days",
      dashboardUrl: context.dashboardUrl,
      currentYear,
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

  const petitionLink =
    "https://www.refreeg.com/dashboard/petitions?status=approved";

  return sendMail({
    to: profile.email,
    subject: "Your Petition Has Been Approved ✅",
    templateName: "petition-approved",
    context: {
      ...context,
      userName: profile.full_name || "User",
      organizationName: "Refreeg",
      petitionLink, // Add this
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

  const petitionResubmitLink =
    "https://www.refreeg.com/dashboard/petitions?status=rejected";

  return sendMail({
    to: profile.email,
    subject: "Update on Your Petition ❌",
    templateName: "petition-rejected",
    context: {
      ...context,
      userName: profile.full_name || "User",
      organizationName: "Refreeg",
      petitionResubmitLink, // Add this
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

  // Add current year to the context
  const currentYear = new Date().getFullYear();
  return sendMail({
    to: profile?.email || "",
    subject: "Did You Just Add a Bank Account to RefreeG? 🏦",
    templateName: "bank-account-added",
    context: {
      ...context,
      userName: profile?.full_name || "Refreegerian",
      currentYear,
    },
  });
}

// KYC Email Notifications
export async function sendKycSubmittedEmail(
  userEmail: string,
  userName: string
) {
  return sendMail({
    to: userEmail,
    subject: "KYC Verification Submitted - Refreeg",
    templateName: "kyc-submitted",
    context: {
      userName,
      organizationName: "Refreeg",
      reviewTimeframe: "3-5 business days",
      dashboardUrl: "https://www.refreeg.com/dashboard/settings?tab=kyc",
    },
  });
}

export async function sendKycApprovedEmail(
  userEmail: string,
  userName: string
) {
  return sendMail({
    to: userEmail,
    subject: "KYC Verification Approved - Refreeg",
    templateName: "kyc-approved",
    context: {
      userName,
      organizationName: "Refreeg",
      createCauseUrl: "https://www.refreeg.com/dashboard/settings?tab=kyc",
    },
  });
}

export async function sendKycRejectedEmail(
  userEmail: string,
  userName: string,
  rejectionReason: string
) {
  return sendMail({
    to: userEmail,
    subject: "KYC Verification Update - Refreeg",
    templateName: "kyc-rejected",
    context: {
      userName,
      organizationName: "Refreeg",
      rejectionReason,
      kycResubmitLink: "https://www.refreeg.com/dashboard/settings?tab=kyc",
    },
  });
}

// Send cause submission notification to admins and managers
export async function sendCauseSubmissionAdminNotification(
  userName: string,
  userEmail: string,
  causeTitle: string,
  reviewUrl: string
) {
  const { getAdminManagerEmails } = await import("@/actions/role-actions");
  const adminManagerEmails = await getAdminManagerEmails();

  if (adminManagerEmails.length === 0) {
    console.warn("No admin/manager emails found to send cause notification");
    return { success: false, error: "No admin/manager emails found" };
  }

  const currentYear = new Date().getFullYear();

  const emailPromises = adminManagerEmails.map((email) =>
    sendMail({
      to: email,
      subject: "New Cause Submission Requires Review - Refreeg",
      templateName: "cause-submission-admin-notification",
      context: {
        adminName: "Admin/Manager",
        userName,
        userEmail,
        causeTitle,
        reviewUrl,
        organizationName: "Refreeg",
        currentYear,
      },
    })
  );

  try {
    const results = await Promise.allSettled(emailPromises);
    const successful = results.filter((r) => r.status === "fulfilled").length;
    const failed = results.filter((r) => r.status === "rejected").length;

    console.log(
      `Cause admin notification sent: ${successful} successful, ${failed} failed`
    );

    return {
      success: successful > 0,
      sent: successful,
      failed,
    };
  } catch (error) {
    console.error("Error sending cause admin notifications:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to send notifications",
    };
  }
}

// Send petition submission notification to admins and managers
export async function sendPetitionSubmissionAdminNotification(
  userName: string,
  userEmail: string,
  petitionTitle: string,
  reviewUrl: string
) {
  const { getAdminManagerEmails } = await import("@/actions/role-actions");
  const adminManagerEmails = await getAdminManagerEmails();

  if (adminManagerEmails.length === 0) {
    console.warn("No admin/manager emails found to send petition notification");
    return { success: false, error: "No admin/manager emails found" };
  }

  const currentYear = new Date().getFullYear();

  const emailPromises = adminManagerEmails.map((email) =>
    sendMail({
      to: email,
      subject: "New Petition Submission Requires Review - Refreeg",
      templateName: "petition-submission-admin-notification",
      context: {
        adminName: "Admin/Manager",
        userName,
        userEmail,
        petitionTitle,
        reviewUrl,
        organizationName: "Refreeg",
        currentYear,
      },
    })
  );

  try {
    const results = await Promise.allSettled(emailPromises);
    const successful = results.filter((r) => r.status === "fulfilled").length;
    const failed = results.filter((r) => r.status === "rejected").length;

    console.log(
      `Petition admin notification sent: ${successful} successful, ${failed} failed`
    );

    return {
      success: successful > 0,
      sent: successful,
      failed,
    };
  } catch (error) {
    console.error("Error sending petition admin notifications:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to send notifications",
    };
  }
}

// Convenience function for sending login notification emails
export async function sendLoginNotificationEmail(context: {
  ipAddress?: string;
  device?: string;
  loginTime?: string;
}) {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error("User not found");
  }
  const profile = await getProfile(user.id);
  const currentYear = new Date().getFullYear();
  return sendMail({
    to: profile?.email || "",
    subject: "New Login Notification",
    templateName: "login-notification",
    context: {
      ...context,
      userName: profile?.full_name || "User",
      loginTime: context.loginTime || new Date().toLocaleString(),
      device: context.device || "Unknown Device",
      ipAddress: context.ipAddress || "Unknown IP",
      currentYear,
    },
  });
}

export async function sendCauseEditedEmail({
  causeName,
  reviewTimeframe = "3-5 business days",
  dashboardUrl,
}: {
  causeName: string;
  reviewTimeframe?: string;
  dashboardUrl?: string;
}) {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error("User not found");
  }
  const profile = await getProfile(user.id);

  // Add current year to the context
  const currentYear = new Date().getFullYear();

  return sendMail({
    to: profile?.email || "",
    subject: "Cause Edited - Under Review",
    templateName: "cause-edited",
    context: {
      userName: profile?.full_name || "User",
      causeName,
      reviewTimeframe,
      dashboardUrl,
      currentYear, // Add this line
    },
  });
}

export const sendTestEmail = async (email: string) => {
  return sendMail({
    to: email,
    subject: "Test Email",
    templateName: "login-notification",
    context: {
      userName: "Test User",
      loginTime: new Date().toLocaleString(),
      device: "Test Device",
      ipAddress: "Test IP",
    },
  });
};

// Send incomplete cause setup reminder email
export async function sendIncompleteCauseSetupEmail(context: {
  continueUrl: string;
}) {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error("User not found");
  }
  const profile = await getProfile(user.id);
  const currentYear = new Date().getFullYear();
  return sendMail({
    to: profile?.email || "",
    subject: "Don't let your cause stop halfway 🌱",
    templateName: "incomplete-cause-setup",
    context: {
      ...context,
      userName: profile?.full_name || "User",
      currentYear,
      continueUrl: context.continueUrl,
    },
  });
}

// Send incomplete KYC verification reminder email
export async function sendIncompleteKycVerificationEmail(context: {
  continueUrl: string;
}) {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error("User not found");
  }
  const profile = await getProfile(user.id);
  const currentYear = new Date().getFullYear();
  return sendMail({
    to: profile?.email || "",
    subject: "Just one more step to unlock your account ✅",
    templateName: "incomplete-kyc",
    context: {
      ...context,
      userName: profile?.full_name || "User",
      currentYear,
    },
  });
}

// Send incomplete petition draft reminder email
export async function sendIncompletePetitionDraftEmail(context: {
  continueUrl: string;
}) {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error("User not found");
  }
  const profile = await getProfile(user.id);
  const currentYear = new Date().getFullYear();
  return sendMail({
    to: profile?.email || "",
    subject: "Your petition is waiting for you to finish it ✍️",
    templateName: "incomplete-petition",
    context: {
      ...context,
      userName: profile?.full_name || "User",
      currentYear,
      continueUrl: context.continueUrl,
    },
  });
}

// Send unfinished donation attempt reminder email
export async function sendUnfinishedDonationEmail(context: {
  causeName: string;
  continueUrl: string;
}) {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error("User not found");
  }
  const profile = await getProfile(user.id);
  const currentYear = new Date().getFullYear();
  return sendMail({
    to: profile?.email || "",
    subject: `You were almost done supporting ${context.causeName} ❤️`,
    templateName: "unfinished-donation",
    context: {
      ...context,
      userName: profile?.full_name || "there",
      currentYear,
      continueUrl: context.continueUrl,
    },
  });
}

// Send welcome email to specific user (for use in signup flow)
export async function sendWelcomeEmailToUser(
  userEmail: string,
  userName: string,
  profileSetupUrl: string
) {
  return sendMail({
    to: userEmail,
    subject: "Welcome to Refreeg 🌍 Let's get you started",
    templateName: "welcome-email",
    context: {
      userName,
      profileSetupUrl,
      currentYear: new Date().getFullYear(),
    },
  });
}

// Send petition signed email to specific user
export async function sendPetitionSignedEmailToUser(
  userEmail: string,
  userName: string,
  petitionName: string,
  petitionUrl: string,
  isAnonymous: boolean = false
) {
  return sendMail({
    to: userEmail,
    subject: "Thank you for signing! ✍️",
    templateName: "petition-signed",
    context: {
      userName,
      petitionName,
      petitionUrl,
      isAnonymous,
      currentYear: new Date().getFullYear(),
    },
  });
}

// Send notification to petition creator when someone signs
export async function sendNewSignatureNotificationEmail(
  creatorEmail: string,
  creatorName: string,
  petitionName: string,
  petitionUrl: string,
  signerName: string,
  message?: string
) {
  return sendMail({
    to: creatorEmail,
    subject: `New signature for "${petitionName}"! 🎉`,
    templateName: "new-signature",
    context: {
      creatorName,
      petitionName,
      petitionUrl,
      signerName,
      message: message || "No message provided",
      hasMessage: !!message,
      currentYear: new Date().getFullYear(), // Added currentYear
    },
  });
}

// Send KYC submission notification to admins and managers
export async function sendKycSubmissionAdminNotification(
  userEmail: string,
  userName: string,
  userId: string,
  kycReviewUrl: string
) {
  const { getAdminManagerEmails } = await import("@/actions/role-actions");
  const adminManagerEmails = await getAdminManagerEmails();

  if (adminManagerEmails.length === 0) {
    console.warn("No admin/manager emails found to send KYC notification");
    return { success: false, error: "No admin/manager emails found" };
  }

  // Send email to all admins and managers
  const emailPromises = adminManagerEmails.map((email) =>
    sendMail({
      to: email,
      subject: "New KYC Submission Requires Review - Refreeg",
      templateName: "kyc-submission-admin-notification",
      context: {
        adminName: "Admin/Manager",
        userName,
        userEmail,
        kycReviewUrl,
        organizationName: "Refreeg",
        currentYear: new Date().getFullYear(),
      },
    })
  );

  try {
    const results = await Promise.allSettled(emailPromises);
    const successful = results.filter((r) => r.status === "fulfilled").length;
    const failed = results.filter((r) => r.status === "rejected").length;

    console.log(
      `KYC admin notification sent: ${successful} successful, ${failed} failed`
    );

    return {
      success: successful > 0,
      sent: successful,
      failed,
    };
  } catch (error) {
    console.error("Error sending KYC admin notifications:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to send notifications",
    };
  }
}
