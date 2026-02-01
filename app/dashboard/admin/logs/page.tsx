import AdminLogs from "@/components/admin/AdminLogs";
import { listAdminLogs } from "@/actions/database-actions";

async function page() {
  try {
    const logs = await listAdminLogs();
    return (
      <div>
        <AdminLogs logs={logs} />
      </div>
    );
  } catch (error) {
    console.error("Error in Admin Logs page:", error);
    return (
      <div className="p-4 text-center text-red-500">
        <p>Failed to load admin logs.</p>
        <p className="text-sm text-gray-500 mt-2">
          {(error as Error).message || "Unknown error"}
        </p>
      </div>
    );
  }
}

export default page;
