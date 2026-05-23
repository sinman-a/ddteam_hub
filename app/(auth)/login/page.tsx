"use client";

import { Suspense, useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import { WavyBackground } from "@/components/ui/wavy";
import { FadeInSection } from "@/components/animations/FadeInSection";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { loginSchema, type LoginInput } from "@/lib/validations";
import { useLocale } from "@/lib/locale-context";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const { t } = useLocale();

  const isRegister = searchParams.get("register") === "true" || mode === "register";

  const { register, handleSubmit, formState: { errors } } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginInput) => {
    setLoading(true);
    setError("");
    setSuccess("");

    if (isRegister) {
      const res = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const json = await res.json();
        setError(json.error || t("auth.error_register"));
        setLoading(false);
        return;
      }
      // Try auto-sign-in after successful registration
      const autoResult = await signIn("credentials", {
        email: data.email,
        password: data.password,
        redirect: false,
      });
      if (!autoResult?.error) {
        router.push("/dashboard");
        router.refresh();
        return;
      }
      // Auto-sign-in failed (cold-start issue) — switch to login with success message
      setMode("login");
      setSuccess(t("auth.register_success"));
      setLoading(false);
      return;
    }

    const result = await signIn("credentials", {
      email: data.email,
      password: data.password,
      redirect: false,
    });

    if (result?.error) {
      setError(t("auth.error_invalid"));
      setLoading(false);
      return;
    }

    router.push("/dashboard");
    router.refresh();
  };

  return (
    <motion.div
      className="w-full max-w-sm bg-white/5 backdrop-blur-2xl border border-white/10 rounded-3xl p-8 shadow-2xl"
      initial={{ opacity: 0, y: 32 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] }}
    >
      <div className="text-center mb-10">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500/30 to-blue-900/50 border border-white/20 mx-auto mb-6 flex items-center justify-center shadow-lg">
          <span className="text-white text-lg font-bold">DD</span>
        </div>
        <h1 className="text-3xl font-bold tracking-tightest text-white mb-2">
          DDTeam Hub
        </h1>
        <p className="text-gray-400 text-sm">
          {isRegister ? t("auth.register_title") : t("auth.sign_in_title")}
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="email" className="text-sm font-medium text-gray-300">
            {t("auth.email_label")}
          </Label>
          <Input
            id="email"
            type="email"
            placeholder="you@company.com"
            className="h-11 rounded-xl border-white/20 bg-white/10 text-white placeholder:text-gray-600 focus:border-blue-400/50 focus-visible:ring-blue-400/30"
            {...register("email")}
          />
          {errors.email && (
            <p className="text-xs text-red-400">{errors.email.message}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="password" className="text-sm font-medium text-gray-300">
            {t("auth.password_label")}
          </Label>
          <Input
            id="password"
            type="password"
            placeholder="••••••••"
            className="h-11 rounded-xl border-white/20 bg-white/10 text-white placeholder:text-gray-600 focus:border-blue-400/50 focus-visible:ring-blue-400/30"
            {...register("password")}
          />
          {errors.password && (
            <p className="text-xs text-red-400">{errors.password.message}</p>
          )}
        </div>

        {success && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-sm text-green-400 text-center"
          >
            {success}
          </motion.p>
        )}

        {error && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-sm text-red-400 text-center"
          >
            {error}
          </motion.p>
        )}

        <Button
          type="submit"
          disabled={loading}
          className="w-full h-11 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-medium text-sm transition-all duration-200 mt-2 border-0"
        >
          {loading
            ? t("auth.loading_button")
            : isRegister
            ? t("auth.submit_register")
            : t("auth.submit_login")}
        </Button>
      </form>

      <div className="mt-6 text-center">
        <button
          type="button"
          onClick={() => setMode(isRegister ? "login" : "register")}
          className="text-sm text-gray-400 hover:text-white transition-colors"
        >
          {isRegister
            ? t("auth.switch_to_login")
            : t("auth.switch_to_register")}
        </button>
      </div>
    </motion.div>
  );
}

export default function LoginPage() {
  return (
    <WavyBackground>
      <div className="px-4">
        <FadeInSection>
          <Suspense fallback={
            <div className="w-full max-w-sm animate-pulse bg-white/5 backdrop-blur-2xl border border-white/10 rounded-3xl p-8">
              <div className="h-12 w-12 rounded-2xl bg-white/10 mx-auto mb-6" />
              <div className="h-8 bg-white/10 rounded-xl mb-4" />
              <div className="h-11 bg-white/10 rounded-xl mb-3" />
              <div className="h-11 bg-white/10 rounded-xl" />
            </div>
          }>
            <LoginForm />
          </Suspense>
        </FadeInSection>
      </div>
    </WavyBackground>
  );
}
