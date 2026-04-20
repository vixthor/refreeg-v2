"use server";

import { prisma } from "@/lib/prisma";
import { requireAdminOrManager } from "@/lib/auth/admin-auth";

export async function getApiCampaigns(search?: string) {
  await requireAdminOrManager();

  const where = search
    ? {
        OR: [{ title: { contains: search, mode: "insensitive" as const } }],
      }
    : {};

  const campaigns = await prisma.api_campaigns.findMany({
    where,
    orderBy: { created_at: "desc" },
    take: 50,
  });

  const apiKeyIds = [
    ...new Set(campaigns.map((c) => c.api_key_id).filter(Boolean)),
  ];

  let apiKeys: Record<string, any> = {};
  if (apiKeyIds.length > 0) {
    const keys = await prisma.api_keys.findMany({
      where: { id: { in: apiKeyIds as string[] } },
      select: { id: true, name: true, key_prefix: true, mode: true },
    });
    apiKeys = Object.fromEntries(keys.map((k) => [k.id, k]));
  }

  const allCampaigns = await prisma.api_campaigns.findMany({
    select: { api_key_id: true },
  });

  const allApiKeys = await prisma.api_keys.findMany({
    select: { id: true, key_prefix: true, mode: true },
  });
  const keyMap = Object.fromEntries(allApiKeys.map((k) => [k.id, k]));

  const uniqueApis = new Set(
    allCampaigns
      .map((c) => keyMap[c.api_key_id as string]?.key_prefix)
      .filter(Boolean),
  ).size;

  const liveCount = allCampaigns.filter(
    (c) => keyMap[c.api_key_id as string]?.mode === "live",
  ).length;
  const testCount = allCampaigns.filter(
    (c) => keyMap[c.api_key_id as string]?.mode === "test",
  ).length;

  return {
    campaigns: campaigns.map((c) => ({
      id: c.id,
      title: c.title,
      status: c.status,
      created_at: c.created_at,
      api_key_id: c.api_key_id,
      apiName: apiKeys[c.api_key_id as string]?.name || "Unknown API",
      apiPrefix: apiKeys[c.api_key_id as string]?.key_prefix || "N/A",
      apiMode: apiKeys[c.api_key_id as string]?.mode || "unknown",
    })),
    stats: {
      total: allCampaigns.length,
      uniqueApis,
      liveCount,
      testCount,
    },
  };
}
