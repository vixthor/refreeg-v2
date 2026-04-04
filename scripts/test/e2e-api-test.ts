/**
 * RefreeG API End-to-End Test Script
 * This script verifies the full bot-facing API flow.
 * Usage: npx ts-node scripts/test/e2e-api-test.ts
 */

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
const TEST_API_KEY = process.env.TEST_API_KEY; // Should be a valid rg_test_sk_...

async function runTest() {
  if (!TEST_API_KEY) {
    console.error("❌ Error: TEST_API_KEY environment variable is required.");
    process.exit(1);
  }

  console.log("🚀 Starting RefreeG API End-to-End Test...");
  console.log(`📍 Base URL: ${BASE_URL}\n`);

  try {
    // 1. Create Campaign
    console.log("1️⃣  Creating Campaign...");
    const campaignRes = await fetch(`${BASE_URL}/api/bot/campaigns`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${TEST_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        title: "E2E Test Campaign",
        description: "Testing the full RefreeG API flow...",
        category: "education",
        goal_amount: 100000,
        bank_account_number: "0123456789",
        bank_code: "058",
        bank_account_name: "Test Account",
        payout_mode: "immediate"
      })
    });

    const campaignData = await campaignRes.json();
    if (campaignData.status !== "success") {
      throw new Error(`Failed to create campaign: ${JSON.stringify(campaignData)}`);
    }
    const campaignId = campaignData.data.id;
    console.log(`✅ Campaign Created! ID: ${campaignId}\n`);

    // 2. Initialize Donation
    console.log("2️⃣  Initializing Donation...");
    const donationRes = await fetch(`${BASE_URL}/api/bot/donations/initialize`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${TEST_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        campaign_id: campaignId,
        amount: 2000,
        name: "E2E Tester",
        email: "test@example.com"
      })
    });

    const donationData = await donationRes.json();
    if (donationData.status !== "success") {
      throw new Error(`Failed to initialize donation: ${JSON.stringify(donationData)}`);
    }
    const reference = donationData.data.reference;
    console.log(`✅ Donation Initialized! Reference: ${reference}`);
    console.log(`🔗 Paystack URL: ${donationData.data.authorization_url}\n`);

    // 3. Verify Donation (Mocked or Staging)
    console.log("3️⃣  Verifying Donation (Polling Verification)...");
    const verifyRes = await fetch(`${BASE_URL}/api/bot/donations/verify/${reference}`, {
      headers: { "Authorization": `Bearer ${TEST_API_KEY}` }
    });
    const verifyData = await verifyRes.json();
    console.log(`📊 Current Status: ${verifyData.data.status}`);
    console.log(`   Detailed Message: ${verifyData.data.status_message}\n`);

    console.log("✨ E2E Flow Partial Success! (Manual payment required for full completion)");
    console.log("------------------------------------------------------------------");
  } catch (error: any) {
    console.error(`❌ Test Failed: ${error.message}`);
    process.exit(1);
  }
}

runTest();
