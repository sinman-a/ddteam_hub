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
import { Loader2, Upload, X } from "lucide-react";
import { profileSchema, type ProfileInput } from "@/lib/validations";
import type { TeamProfile } from "@/types/profile";

interface ProfileFormProps {
  profile?: TeamProfile;
  onSuccess: () => void;
  onCancel: () => void;
}

export function ProfileForm({ profile, onSuccess, onCancel }: ProfileFormProps) {
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [photoUrl, setPhotoUrl] = useState(profile?.photoUrl ?? "");
  const [tagInput, setTagInput] = useState("");
  const [tags, setTags] = useState<string[]>(profile?.stackTags ?? []);

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
    const t = tagInput.trim();
    if (t && !tags.includes(t)) {
      const newTags = [...tags, t];
      setTags(newTags);
      setValue("stackTags", newTags);
    }
    setTagInput("");
  };

  const removeTag = (tag: string) => {
    const newTags = tags.filter((t) => t !== tag);
    setTags(newTags);
    setValue("stackTags", newTags);
  };

  const onSubmit = async (data: ProfileInput) => {
    setLoading(true);
    const body = { ...data, photoUrl, stackTags: tags };

    const url = profile ? `/api/profiles/${profile.id}` : "/api/profiles";
    const method = profile ? "PATCH" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    setLoading(false);
    if (res.ok) onSuccess();
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
              {uploading ? "Завантаження..." : "Оновити фото"}
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
          <p className="text-xs text-gray-400">JPG, PNG до 5MB</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label className="text-sm">Ім&apos;я</Label>
          <Input className="rounded-xl" {...register("name")} />
          {errors.name && <p className="text-xs text-red-500">{errors.name.message}</p>}
        </div>
        <div className="space-y-1.5">
          <Label className="text-sm">Роль</Label>
          <Input className="rounded-xl" placeholder="Frontend Developer" {...register("roleTitle")} />
          {errors.roleTitle && <p className="text-xs text-red-500">{errors.roleTitle.message}</p>}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label className="text-sm">GitHub URL</Label>
          <Input className="rounded-xl" placeholder="https://github.com/..." {...register("github")} />
        </div>
        <div className="space-y-1.5">
          <Label className="text-sm">LinkedIn URL</Label>
          <Input className="rounded-xl" placeholder="https://linkedin.com/in/..." {...register("linkedin")} />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label className="text-sm">Дата старту</Label>
        <Input type="date" className="rounded-xl" {...register("startDate")} />
      </div>

      <div className="space-y-1.5">
        <Label className="text-sm">Стек технологій</Label>
        <div className="flex gap-2">
          <Input
            className="rounded-xl flex-1"
            placeholder="React, TypeScript..."
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addTag(); } }}
          />
          <Button type="button" variant="outline" className="rounded-xl" onClick={addTag}>+</Button>
        </div>
        <div className="flex flex-wrap gap-1.5 mt-2">
          {tags.map((tag) => (
            <Badge key={tag} variant="secondary" className="rounded-full gap-1 pl-3">
              {tag}
              <button type="button" onClick={() => removeTag(tag)}>
                <X size={10} />
              </button>
            </Badge>
          ))}
        </div>
      </div>

      <div className="space-y-1.5">
        <Label className="text-sm">BIO (Markdown)</Label>
        <Textarea
          className="rounded-xl min-h-[120px] font-mono text-sm"
          placeholder="# Про мене..."
          {...register("bioMd")}
        />
      </div>

      <div className="flex justify-end gap-3 pt-2">
        <Button type="button" variant="outline" className="rounded-xl" onClick={onCancel}>
          Скасувати
        </Button>
        <Button type="submit" disabled={loading} className="rounded-xl bg-gray-900 hover:bg-gray-800">
          {loading && <Loader2 size={14} className="animate-spin mr-2" />}
          {profile ? "Зберегти" : "Додати"}
        </Button>
      </div>
    </form>
  );
}
