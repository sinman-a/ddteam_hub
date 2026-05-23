"use client";

import { Suspense, useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import { SoftYellowGlow } from "@/components/backgrounds/SoftYellowGlow";
import { FadeInSection } from "@/components/animations/FadeInSection";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { loginSchema, type LoginInput } from "@/lib/validations";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const isRegister = searchParams.get("register") === "true" || mode === "register";

  const { register, handleSubmit, formState: { errors } } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginInput) => {
    setLoading(true);
    setError("");

    if (isRegister) {
      const res = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const json = await res.json();
        setError(json.error || "Помилка реєстрації");
        setLoading(false);
        return;
      }
    }

    const result = await signIn("credentials", {
      email: data.email,
      password: data.password,
      redirect: false,
    });

    if (result?.error) {
      setError("Невірний email або пароль");
      setLoading(false);
      return;
    }

    router.push("/dashboard");
    router.refresh();
  };

  return (
    <motion.div
      className="w-full max-w-sm"
      initial={{ opacity: 0, y: 32 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] }}
    >
      <div className="text-center mb-10">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-gray-900 to-gray-700 mx-auto mb-6 flex items-center justify-center shadow-lg">
          <span className="text-white text-lg font-bold">DD</span>
        </div>
        <h1 className="text-3xl font-bold tracking-tightest text-gray-900 mb-2">
          DDTeam Hub
        </h1>
        <p className="text-gray-500 text-sm">
          {isRegister ? "Створіть свій акаунт" : "Увійдіть у свій акаунт"}
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="email" className="text-sm font-medium text-gray-700">
            Email
          </Label>
          <Input
            id="email"
            type="email"
            placeholder="you@company.com"
            className="h-11 rounded-xl border-gray-200 bg-white/60 backdrop-blur-sm"
            {...register("email")}
          />
          {errors.email && (
            <p className="text-xs text-red-500">{errors.email.message}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="password" className="text-sm font-medium text-gray-700">
            Пароль
          </Label>
          <Input
            id="password"
            type="password"
            placeholder="••••••••"
            className="h-11 rounded-xl border-gray-200 bg-white/60 backdrop-blur-sm"
            {...register("password")}
          />
          {errors.password && (
            <p className="text-xs text-red-500">{errors.password.message}</p>
          )}
        </div>

        {error && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-sm text-red-500 text-center"
          >
            {error}
          </motion.p>
        )}

        <Button
          type="submit"
          disabled={loading}
          className="w-full h-11 rounded-xl bg-gray-900 hover:bg-gray-800 text-white font-medium text-sm transition-all duration-200 mt-2"
        >
          {loading
            ? "Зачекайте..."
            : isRegister
            ? "Зареєструватись"
            : "Увійти"}
        </Button>
      </form>

      <div className="mt-6 text-center">
        <button
          type="button"
          onClick={() => setMode(isRegister ? "login" : "register")}
          className="text-sm text-gray-500 hover:text-gray-900 transition-colors"
        >
          {isRegister
            ? "Вже маєте акаунт? Увійти"
            : "Немає акаунту? Зареєструватись"}
        </button>
      </div>
    </motion.div>
  );
}

export default function LoginPage() {
  return (
    <SoftYellowGlow>
      <div className="min-h-screen flex flex-col items-center justify-center px-4">
        <FadeInSection>
          <Suspense fallback={
            <div className="w-full max-w-sm animate-pulse">
              <div className="h-12 w-12 rounded-2xl bg-gray-200 mx-auto mb-6" />
              <div className="h-8 bg-gray-200 rounded-xl mb-4" />
              <div className="h-11 bg-gray-200 rounded-xl mb-3" />
              <div className="h-11 bg-gray-200 rounded-xl" />
            </div>
          }>
            <LoginForm />
          </Suspense>
        </FadeInSection>
      </div>
    </SoftYellowGlow>
  );
}
