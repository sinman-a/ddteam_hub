"use client";

import { motion, useInView, useMotionValue, useTransform, animate } from "framer-motion";
import { useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Info } from "lucide-react";
import type { KPIMetric } from "@/types/kpi";

function AnimatedNumber({ value, decimals = 0 }: { value: number; decimals?: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const motionValue = useMotionValue(0);
  const inView = useInView(ref, { once: true });

  useEffect(() => {
    if (!inView) return;
    const controls = animate(motionValue, value, {
      duration: 1.2,
      ease: [0.25, 0.46, 0.45, 0.94],
    });
    return controls.stop;
  }, [inView, value, motionValue]);

  useEffect(() => {
    return motionValue.on("change", (v) => {
      if (ref.current) {
        ref.current.textContent = v.toFixed(decimals);
      }
    });
  }, [motionValue, decimals]);

  return <span ref={ref}>0</span>;
}

interface KPIWidgetProps {
  metric: KPIMetric;
  loading?: boolean;
}

const UNIT_LABELS: Record<string, string> = {
  days: "дн",
  "per week": "/тиж",
  "%": "%",
  items: "задач",
};

export function KPIWidget({ metric, loading }: KPIWidgetProps) {
  if (loading) {
    return (
      <Card className="rounded-2xl border-gray-100">
        <CardHeader className="pb-2">
          <Skeleton className="h-4 w-24" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-10 w-16 mb-1" />
          <Skeleton className="h-3 w-32" />
        </CardContent>
      </Card>
    );
  }

  const value = metric.value ?? 0;
  const decimals = metric.unit === "%" || metric.unit === "per week" ? 1 : 1;
  const unitLabel = UNIT_LABELS[metric.unit] ?? metric.unit;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
    >
      <Card className="rounded-2xl border-gray-100 hover:border-gray-200 hover:shadow-md transition-all duration-300 bg-white/80 backdrop-blur-sm h-full">
        <CardHeader className="pb-2 flex flex-row items-center justify-between">
          <CardTitle className="text-sm font-medium text-gray-500">
            {metric.label}
          </CardTitle>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <Info size={14} className="text-gray-300 hover:text-gray-500 transition-colors" />
              </TooltipTrigger>
              <TooltipContent>
                <p className="text-xs max-w-[200px]">{metric.description}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </CardHeader>
        <CardContent>
          <div className="flex items-baseline gap-1.5">
            <span className="text-4xl font-black tracking-tightest text-gray-900">
              <AnimatedNumber value={value} decimals={decimals} />
            </span>
            <span className="text-sm text-gray-400 font-medium">{unitLabel}</span>
          </div>
          {metric.value === null && (
            <p className="text-xs text-gray-400 mt-1">Немає даних</p>
          )}
          {metric.items && metric.items.length > 0 && (
            <p className="text-xs text-gray-400 mt-1">
              {metric.items.length} {metric.items.length === 1 ? "задача" : "задач"}
            </p>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
