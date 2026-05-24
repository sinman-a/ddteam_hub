"use client";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

export function BackButton({ label }: { label: string }) {
  const router = useRouter();
  return (
    <button
      onClick={() => router.back()}
      className="inline-flex items-center gap-2 text-sm text-gray-400 hover:underline hover:[text-underline-offset:0.1578em] transition-colors mb-6 rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-400 focus-visible:ring-offset-2"
    >
      <ArrowLeft className="w-4 h-4" />
      {label}
    </button>
  );
}
