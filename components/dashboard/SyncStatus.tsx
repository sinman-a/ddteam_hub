"use client";

import { RefreshCw, AlertCircle, CheckCircle2 } from "lucide-react";
import { formatDate } from "@/lib/utils";
import { useState } from "react";
import { Button } from "@/components/ui/button";

interface SyncStatusProps {
  lastSyncAt: string | null;
  onManualSync?: () => void;
}

export function SyncStatus({ lastSyncAt, onManualSync }: SyncStatusProps) {
  const [syncing, setSyncing] = useState(false);

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
        <div className="flex items-center gap-1.5 text-gray-400">
          {isStale ? (
            <AlertCircle size={12} className="text-amber-500" />
          ) : (
            <CheckCircle2 size={12} className="text-green-500" />
          )}
          <span>Оновлено: {formatDate(lastSyncAt)}</span>
        </div>
      ) : (
        <div className="flex items-center gap-1.5 text-gray-400">
          <AlertCircle size={12} className="text-gray-300" />
          <span>Дані не синхронізовані</span>
        </div>
      )}

      {onManualSync && (
        <button
          onClick={handleSync}
          disabled={syncing}
          className="flex items-center gap-1 text-gray-400 hover:text-gray-700 transition-colors ml-1"
          title="Синхронізувати зараз"
        >
          <RefreshCw size={12} className={syncing ? "animate-spin" : ""} />
        </button>
      )}
    </div>
  );
}
