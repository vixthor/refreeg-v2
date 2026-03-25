import { z } from "zod";

export const CreateCampaignSchema = z.object({
  title: z.string().min(5).max(100),
  description: z.string().min(20).max(5000),
  goal_amount: z.number().positive(),
  payout_mode: z.enum(["immediate", "after_deadline"]),
  deadline: z.string().datetime().optional(), // ISO 8601 string
  bank_account_number: z.string().min(10).max(20), // Support varying lengths depending on country
  bank_code: z.string().min(2),
  bank_account_name: z.string().min(2),
}).refine((data) => {
  if (data.payout_mode === "after_deadline" && !data.deadline) {
    return false;
  }
  return true;
}, {
  message: "Deadline is required when payout_mode is 'after_deadline'",
  path: ["deadline"]
});

export const UpdateCampaignSchema = z.object({
  title: z.string().min(5).max(100).optional(),
  description: z.string().min(20).max(5000).optional(),
  deadline: z.string().datetime().optional()
});

export const InitiateDonationSchema = z.object({
  campaign_id: z.string().uuid(),
  amount: z.number().positive(),
  name: z.string().min(2),
  email: z.string().email(),
  message: z.string().optional(),
  is_anonymous: z.boolean().optional().default(false),
  tip_amount: z.number().nonnegative().optional().default(0),
  callback_url: z.string().url().optional()
});
