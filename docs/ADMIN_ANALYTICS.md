# Admin Analytics Dashboard Documentation

## Overview

The Admin Analytics Dashboard has been enhanced to provide comprehensive insights into platform performance, including donation trends, user growth, operational metrics (KYC, Payments), and cause lifecycle statistics.

## New Features

### 1. Global Time-Range Filtering

- **Component**: `DatePickerWithRange`
- **Functionality**: Allows admins to select custom date ranges or predefined periods (Last 30 days, etc.).
- **Impact**: All metrics, charts, and export data are filtered based on the selected range.

### 2. Period Comparison

- **Logic**: Compares current period metrics with the previous period of the same duration.
- **Visuals**: Displays trend percentage (e.g., "+12% vs prev period") on summary cards.

### 3. Operational Analytics

- **New Tabs**:
  - **Donations**: Trend analysis (Regular vs Crypto).
  - **Users**: Growth charts.
  - **Causes**: Category distribution.
  - **Operations**:
    - **KYC**: Approval/Rejection rates, Average processing time.
    - **Payments**: Success/Failure rates, Failed amount total.
    - **Lifecycle**: Cause progression funnel (Created -> Approved -> Completed).

### 4. Alert System

- **Thresholds**:
  - KYC Rejection Rate > 15% (Warning)
  - Payment Failure Rate > 5% (Critical)
- **UI**: Displayed as dismissible alerts at the top of the dashboard.

### 5. Export Capabilities

- **CSV Export**: Downloads a detailed CSV including summary metrics and daily/monthly trends.

## Technical Architecture

### Components

- `AdminAnalytics.tsx`: Main container, handles state (date range) and data fetching.
- `AnalyticsCard.tsx`: Reusable metric card with trend indicators.

### Hooks & Actions

- `useAdminAnalytics`: Fetches summary data.
- `useAnalyticsCharts`: Fetches data for visualization (Recharts).
- `useOperationalAnalytics`: Fetches KYC, Payment, and Lifecycle data.
- `admin-analytics-actions.ts`: Server-side logic to query Supabase with date filters.

## Setup Instructions

### Adding Tests

Currently, the project does not have a testing framework installed. To add tests:

1. Install Jest/Vitest.
2. Create test files matching `__tests__/*.test.tsx`.
3. Mock `useAdminAnalytics` hooks to verify rendering logic.
