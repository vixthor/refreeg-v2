"use server";

import { listUsersWithRoles } from "@/actions/role-actions";
import type { UserWithRole } from "@/types";

/**
 * Export active users data to CSV format
 */
export async function exportUsersToCSV(): Promise<{
  csv: string;
  error: string | null;
}> {
  try {
    const users = await listUsersWithRoles();

    // Filter only active users (not blocked)
    const activeUsers = users.filter((user) => !user.is_blocked);

    // CSV Headers
    const headers = [
      "ID",
      "Full Name",
      "Email",
      "Role",
      "KYC Status",
      "Joined Date",
    ];

    // CSV Rows
    const rows = activeUsers.map((user: UserWithRole) => {
      return [
        user.id,
        user.full_name || "N/A",
        user.email,
        user.role,
        user.kyc_status || "Not Submitted",
        new Date(user.created_at).toLocaleDateString(),
      ].map((field) => {
        // Escape commas and quotes in CSV
        const stringField = String(field);
        if (stringField.includes(",") || stringField.includes('"')) {
          return `"${stringField.replace(/"/g, '""')}"`;
        }
        return stringField;
      });
    });

    // Combine headers and rows
    const csvContent = [
      headers.join(","),
      ...rows.map((row) => row.join(",")),
    ].join("\n");

    return { csv: csvContent, error: null };
  } catch (error) {
    console.error("Error exporting users to CSV:", error);
    return {
      csv: "",
      error:
        error instanceof Error
          ? error.message
          : "Failed to export users to CSV",
    };
  }
}
