"use client";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

export function BackButton({ label }: { label: string }) {
  const router = useRouter();
  return (
    <button
      onClick={() => router.back()}
      className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors mb-6"
    >
      <ArrowLeft className="w-4 h-4" />
      {label}
    </button>
  );
}
