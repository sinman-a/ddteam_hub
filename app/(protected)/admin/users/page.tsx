"use client";

import { useEffect, useState } from "react";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DiagonalGrid } from "@/components/backgrounds/DiagonalGrid";
import { FadeInSection } from "@/components/animations/FadeInSection";
import { formatDate } from "@/lib/utils";
import { useSession } from "next-auth/react";
import { useLocale } from "@/lib/locale-context";

interface User {
  id: string;
  email: string;
  role: string;
  createdAt: string;
}

const ROLE_COLORS: Record<string, string> = {
  admin: "bg-gray-900 text-white",
  member: "bg-blue-100 text-blue-700",
  viewer: "bg-gray-100 text-gray-600",
};

export default function AdminUsersPage() {
  const { data: session } = useSession();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const { t } = useLocale();

  const fetchUsers = async () => {
    const res = await fetch("/api/users");
    if (res.ok) setUsers(await res.json());
    setLoading(false);
  };

  useEffect(() => { fetchUsers(); }, []);

  const handleRoleChange = async (id: string, role: string) => {
    await fetch(`/api/users/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role }),
    });
    await fetchUsers();
  };

  const handleDelete = async (id: string) => {
    if (!confirm(t("admin.confirm_delete_user"))) return;
    await fetch(`/api/users/${id}`, { method: "DELETE" });
    await fetchUsers();
  };

  return (
    <DiagonalGrid>
      <div className="max-w-5xl mx-auto px-6 py-12">
        <FadeInSection>
          <p className="text-xs font-semibold text-gray-600 uppercase tracking-widest mb-2">
            {t("admin.section_label")}
          </p>
          <h1 className="text-4xl font-black tracking-tightest text-gradient mb-8">
            {t("admin.users_title")}
          </h1>
        </FadeInSection>

        <FadeInSection delay={0.1}>
          <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50/50">
                  <TableHead className="text-xs font-semibold text-gray-500">{t("admin.users_col_email")}</TableHead>
                  <TableHead className="text-xs font-semibold text-gray-500">{t("admin.users_col_role")}</TableHead>
                  <TableHead className="text-xs font-semibold text-gray-500">{t("admin.users_col_registered")}</TableHead>
                  <TableHead className="text-right text-xs font-semibold text-gray-500">{t("admin.users_col_actions")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center text-gray-400 py-8">
                      {t("common.loading")}
                    </TableCell>
                  </TableRow>
                ) : (
                  users.map((user) => (
                    <TableRow key={user.id} className="hover:bg-gray-50/50">
                      <TableCell className="font-medium text-sm text-gray-900">
                        {user.email}
                        {user.id === session?.user.id && (
                          <span className="ml-2 text-xs text-gray-400">{t("admin.users_you")}</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {user.id !== session?.user.id ? (
                          <Select
                            defaultValue={user.role}
                            onValueChange={(v) => handleRoleChange(user.id, v)}
                          >
                            <SelectTrigger className="w-28 h-7 rounded-lg text-xs border-gray-200">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="rounded-xl">
                              <SelectItem value="admin" className="text-xs">admin</SelectItem>
                              <SelectItem value="member" className="text-xs">member</SelectItem>
                              <SelectItem value="viewer" className="text-xs">viewer</SelectItem>
                            </SelectContent>
                          </Select>
                        ) : (
                          <Badge className={`${ROLE_COLORS[user.role]} rounded-full text-xs`}>
                            {user.role}
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-sm text-gray-500">
                        {formatDate(user.createdAt)}
                      </TableCell>
                      <TableCell className="text-right">
                        {user.id !== session?.user.id && (
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-7 w-7 p-0 rounded-lg text-red-400 hover:text-red-600 hover:bg-red-50"
                            onClick={() => handleDelete(user.id)}
                          >
                            <Trash2 size={13} />
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </FadeInSection>

        <FadeInSection delay={0.2}>
          <div className="mt-6 p-4 bg-amber-50 rounded-2xl border border-amber-100">
            <p className="text-sm text-amber-800">
              <strong>{t("admin.users_invite")}</strong> {t("admin.users_invite_hint")}{" "}
              <code className="bg-amber-100 px-1.5 py-0.5 rounded text-xs">
                {typeof window !== "undefined" ? window.location.origin : ""}
                /login?register=true
              </code>{" "}
              {t("admin.users_invite_suffix")}
            </p>
          </div>
        </FadeInSection>
      </div>
    </DiagonalGrid>
  );
}
