"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, CheckCircle2, Loader2, Upload, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { profileSchema, type ProfileInput } from "@/lib/validations";
import type { TeamProfile } from "@/types/profile";
import { useLocale } from "@/lib/locale-context";

interface ProfileFormProps {
  profile?: TeamProfile;
  onSuccess: () => void;
  onCancel: () => void;
  createUrl?: string;
}

export function ProfileForm({ profile, onSuccess, onCancel, createUrl }: ProfileFormProps) {
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [photoUrl, setPhotoUrl] = useState(profile?.photoUrl ?? "");
  const [tagInput, setTagInput] = useState("");
  const [tags, setTags] = useState<string[]>(profile?.stackTags ?? []);
  const { t } = useLocale();

  const { register, handleSubmit, formState: { errors }, setValue } = useForm<ProfileInput>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: profile?.name ?? "",
      roleTitle: profile?.roleTitle ?? "",
      bioMd: profile?.bioMd ?? "",
      linkedin: profile?.linkedin ?? "",
      github: profile?.github ?? "",
      startDate: profile?.startDate ?? "",
      stackTags: profile?.stackTags ?? [],
    },
  });

  const fieldClass = (hasError: boolean) =>
    cn(
      "rounded-xl focus-visible:ring-2 focus-visible:ring-gray-900",
      hasError && "border-red-400 focus-visible:ring-red-400"
    );

  const handlePhotoUpload = async (file: File) => {
    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    const res = await fetch("/api/upload", { method: "POST", body: formData });
    if (res.ok) {
      const { url } = await res.json();
      setPhotoUrl(url);
      setValue("photoUrl", url);
    }
    setUploading(false);
  };

  const addTag = () => {
    const tag = tagInput.trim();
    if (tag && !tags.includes(tag)) {
      const newTags = [...tags, tag];
      setTags(newTags);
      setValue("stackTags", newTags);
    }
    setTagInput("");
  };

  const removeTag = (tag: string) => {
    const newTags = tags.filter((tg) => tg !== tag);
    setTags(newTags);
    setValue("stackTags", newTags);
  };

  const onSubmit = async (data: ProfileInput) => {
    setLoading(true);
    const body = { ...data, photoUrl, stackTags: tags };

    const url = profile ? `/api/profiles/${profile.id}` : (createUrl ?? "/api/profiles");
    const method = profile ? "PATCH" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    setLoading(false);
    if (res.ok) {
      setSuccess(true);
      onSuccess();
      setTimeout(() => setSuccess(false), 3000);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <div className="flex items-center gap-4">
        <div className="relative">
          {photoUrl ? (
            <div className="w-16 h-16 rounded-2xl overflow-hidden ring-2 ring-gray-200">
              <Image src={photoUrl} alt="Photo" width={64} height={64} className="object-cover" />
            </div>
          ) : (
            <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center">
              <Upload size={20} className="text-gray-400" />
            </div>
          )}
        </div>
        <div>
          <label className="cursor-pointer">
            <span className="text-sm text-gray-700 hover:text-gray-900 font-medium transition-colors">
              {uploading ? t("common.uploading") : t("profile_form.upload_photo")}
            </span>
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handlePhotoUpload(file);
              }}
            />
          </label>
          <p className="text-xs text-gray-500">{t("profile_form.photo_hint")}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="field-name" className="text-sm">{t("profile_form.name_label")}</Label>
          <Input
            id="field-name"
            className={fieldClass(!!errors.name)}
            aria-invalid={!!errors.name}
            aria-describedby={errors.name ? "name-error" : undefined}
            {...register("name")}
          />
          {errors.name && (
            <p id="name-error" role="alert" className="text-xs text-red-600 flex items-center gap-1 mt-0.5">
              <AlertCircle size={12} className="shrink-0" />
              {t("validation.required")}
            </p>
          )}
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="field-role" className="text-sm">{t("profile_form.role_label")}</Label>
          <Input
            id="field-role"
            className={fieldClass(!!errors.roleTitle)}
            aria-invalid={!!errors.roleTitle}
            aria-describedby={errors.roleTitle ? "role-error" : undefined}
            placeholder={t("profile_form.role_placeholder")}
            {...register("roleTitle")}
          />
          {errors.roleTitle && (
            <p id="role-error" role="alert" className="text-xs text-red-600 flex items-center gap-1 mt-0.5">
              <AlertCircle size={12} className="shrink-0" />
              {t("validation.required")}
            </p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="field-github" className="text-sm">{t("profile_form.github_label")}</Label>
          <Input
            id="field-github"
            className={fieldClass(!!errors.github)}
            aria-invalid={!!errors.github}
            aria-describedby={errors.github ? "github-error" : undefined}
            placeholder="https://github.com/..."
            {...register("github")}
          />
          {errors.github && (
            <p id="github-error" role="alert" className="text-xs text-red-600 flex items-center gap-1 mt-0.5">
              <AlertCircle size={12} className="shrink-0" />
              {t("validation.url")}
            </p>
          )}
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="field-linkedin" className="text-sm">{t("profile_form.linkedin_label")}</Label>
          <Input
            id="field-linkedin"
            className={fieldClass(!!errors.linkedin)}
            aria-invalid={!!errors.linkedin}
            aria-describedby={errors.linkedin ? "linkedin-error" : undefined}
            placeholder="https://linkedin.com/in/..."
            {...register("linkedin")}
          />
          {errors.linkedin && (
            <p id="linkedin-error" role="alert" className="text-xs text-red-600 flex items-center gap-1 mt-0.5">
              <AlertCircle size={12} className="shrink-0" />
              {t("validation.url")}
            </p>
          )}
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="field-start-date" className="text-sm">{t("profile_form.start_date_label")}</Label>
        <Input
          id="field-start-date"
          type="date"
          className={fieldClass(false)}
          {...register("startDate")}
        />
      </div>

      <div className="space-y-1.5">
        <Label className="text-sm">{t("profile_form.stack_label")}</Label>
        <div className="flex gap-2">
          <Input
            className={fieldClass(false) + " flex-1"}
            placeholder={t("profile_form.stack_placeholder")}
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addTag(); } }}
          />
          <Button type="button" variant="outline" className="rounded-xl" onClick={addTag} aria-label={t("common.add")}>
            +
          </Button>
        </div>
        <div className="flex flex-wrap gap-1.5 mt-2">
          {tags.map((tag) => (
            <Badge key={tag} variant="secondary" className="rounded-full gap-1 pl-3">
              {tag}
              <button
                type="button"
                onClick={() => removeTag(tag)}
                aria-label={`${t("common.delete")} ${tag}`}
                className="focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-gray-900 rounded-full"
              >
                <X size={10} />
              </button>
            </Badge>
          ))}
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="field-bio" className="text-sm">{t("profile_form.bio_label")}</Label>
        <Textarea
          id="field-bio"
          className="rounded-xl min-h-[120px] font-mono text-sm focus-visible:ring-2 focus-visible:ring-gray-900"
          placeholder={t("profile_form.bio_placeholder")}
          {...register("bioMd")}
        />
      </div>

      {success && (
        <div role="status" className="flex items-center gap-2 p-3 rounded-xl bg-green-50 border border-green-200 text-green-700 text-sm">
          <CheckCircle2 size={16} className="shrink-0" />
          {t("profile_form.save_success")}
        </div>
      )}

      <div className="flex justify-end gap-3 pt-2">
        <Button type="button" variant="outline" className="rounded-xl" onClick={onCancel}>
          {t("common.cancel")}
        </Button>
        <Button type="submit" disabled={loading} className="rounded-xl bg-gray-900 hover:bg-gray-800">
          {loading && <Loader2 size={14} className="animate-spin mr-2" />}
          {profile ? t("common.save") : t("common.add")}
        </Button>
      </div>
    </form>
  );
}
