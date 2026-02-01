# ConvertKit Email List Integration

## Overview

This integration automatically adds new users to your ConvertKit email list when they sign up for RefreeG. This allows you to:

- Send welcome email sequences
- Keep users engaged with newsletters
- Segment users by account type
- Track signup dates and user activity

## Setup Instructions

### 1. Get Your ConvertKit Credentials

1. **Log in to ConvertKit**: Go to [app.convertkit.com](https://app.convertkit.com)

2. **Get API Key and Secret**:

   - Navigate to **Settings** → **Advanced** → **API**
   - Copy your **API Key** and **API Secret**

3. **Create or Get Form ID**:
   - Go to **Forms** in your ConvertKit dashboard
   - Either create a new form or select an existing one
   - The Form ID is in the URL: `app.convertkit.com/forms/designers/[FORM_ID]/edit`
   - Alternatively, you can find it in the form settings

### 2. Configure Environment Variables

Add these variables to your `.env.local` file:

```env
# ConvertKit Configuration
CONVERTKIT_API_KEY=your_api_key_here
CONVERTKIT_API_SECRET=your_api_secret_here
CONVERTKIT_FORM_ID=your_form_id_here
```

**Important**: Never commit your `.env.local` file to version control!

### 3. Test the Integration

1. **Start your development server**:

   ```bash
   npm run dev
   ```

2. **Create a test account**:

   - Go to your signup page
   - Fill in the form with a test email
   - Complete the signup process

3. **Verify in ConvertKit**:
   - Go to your ConvertKit dashboard
   - Navigate to **Subscribers**
   - Look for your test email
   - It should appear with:
     - First name (extracted from full name)
     - Custom fields: `account_type` and `signup_date`

## How It Works

### Sign-up Flow

1. User submits signup form with email, password, full name, and account type
2. Supabase creates the auth account
3. Profile is created in the database
4. Welcome email is sent via Nodemailer
5. **User is subscribed to ConvertKit** (this happens automatically)
6. User is redirected to onboarding

### Code Location

The integration is implemented in:

- **Service Module**: `services/convertkit.ts` - Contains all ConvertKit API functions
- **Sign-up Hook**: `hooks/use-auth.ts` - Calls ConvertKit during sign-up

### Data Sent to ConvertKit

When a user signs up, the following data is sent:

- **Email**: User's email address
- **First Name**: Extracted from the full name (first word)
- **Custom Fields**:
  - `account_type`: Either "individual" or "organization"
  - `signup_date`: ISO timestamp of when they signed up

## Advanced Features

### Adding Tags

You can tag subscribers based on their actions. For example, tag users who complete KYC:

```typescript
import { addTagsToSubscriber } from "@/services/convertkit";

// After KYC approval
await addTagsToSubscriber(userEmail, [TAG_ID_FOR_KYC_VERIFIED]);
```

**To get Tag IDs**:

1. Go to ConvertKit → **Subscribers** → **Tags**
2. Click on a tag
3. The tag ID is in the URL: `app.convertkit.com/subscribers/tags/[TAG_ID]`

### Updating Subscriber Fields

Update custom fields for existing subscribers:

```typescript
import { updateSubscriberFields } from "@/services/convertkit";

await updateSubscriberFields(userEmail, {
  kyc_verified: "true",
  total_donations: "5",
  last_login: new Date().toISOString(),
});
```

### Custom Field Setup in ConvertKit

1. Go to **Settings** → **Custom Fields**
2. Click **+ New Field**
3. Add fields you want to track (e.g., "account_type", "kyc_verified", etc.)

## Error Handling

The integration is designed to **never fail the signup process**. If ConvertKit subscription fails:

- The error is logged to the console
- The user's account is still created successfully
- They can still use the platform normally

This ensures a smooth user experience even if ConvertKit is temporarily unavailable.

## Troubleshooting

### Users not appearing in ConvertKit

1. **Check environment variables**: Ensure `CONVERTKIT_API_KEY` and `CONVERTKIT_FORM_ID` are set correctly
2. **Check server logs**: Look for ConvertKit-related errors in your terminal
3. **Verify API credentials**: Test them directly in ConvertKit's API documentation
4. **Check form status**: Make sure the form is published in ConvertKit

### Duplicate subscribers

ConvertKit automatically handles duplicates by email. If a user signs up again:

- Their existing subscriber record is updated
- No duplicate is created
- Tags and fields are added/updated

### Rate limits

ConvertKit's API has rate limits:

- **500 requests per hour** for most endpoints
- If you hit the limit, wait an hour or contact ConvertKit support

## API Functions Reference

### `subscribeToConvertKit(data)`

Subscribe a user to your ConvertKit form.

**Parameters**:

```typescript
{
  email: string;          // Required: User's email
  first_name?: string;    // Optional: First name
  tags?: number[];        // Optional: Array of tag IDs
  fields?: Record<string, string>; // Optional: Custom fields
}
```

**Returns**: `Promise<ConvertKitResponse>`

### `addTagsToSubscriber(email, tagIds)`

Add tags to an existing subscriber.

**Parameters**:

- `email: string` - Subscriber's email
- `tagIds: number[]` - Array of tag IDs to add

**Returns**: `Promise<ConvertKitResponse>`

### `updateSubscriberFields(email, fields)`

Update custom fields for a subscriber.

**Parameters**:

- `email: string` - Subscriber's email
- `fields: Record<string, string>` - Key-value pairs of fields to update

**Returns**: `Promise<ConvertKitResponse>`

## Security Notes

- API keys are only used on the server side (Next.js server actions)
- Never expose your API secret in client-side code
- The ConvertKit service uses `"use server"` directive to ensure server-only execution
- Environment variables are not bundled in the client JavaScript

## Support

For ConvertKit-specific issues:

- [ConvertKit API Documentation](https://developers.convertkit.com/)
- [ConvertKit Support](https://help.convertkit.com/)

For integration issues in RefreeG:

- Check the console logs for detailed error messages
- Review the implementation in `services/convertkit.ts`
- Ensure all environment variables are properly set
