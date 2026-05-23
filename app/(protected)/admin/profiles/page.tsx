"use client";

import { useState } from "react";
import Image from "next/image";
import { Plus, Pencil, Trash2, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { DiagonalGrid } from "@/components/backgrounds/DiagonalGrid";
import { FadeInSection } from "@/components/animations/FadeInSection";
import { StaggerContainer, StaggerItem } from "@/components/animations/StaggerContainer";
import { ProfileForm } from "@/components/admin/ProfileForm";
import { useProfiles } from "@/hooks/useProfiles";
import type { TeamProfile } from "@/types/profile";

export default function AdminProfilesPage() {
  const { profiles, isLoading, mutate } = useProfiles();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<TeamProfile | undefined>();

  const handleEdit = (profile: TeamProfile) => {
    setEditing(profile);
    setOpen(true);
  };

  const handleAdd = () => {
    setEditing(undefined);
    setOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Видалити профіль?")) return;
    await fetch(`/api/profiles/${id}`, { method: "DELETE" });
    await mutate();
  };

  const handleSuccess = () => {
    setOpen(false);
    mutate();
  };

  return (
    <DiagonalGrid>
      <div className="max-w-6xl mx-auto px-6 py-12">
        <FadeInSection>
          <div className="flex items-center justify-between mb-8">
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-2">
                Адмін
              </p>
              <h1 className="text-4xl font-black tracking-tightest text-gradient">
                Профілі команди
              </h1>
            </div>
            <Button
              onClick={handleAdd}
              className="rounded-2xl bg-gray-900 hover:bg-gray-800 gap-2 h-11"
            >
              <Plus size={16} />
              Додати учасника
            </Button>
          </div>
        </FadeInSection>

        {isLoading ? (
          <div className="text-center text-gray-400 py-16">Завантаження...</div>
        ) : (
          <StaggerContainer className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {profiles.map((profile) => (
              <StaggerItem key={profile.id}>
                <div className="bg-white rounded-2xl border border-gray-100 p-5 hover:shadow-md transition-all">
                  <div className="flex items-center gap-3 mb-3">
                    {profile.photoUrl ? (
                      <div className="w-12 h-12 rounded-xl overflow-hidden">
                        <Image
                          src={profile.photoUrl}
                          alt={profile.name}
                          width={48}
                          height={48}
                          className="object-cover"
                        />
                      </div>
                    ) : (
                      <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center">
                        <User size={20} className="text-gray-400" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-900 text-sm truncate">
                        {profile.name}
                      </p>
                      <p className="text-xs text-gray-500 truncate">{profile.roleTitle}</p>
                    </div>
                  </div>

                  {profile.stackTags && profile.stackTags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-3">
                      {profile.stackTags.slice(0, 3).map((tag) => (
                        <Badge key={tag} variant="secondary" className="text-xs rounded-full">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  )}

                  <div className="flex items-center gap-2 justify-end">
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-8 w-8 p-0 rounded-lg"
                      onClick={() => handleEdit(profile)}
                    >
                      <Pencil size={14} />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-8 w-8 p-0 rounded-lg text-red-500 hover:text-red-700 hover:bg-red-50"
                      onClick={() => handleDelete(profile.id)}
                    >
                      <Trash2 size={14} />
                    </Button>
                  </div>
                </div>
              </StaggerItem>
            ))}
          </StaggerContainer>
        )}

        {!isLoading && profiles.length === 0 && (
          <FadeInSection>
            <div className="text-center py-20 text-gray-400">
              <User size={40} className="mx-auto mb-4 opacity-30" />
              <p className="text-lg font-medium mb-1">Профілів ще немає</p>
              <p className="text-sm">Додайте першого учасника команди</p>
            </div>
          </FadeInSection>
        )}

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent className="rounded-2xl max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-lg font-bold tracking-tight">
                {editing ? "Редагувати профіль" : "Додати учасника"}
              </DialogTitle>
            </DialogHeader>
            <ProfileForm
              profile={editing}
              onSuccess={handleSuccess}
              onCancel={() => setOpen(false)}
            />
          </DialogContent>
        </Dialog>
      </div>
    </DiagonalGrid>
  );
}
