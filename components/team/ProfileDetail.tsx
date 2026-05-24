"use client";

import Image from "next/image";
import Link from "next/link";
import { GitBranch, ExternalLink, Calendar, ArrowLeft } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Badge } from "@/components/ui/badge";
import { FadeInSection } from "@/components/animations/FadeInSection";
import { formatDate } from "@/lib/utils";
import type { TeamProfile } from "@/types/profile";
import { useLocale } from "@/lib/locale-context";

export function ProfileDetail({ profile }: { profile: TeamProfile }) {
  const { t } = useLocale();

  return (
    <div className="max-w-3xl mx-auto px-6 py-12">
      <FadeInSection>
        <Link
          href="/team"
          className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 transition-colors mb-8"
        >
          <ArrowLeft size={14} />
          {t("team.back")}
        </Link>
      </FadeInSection>

      <FadeInSection delay={0.1}>
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-8 mb-10">
          {profile.photoUrl ? (
            <div className="w-28 h-28 rounded-3xl overflow-hidden ring-2 ring-gray-200 shadow-xl flex-shrink-0">
              <Image
                src={profile.photoUrl}
                alt={profile.name}
                width={112}
                height={112}
                className="object-cover w-full h-full"
              />
            </div>
          ) : (
            <div className="w-28 h-28 rounded-3xl bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center shadow-xl flex-shrink-0">
              <span className="text-4xl font-bold text-gray-500">
                {profile.name.slice(0, 2).toUpperCase()}
              </span>
            </div>
          )}

          <div className="text-center sm:text-left">
            <h1 className="text-3xl font-bold tracking-tightest text-gray-900">
              {profile.name}
            </h1>
            <p className="text-lg text-gray-500 mt-1">{profile.roleTitle}</p>

            <div className="flex items-center gap-4 mt-4 justify-center sm:justify-start">
              {profile.github && (
                <a
                  href={profile.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-sm text-gray-600 hover:text-gray-900 transition-colors"
                >
                  <GitBranch size={16} />
                  GitHub
                </a>
              )}
              {profile.linkedin && (
                <a
                  href={profile.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-sm text-blue-600 hover:text-blue-800 transition-colors"
                >
                  <ExternalLink size={16} />
                  LinkedIn
                </a>
              )}
              {profile.startDate && (
                <span className="flex items-center gap-1.5 text-sm text-gray-500">
                  <Calendar size={14} />
                  {t("team.since")} {formatDate(profile.startDate)}
                </span>
              )}
            </div>
          </div>
        </div>
      </FadeInSection>

      {profile.stackTags && profile.stackTags.length > 0 && (
        <FadeInSection delay={0.2}>
          <div className="mb-8">
            <h2 className="text-sm font-semibold text-gray-600 uppercase tracking-widest mb-3">
              {t("team.tech_stack")}
            </h2>
            <div className="flex flex-wrap gap-2">
              {profile.stackTags.map((tag) => (
                <Badge key={tag} variant="secondary" className="rounded-full px-3">
                  {tag}
                </Badge>
              ))}
            </div>
          </div>
        </FadeInSection>
      )}

      {profile.bioMd && (
        <FadeInSection delay={0.3}>
          <div className="prose prose-gray max-w-none">
            <h2 className="text-sm font-semibold text-gray-600 uppercase tracking-widest mb-4">
              {t("team.about")}
            </h2>
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {profile.bioMd}
            </ReactMarkdown>
          </div>
        </FadeInSection>
      )}
    </div>
  );
}
