"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { CheckCircle2, XCircle, Loader2, Plug } from "lucide-react";
import { azureSettingsSchema, type AzureSettingsInput } from "@/lib/validations";
import { useLocale } from "@/lib/locale-context";

interface IntegrationFormProps {
  currentSettings: { org: string; project: string; lastSyncAt: string | null } | null;
}

export function IntegrationForm({ currentSettings }: IntegrationFormProps) {
  const [status, setStatus] = useState<"idle" | "saving" | "testing" | "ok" | "error">("idle");
  const [message, setMessage] = useState("");
  const { t } = useLocale();

  const { register, handleSubmit, formState: { errors } } = useForm<AzureSettingsInput>({
    resolver: zodResolver(azureSettingsSchema),
    defaultValues: {
      org: currentSettings?.org ?? "",
      project: currentSettings?.project ?? "",
    },
  });

  const onSubmit = async (data: AzureSettingsInput) => {
    setStatus("saving");
    const res = await fetch("/api/integration", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      setStatus("error");
      setMessage(t("admin.integration_error_save"));
      return;
    }

    setStatus("testing");
    setMessage(t("admin.integration_testing"));

    const syncRes = await fetch("/api/sync");
    if (syncRes.ok) {
      setStatus("ok");
      setMessage(t("admin.integration_success"));
    } else {
      setStatus("error");
      setMessage(t("admin.integration_error_sync"));
    }
  };

  return (
    <Card className="rounded-2xl border-gray-100 max-w-lg">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Plug size={18} className="text-gray-500" />
          <CardTitle className="text-lg font-bold tracking-tight">{t("admin.integration_title")}</CardTitle>
        </div>
        <CardDescription>
          {t("admin.integration_connect")}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {currentSettings?.lastSyncAt && (
          <div className="flex items-center gap-2 text-xs text-green-600 bg-green-50 rounded-xl px-3 py-2 mb-4">
            <CheckCircle2 size={14} />
            {t("admin.integration_last_sync")} {new Date(currentSettings.lastSyncAt).toLocaleString("uk-UA")}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-1.5">
            <Label className="text-sm text-gray-700">{t("admin.integration_org")}</Label>
            <Input
              placeholder="mycompany"
              className="rounded-xl"
              {...register("org")}
            />
            {errors.org && <p className="text-xs text-red-500">{errors.org.message}</p>}
          </div>

          <div className="space-y-1.5">
            <Label className="text-sm text-gray-700">{t("admin.integration_project")}</Label>
            <Input
              placeholder="MyProject"
              className="rounded-xl"
              {...register("project")}
            />
            {errors.project && <p className="text-xs text-red-500">{errors.project.message}</p>}
          </div>

          <div className="space-y-1.5">
            <Label className="text-sm text-gray-700">{t("admin.integration_pat")}</Label>
            <Input
              type="password"
              placeholder="••••••••••••••••"
              className="rounded-xl"
              {...register("pat")}
            />
            {errors.pat && <p className="text-xs text-red-500">{errors.pat.message}</p>}
            <p className="text-xs text-gray-400">
              {t("admin.integration_pat_hint")}
            </p>
          </div>

          {message && (
            <div className={`flex items-center gap-2 text-xs rounded-xl px-3 py-2 ${
              status === "ok"
                ? "text-green-700 bg-green-50"
                : status === "error"
                ? "text-red-700 bg-red-50"
                : "text-blue-700 bg-blue-50"
            }`}>
              {status === "ok" && <CheckCircle2 size={14} />}
              {status === "error" && <XCircle size={14} />}
              {status === "testing" && <Loader2 size={14} className="animate-spin" />}
              {message}
            </div>
          )}

          <Button
            type="submit"
            disabled={status === "saving" || status === "testing"}
            className="w-full rounded-xl bg-gray-900 hover:bg-gray-800 h-11"
          >
            {(status === "saving" || status === "testing") && (
              <Loader2 size={14} className="animate-spin mr-2" />
            )}
            {t("admin.integration_save")}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
