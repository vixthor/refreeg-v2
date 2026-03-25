# Backend Implementation Plan: Campaign Quality Lab & Pledge Features

This document outlines the backend architecture, database schema changes, and API logic required to support the new "Campaign Quality Lab" and "Pledge" features.

## 1. Database Schema Updates

We need to introduce new tables and update existing ones to support trust metrics, subscriptions, pledges, and campaign updates.

### A. New Tables

#### 1. `pledges`

Stores user commitments to donate at a future date.

```sql
create table pledges (
  id uuid default gen_random_uuid() primary key,
  cause_id uuid references causes(id) not null,
  user_id uuid references auth.users(id), -- Optional: Link if user is logged in
  token text unique, -- Required for guest pledges (generated UUID/hash)
  amount numeric not null,
  currency text default 'NGN',
  name text not null,
  email text not null,
  note text,
  reminder_date date not null,
  status text default 'pending', -- pending, fulfilled, cancelled, expired
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);
```

#### 2. `subscriptions` (Contribution Schedule)

Handles recurring donations via Paystack.

```sql
create table subscriptions (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id),
  cause_id uuid references causes(id),
  paystack_subscription_code text not null,
  paystack_email_token text,
  amount numeric not null,
  interval text not null, -- 'daily', 'weekly', 'monthly'
  status text default 'active', -- active, cancelled, past_due
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);
```

#### 3. `campaign_follows`

Tracks users who want email updates about a campaign.

```sql
create table campaign_follows (
  id uuid default gen_random_uuid() primary key,
  cause_id uuid references causes(id) not null,
  user_id uuid references auth.users(id), -- Optional
  email text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(cause_id, email)
);
```

### B. Updates to `causes` Table

Add columns to support trust metrics and additional metadata.

```sql
alter table causes
add column if not exists trust_score jsonb default '{"impact": "B+", "readability": "A", "transparency": "High"}'::jsonb,
add column if not exists verified_status text default 'pending', -- verified, in_review
add column if not exists summary text, -- Short description for Hero
add column if not exists location text,
add column if not exists multimedia text[], -- Array of additional images
add column if not exists video_links text[],
add column if not exists faqs jsonb default '[]'::jsonb; -- Array of {question, answer}
```

### C. Updates to `donations` Table (Platform Tips)

Add a column to track the tip amount separately from the donation amount.

```sql
alter table donations
add column if not exists tip_amount numeric default 0;
```

---

## 2. API & Server Actions Logic

### A. Pledge Logic

- **Create Pledge (`createPledge`)**:
  - **Input**: `causeId`, `amount`, `date`, `name`, `email`.
  - **Logic**:
    - Validate `date <= cause.endDate`.
    - If user logged in: Link `user_id`.
    - If guest: Generate unique `token`.
    - Insert into `pledges`.
    - **Notifications**:
      - Send "Pledge Received" email to user.
- **Fulfill Pledge**:
  - When a donation occurs:
    - Check if email matches a pending pledge for this cause.
    - If yes, update pledge status to `fulfilled`.
- **Reminders (Cron Job)**:
  - Daily job checks `pledges` where `reminder_date == today` AND `status == 'pending'`.
  - Sends email with donation link (including `token` for guests).

### B. Campaign Quality Lab (Trust Metrics)

- **Milestone Escrow**:
  - Check `profiles.sub_account_code` (Paystack) validity.
  - Check if cause has active milestones (from `cause_edits` or separate milestones table if needed).
- **Evidence Review**:
  - Query `cause_edits` where `status = 'pending'`.
  - If count > 0, status is "In Progress".
- **Impact Score**:
  - Fetched directly from `causes.trust_score` (Admin managed).

### C. Contribution Schedule (Subscriptions)

- **Create Subscription**:
  - Initialize Paystack transaction with `plan` parameter.
  - On webhook (`subscription.create`), insert into `subscriptions` table.
- **Management**:
  - User can cancel via dashboard -> calls Paystack API to cancel subscription.

### D. Platform Tips (RefreeG Support)

- **Logic**:
  - The tip is an optional amount added **on top** of the donation.
  - This amount goes directly to the main RefreeG Paystack account (no split).
  - The `service_fee` is calculated on the **base donation** only (or total, depending on policy - usually base).
- **Paystack Split**:
  - Base Donation: Split between Cause Subaccount & RefreeG Main (Service Fee).
  - Tip: 100% to RefreeG Main.
  - _Implementation_: Since Paystack splits are percentage-based per transaction, we might need to use `bearer: 'subaccount'` or handle it as a separate charge/split calculation if Paystack doesn't support multi-destination splits easily.
  - _Alternative_: Calculate the total amount and the split ratio dynamically so that (Base \* Split%) = Cause Amount, and the rest (Fee + Tip) goes to Main.

### E. Campaign Health & Stats

- **Total Today**:
  - `select sum(amount) from donations where cause_id = X and created_at >= current_date`.
- **Recent Donors**:
  - `select * from donations where cause_id = X order by created_at desc limit 5`.
- **Campaign Health**:
  - Computed on fly: `(raised / goal) * 100`.
  - If `days_remaining < (total_days * 0.1)` AND `raised < (goal * 0.8)` -> "At Risk".

### F. Follow Campaign

- **Action**: `followCampaign(email, causeId)`.
- **Logic**:
  - Upsert into `campaign_follows`.
  - If email not in `auth.users`, return flag to show "Sign Up" modal.
- **Trigger**:
  - When `cause_edits` is approved -> Send email to all followers.

---

## 3. Frontend Integration Plan

### A. Cause Details Page (`CampaignQualityLab`)

- **Data Fetching**:
  - Update `getCause` to fetch `trust_score`, `location`, `summary`, `faqs`.
  - Fetch `cause_edits` (pending) count for Evidence status.
  - Fetch `donations` aggregation for "Total Today" and "Recent Donors".
- **UI Components**:
  - **Trust Strip**: Dynamic based on fetched data.
  - **Story**: Render `cause.sections` (already supported).
  - **Impact Estimate**: New component to display creator testimonies (stored in `cause_edits` or `cause_sections`).

### B. Pledge Screen

- **Form**:
  - Use `createPledge` action.
  - Handle success state (Email sent confirmation).
- **Logic**:
  - Hide "Guest Fields" if `user` is present in props.

### C. Admin Dashboard

- **Impact Score Editor**: Interface for admins to rate causes.
- **Evidence Review**: Interface to approve/reject `cause_edits`.

---

## 4. Workflows

### Guest Pledge Fulfillment

1.  Guest receives reminder email with link: `/causes/123?pledge_token=abc`.
2.  Guest clicks link.
3.  Donation form pre-fills email/amount from pledge token.
4.  On successful payment -> Webhook marks pledge `abc` as `fulfilled`.

### Subscription Flow

1.  User selects "Monthly" in donation form.
2.  App calls `initializePayment` with `plan: 'PLN_monthly_...'`.
3.  User pays.
4.  Paystack creates subscription.
5.  RefreeG records subscription in DB.

### Platform Tip Flow

1.  User enters Donation Amount (e.g., ₦5000).
2.  User selects Tip (e.g., ₦500).
3.  Total Charge: ₦5500.
4.  **Paystack Split Calculation**:
    - Cause Share: ₦5000 - Service Fee (e.g. 5% = ₦250) = ₦4750.
    - RefreeG Share: Service Fee (₦250) + Tip (₦500) = ₦750.
    - We adjust the `subaccount_transaction_charge` or split percentage to ensure the cause gets exactly ₦4750.
