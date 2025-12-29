"use client";

import { NotificationsForm } from "../notifications-form";
import { SettingsShell } from "../components/settings-shell";

export default function NotificationsSettingsPage() {
  return (
    <SettingsShell>
      <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
        <div className="p-6 space-y-4">
          <h2 className="text-lg font-semibold">Notification Settings</h2>
          <NotificationsForm />
        </div>
      </div>
    </SettingsShell>
  );
}
