import { PrismaClient } from "@prisma/client";
import { uploadToS3, generateS3Key } from "../lib/s3/s3-utils";
import * as fs from "fs";
import * as path from "path";

import { createClient } from "@supabase/supabase-js";

// Simple .env loader
try {
  const envPath = path.resolve(process.cwd(), ".env");
  if (fs.existsSync(envPath)) {
    const envConfig = fs.readFileSync(envPath, "utf-8");
    envConfig.split("\n").forEach((line) => {
      const match = line.match(/^([^=]+)=(.*)$/);
      if (match) {
        const key = match[1].trim();
        const value = match[2].trim().replace(/^['"]|['"]$/g, "");
        if (!process.env[key]) {
          process.env[key] = value;
        }
      }
    });
    console.log("Loaded environment variables from .env");
  }
} catch (e) {
  console.warn("Could not load .env file:", e);
}

const prisma = new PrismaClient();

const DRY_RUN = process.argv.includes("--dry-run");

async function downloadFile(
  url: string,
): Promise<{ buffer: Buffer; contentType: string }> {
  // If it's just a relative path, assume it's from the old Supabase storage
  let fetchUrl = url;
  if (url.startsWith("uploads/")) {
    const supabaseUrl =
      process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
    const supabaseKey =
      process.env.SUPABASE_SERVICE_ROLE_KEY ||
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (supabaseUrl && supabaseKey) {
      const supabase = createClient(supabaseUrl, supabaseKey);
      if (url.startsWith("uploads/kyc/")) {
        const bucket = "kyc-documents";
        // URL format: uploads/kyc/{user_id}/{kyc_id}/documents/{random}.ext
        const parts = url.split("/");
        if (parts.length >= 3) {
          const userId = parts[2];

          // First, list files in the user's folder in kyc-documents bucket
          const { data: files, error: listError } = await supabase.storage
            .from(bucket)
            .list(userId);

          if (listError) {
            throw new Error(
              `Failed to list files in ${bucket}/${userId}: ${listError.message}`,
            );
          }

          if (!files || files.length === 0) {
            throw new Error(`No files found in ${bucket}/${userId}`);
          }

          // Usually there is only one file per user, e.g. timestamp.jpg. We'll take the most recent.
          files.sort(
            (a, b) =>
              new Date(b.created_at).getTime() -
              new Date(a.created_at).getTime(),
          );
          const targetFile = files[0].name;
          const downloadPath = `${userId}/${targetFile}`;

          const { data, error } = await supabase.storage
            .from(bucket)
            .download(downloadPath);

          if (error) {
            throw new Error(
              `Failed to fetch via Supabase SDK (bucket ${bucket}, path ${downloadPath}): ${error.message}`,
            );
          }
          const arrayBuffer = await data.arrayBuffer();
          const buffer = Buffer.from(arrayBuffer);
          const contentType = data.type || "application/octet-stream";
          return { buffer, contentType };
        } else {
          throw new Error(`Invalid KYC URL format: ${url}`);
        }
      } else {
        fetchUrl = `${supabaseUrl}/storage/v1/object/public/uploads/${url}`;
      }
    }
  }

  console.log(`Downloading from: ${fetchUrl}`);

  const token =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const headers: Record<string, string> = {};
  if (token && url.startsWith("uploads/kyc/")) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(fetchUrl, { headers });
  if (!response.ok) {
    throw new Error(`Failed to fetch ${fetchUrl}: ${response.statusText}`);
  }
  const arrayBuffer = await response.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  const contentType =
    response.headers.get("content-type") || "application/octet-stream";
  return { buffer, contentType };
}

function isSupabaseUrl(url: string | null | undefined): boolean {
  if (!url) return false;
  return (
    url.includes("supabase.co") ||
    url.includes("/storage/v1/object/") ||
    url.includes("uploads/kyc/")
  );
}

function getExtensionFromUrl(url: string): string {
  try {
    const parsed = new URL(url);
    const parts = parsed.pathname.split(".");
    return parts.length > 1 ? `.${parts.pop()}` : "";
  } catch (e) {
    // Fallback if not a valid URL
    const parts = url.split(".");
    return parts.length > 1 ? `.${parts.pop()}` : "";
  }
}

async function processUrl(
  url: string | null | undefined,
  entityId: string,
  userId: string,
  folder: "avatars" | "causes" | "petitions" | "documents",
): Promise<string | null> {
  if (!url || !isSupabaseUrl(url)) {
    return url || null;
  }

  const ext = getExtensionFromUrl(url);
  // Using entityId or a random uuid for the object key
  const uniqueId = Math.random().toString(36).substring(2, 15);

  // Use standardized key generation
  let s3Key = "";
  if (folder === "avatars") {
    s3Key = generateS3Key({
      entityType: "profiles",
      userId,
      entityId: userId,
      mediaType: "images",
      filename: `${uniqueId}${ext}`,
    });
  } else if (folder === "causes") {
    s3Key = generateS3Key({
      entityType: "causes",
      userId,
      entityId,
      mediaType: "images",
      filename: `${uniqueId}${ext}`,
    });
  } else if (folder === "petitions") {
    s3Key = generateS3Key({
      entityType: "petitions",
      userId,
      entityId,
      mediaType: "images",
      filename: `${uniqueId}${ext}`,
    });
  } else if (folder === "documents") {
    s3Key = generateS3Key({
      entityType: "kyc",
      userId,
      entityId,
      mediaType: "documents",
      filename: `${uniqueId}${ext}`,
    });
  }

  console.log(`[${folder}] Migrating: ${url}`);
  console.log(`  -> Target S3 Key: ${s3Key}`);

  if (!DRY_RUN) {
    try {
      console.log(`  -> Downloading...`);
      const { buffer, contentType } = await downloadFile(url);
      console.log(
        `  -> Uploading to S3... (${buffer.length} bytes, ${contentType})`,
      );
      await uploadToS3(buffer, s3Key, contentType);
      console.log(`  -> Upload Success!`);
    } catch (e: any) {
      console.error(`  -> Failed to migrate ${url}: ${e.message}`);
      return url; // Return original on failure
    }
  } else {
    console.log(`  -> [DRY RUN] Download & Upload skipped.`);
  }

  return s3Key;
}

async function migrateProfiles() {
  console.log("--- Migrating Profiles ---");
  const users = await prisma.user.findMany({
    where: {
      profilePhoto: { contains: "supabase" },
    },
    select: { id: true, profilePhoto: true },
  });

  for (const user of users) {
    if (user.profilePhoto) {
      const newKey = await processUrl(
        user.profilePhoto,
        user.id,
        user.id,
        "avatars",
      );
      if (newKey && newKey !== user.profilePhoto && !DRY_RUN) {
        await prisma.user.update({
          where: { id: user.id },
          data: { profilePhoto: newKey },
          select: { id: true },
        });
      }
    }
  }
}

async function migrateCauses() {
  console.log("--- Migrating Causes ---");
  const causes = await prisma.cause.findMany({
    select: { id: true, userId: true, image: true, multimedia: true },
  });

  for (const cause of causes) {
    let updated = false;
    let newImage = cause.image;
    let newMultimedia = cause.multimedia as any;

    if (cause.image && isSupabaseUrl(cause.image)) {
      const key = await processUrl(
        cause.image,
        cause.id,
        cause.userId,
        "causes",
      );
      if (key && key !== cause.image) {
        newImage = key;
        updated = true;
      }
    }

    if (Array.isArray(newMultimedia)) {
      const updatedMultimedia = [];
      for (const item of newMultimedia) {
        if (typeof item === "string" && isSupabaseUrl(item)) {
          const key = await processUrl(item, cause.id, cause.userId, "causes");
          if (key && key !== item) {
            updatedMultimedia.push(key);
            updated = true;
          } else {
            updatedMultimedia.push(item);
          }
        } else {
          updatedMultimedia.push(item);
        }
      }
      newMultimedia = updatedMultimedia;
    }

    if (updated && !DRY_RUN) {
      await prisma.cause.update({
        where: { id: cause.id },
        data: { image: newImage, multimedia: newMultimedia },
        select: { id: true },
      });
    }
  }
}

async function migratePetitions() {
  const petitions = await prisma.petitions.findMany({
    select: { id: true, user_id: true, image: true, multimedia: true },
  });

  for (const petition of petitions) {
    let updated = false;
    let newImage = petition.image;
    let newMultimedia = petition.multimedia;

    if (petition.image && isSupabaseUrl(petition.image)) {
      const key = await processUrl(
        petition.image,
        petition.id,
        petition.user_id,
        "petitions",
      );
      if (key && key !== petition.image) {
        newImage = key;
        updated = true;
      }
    }

    if (Array.isArray(newMultimedia)) {
      const updatedMultimedia = [];
      for (const item of newMultimedia) {
        if (typeof item === "string" && isSupabaseUrl(item)) {
          const key = await processUrl(
            item,
            petition.id,
            petition.user_id,
            "petitions",
          );
          if (key && key !== item) {
            updatedMultimedia.push(key);
            updated = true;
          } else {
            updatedMultimedia.push(item);
          }
        } else {
          updatedMultimedia.push(item);
        }
      }
      newMultimedia = updatedMultimedia;
    }

    if (updated && !DRY_RUN) {
      await prisma.petitions.update({
        where: { id: petition.id },
        data: { image: newImage, multimedia: newMultimedia },
        select: { id: true },
      });
    }
  }
}

async function migrateKyc() {
  console.log("--- Migrating KYC ---");
  const kycs = await prisma.kyc_verifications.findMany({
    select: { id: true, user_id: true, document_url: true },
  });

  console.log(`Found ${kycs.length} KYC documents to check.`);

  for (const kyc of kycs) {
    if (kyc.document_url) {
      console.log(
        `Checking KYC ID: ${kyc.id}, URL: ${kyc.document_url}, isSupabase: ${isSupabaseUrl(kyc.document_url)}`,
      );
    }
    if (kyc.document_url && isSupabaseUrl(kyc.document_url)) {
      console.log(`Checking KYC ID: ${kyc.id}`);
      const newKey = await processUrl(
        kyc.document_url,
        kyc.id,
        kyc.user_id,
        "documents",
      );
      if (newKey && newKey !== kyc.document_url && !DRY_RUN) {
        await prisma.kyc_verifications.update({
          where: { id: kyc.id },
          data: { document_url: newKey },
          select: { id: true },
        });
      }
    }
  }
}

async function main() {
  if (DRY_RUN) {
    console.log("=====================================");
    console.log("    RUNNING IN DRY-RUN MODE");
    console.log("    No files will be uploaded,");
    console.log("    No DB records will be updated.");
    console.log("=====================================");
  }

  try {
    await migrateProfiles();
    await migrateCauses();
    await migratePetitions();
    await migrateKyc();
    console.log("Migration completed.");
  } catch (error) {
    console.error("Migration failed:", error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
