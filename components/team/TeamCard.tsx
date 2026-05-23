"use client";

import Link from "next/link";
import Image from "next/image";
import { GitBranch, ExternalLink, Calendar } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { StaggerItem } from "@/components/animations/StaggerContainer";
import { formatDate } from "@/lib/utils";
import type { TeamProfile } from "@/types/profile";

export function TeamCard({ profile }: { profile: TeamProfile }) {
  return (
    <StaggerItem>
      <Link href={`/team/${profile.id}`} className="block group">
        <div className="bg-white rounded-3xl p-6 border border-gray-100 hover:border-gray-200 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
          <div className="flex flex-col items-center text-center gap-4">
            <div className="relative">
              {profile.photoUrl ? (
                <div className="w-20 h-20 rounded-2xl overflow-hidden ring-2 ring-gray-100 group-hover:ring-gray-300 transition-all">
                  <Image
                    src={profile.photoUrl}
                    alt={profile.name}
                    width={80}
                    height={80}
                    className="object-cover w-full h-full"
                  />
                </div>
              ) : (
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center ring-2 ring-gray-100">
                  <span className="text-2xl font-bold text-gray-500">
                    {profile.name.slice(0, 2).toUpperCase()}
                  </span>
                </div>
              )}
            </div>

            <div>
              <h3 className="font-semibold text-gray-900 tracking-tight text-base">
                {profile.name}
              </h3>
              <p className="text-sm text-gray-500 mt-0.5">{profile.roleTitle}</p>
            </div>

            {profile.stackTags && profile.stackTags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 justify-center">
                {profile.stackTags.slice(0, 4).map((tag) => (
                  <Badge
                    key={tag}
                    variant="secondary"
                    className="text-xs rounded-full px-2.5 py-0.5"
                  >
                    {tag}
                  </Badge>
                ))}
              </div>
            )}

            <div className="flex items-center gap-3 text-gray-400">
              {profile.github && (
                <a
                  href={profile.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="hover:text-gray-700 transition-colors"
                >
                  <GitBranch size={16} />
                </a>
              )}
              {profile.linkedin && (
                <a
                  href={profile.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="hover:text-blue-600 transition-colors"
                >
                  <ExternalLink size={16} />
                </a>
              )}
              {profile.startDate && (
                <span className="flex items-center gap-1 text-xs">
                  <Calendar size={12} />
                  {formatDate(profile.startDate)}
                </span>
              )}
            </div>
          </div>
        </div>
      </Link>
    </StaggerItem>
  );
}
