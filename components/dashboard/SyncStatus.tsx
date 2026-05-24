"use client";

import { RefreshCw, AlertCircle, CheckCircle2 } from "lucide-react";
import { formatDate } from "@/lib/utils";
import { useState } from "react";
import { useLocale } from "@/lib/locale-context";

interface SyncStatusProps {
  lastSyncAt: string | null;
  onManualSync?: () => void;
}

export function SyncStatus({ lastSyncAt, onManualSync }: SyncStatusProps) {
  const [syncing, setSyncing] = useState(false);
  const { t } = useLocale();

  const handleSync = async () => {
    setSyncing(true);
    await onManualSync?.();
    setSyncing(false);
  };

  const isStale =
    lastSyncAt &&
    Date.now() - new Date(lastSyncAt).getTime() > 20 * 60 * 1000;

  return (
    <div className="flex items-center gap-2 text-xs">
      {lastSyncAt ? (
        <div className="flex items-center gap-1.5 text-gray-600">
          {isStale ? (
            <AlertCircle size={12} className="text-amber-500" />
          ) : (
            <CheckCircle2 size={12} className="text-green-500" />
          )}
          <span>{t("dashboard.sync_updated")} {formatDate(lastSyncAt)}</span>
        </div>
      ) : (
        <div className="flex items-center gap-1.5 text-gray-600">
          <AlertCircle size={12} className="text-gray-300" />
          <span>{t("dashboard.sync_never")}</span>
        </div>
      )}

      {onManualSync && (
        <button
          onClick={handleSync}
          disabled={syncing}
          aria-label={t("dashboard.sync_now")}
          className="flex items-center gap-1 text-gray-600 hover:text-gray-900 transition-colors ml-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-900 focus-visible:ring-offset-1 rounded-sm"
        >
          <RefreshCw size={12} className={syncing ? "animate-spin" : ""} />
        </button>
      )}
    </div>
  );
}
