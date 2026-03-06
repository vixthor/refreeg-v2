import type {
  CauseStatus,
  Category,
  subHeadings,
  subHeadingWithSubDescription,
} from "./common-types";

export interface Cause {
  id: string;
  user_id: string;
  title: string;
  description: string;
  category: string;
  goal: number;
  raised: number;
  status: CauseStatus;
  rejection_reason: string | null;
  created_at: string;
  updated_at: string;
  image?: string | null;
  days_active?: number | null;
  multimedia?: string[];
  video_links?: string[];
  trust_score?: {
    impact: string;
    readability: string;
    transparency: string;
  };
  verified_status?: "verified" | "in_review" | "pending";
  summary?: string | null;
  location?: string | null;
  faqs?: { question: string; answer: string }[];
  profiles?: {
    full_name: string;
    email: string;
    profile_photo: string | null;
  };
}
export interface CauseWithSubHeading extends Cause {
  sub_heading: subHeadingWithSubDescription[];
}

export interface CauseWithUser extends Cause {
  user: {
    name: string;
    email: string;
    sub_account_code?: string;
    profile_photo?: string | null;
  };
}

export interface CauseFormData {
  title: string;
  description: string;
  category: string;
  goal: string | number;
  currency: string;
  coverImage: File | null;
  image?: string;
  sections?: { heading: string; description: string }[];
  startDate?: Date | undefined;
  endDate?: Date | undefined;
  multimedia: File[];
  video_links?: string[];
}
export interface CauseFilterOptions {
  category?: string;
  status?: CauseStatus;
  userId?: string;
  limit?: number;
  offset?: number;
}
