"use client";

export function SoftYellowGlow({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen w-full relative bg-white overflow-hidden">
      <div
        className="absolute inset-0 z-0 pointer-events-none"
        style={{
          backgroundImage:
            "radial-gradient(circle at center, #FFF991 0%, transparent 70%)",
          opacity: 0.6,
          mixBlendMode: "multiply",
        }}
      />
      <div className="relative z-10">{children}</div>
    </div>
  );
}
