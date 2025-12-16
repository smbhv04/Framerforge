"use client";

import { motion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

type Status = "idle" | "loading" | "success" | "error";

type GenerateResponse = {
  result?: string;
  error?: string;
  remaining?: number;
  used?: number;
  isAdmin?: boolean;
};

const DEFAULT_PROMPT =
  "Build a sticky, responsive Framer navbar with logo, nav links, and CTA. Desktop: inline links with hover states. Mobile: hamburger toggles slide-down menu. Persist focus ring accessibility and keep overrides minimal.";

const MAX_FREE = 10;
const STORAGE_KEY = "framerforge.identity";

export default function Home() {
  const [prompt, setPrompt] = useState(DEFAULT_PROMPT);
  const [email, setEmail] = useState("");
  const [userId, setUserId] = useState("");
  const [output, setOutput] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState("");
  const [used, setUsed] = useState<number | null>(null);
  const [remaining, setRemaining] = useState<number | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored) as { email?: string; userId?: string };
        if (parsed.email) setEmail(parsed.email);
        if (parsed.userId) setUserId(parsed.userId);
      } catch {
        // ignore parse issues; fall back to fresh identity
      }
    }
    if (!userId) {
      const nextId = crypto.randomUUID();
      setUserId(nextId);
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ email, userId: nextId }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!userId) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ email, userId }));
  }, [email, userId]);

  const limitCopy = useMemo(() => {
    if (isAdmin) return "Admin · unlimited generations";
    if (remaining === 0) return "Free limit reached (10/10)";
    if (typeof remaining === "number") {
      return `Remaining: ${remaining}/${MAX_FREE}`;
    }
    return `Max ${MAX_FREE} free generations`;
  }, [isAdmin, remaining]);

  const disableGenerate =
    status === "loading" || (!!remaining && remaining <= 0 && !isAdmin);

  const stats = [
    { label: "Correctness first", value: "Framer-native" },
    { label: "Free quota", value: "10 runs" },
    { label: "Admin", value: isAdmin ? "Unlimited" : "Limited" },
  ];

  const onGenerate = async () => {
    setStatus("loading");
    setError("");
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt,
          email: email.trim() || undefined,
          userId,
        }),
      });

      const data = (await res.json()) as GenerateResponse;
      setUsed(data.used ?? null);
      setRemaining(data.remaining ?? null);
      setIsAdmin(Boolean(data.isAdmin));
      if (!res.ok) {
        throw new Error(data.error || "Generation failed");
      }
      setOutput(data.result ?? "");
      setStatus("success");
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Unexpected error occurred";
      setError(message);
      setStatus("error");
    }
  };

  const refreshIdentity = () => {
    const nextId = crypto.randomUUID();
    setUserId(nextId);
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ email, userId: nextId }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0a0a0f] via-[#0b0c14] to-black text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(79,70,229,0.18),transparent_35%),radial-gradient(circle_at_80%_10%,rgba(14,165,233,0.18),transparent_30%),radial-gradient(circle_at_50%_70%,rgba(236,72,153,0.16),transparent_35%)] pointer-events-none" />
      <div className="mx-auto flex max-w-6xl flex-col gap-10 px-6 py-12 relative">
        <header className="flex flex-col gap-6">
          <div className="flex items-center justify-between gap-3">
            <div className="flex flex-col gap-3">
              <Badge className="w-fit">FramerForge · Constraint-driven</Badge>
              <div className="flex flex-col gap-3">
                <h1 className="text-4xl font-semibold leading-tight sm:text-5xl">
                  Production-grade Framer code, zero guesswork.
                </h1>
                <p className="max-w-3xl text-lg text-zinc-300">
                  Paste-ready Code Components and Overrides that enforce annotations, property controls, and performance rules before they reach your canvas.
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-3 text-sm text-zinc-400">
                <span className="rounded-full border border-white/10 px-3 py-1">
                  {limitCopy}
                </span>
                <span className="rounded-full border border-white/10 px-3 py-1">
                  {"Correctness > flexibility > UI polish"}
                </span>
                <span className="rounded-full border border-white/10 px-3 py-1">
                  Free models only · Supabase tracking
                </span>
              </div>
            </div>
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="hidden md:flex min-w-[180px] flex-col items-end gap-3 text-right"
            >
              <p className="text-sm text-zinc-400">Spec adherence</p>
              <div className="flex items-center gap-3 text-3xl font-semibold">
                <span>100%</span>
                <span className="text-xs text-emerald-400">validated</span>
              </div>
              <p className="text-xs text-zinc-500">
                Enforces Type → Description → Code → Usage Notes with Property Controls.
              </p>
            </motion.div>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            {stats.map((stat) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.05 }}
                className="rounded-xl border border-white/5 bg-white/[0.03] px-4 py-3 shadow-lg shadow-black/30"
              >
                <p className="text-xs uppercase tracking-[0.16em] text-zinc-500">
                  {stat.label}
                </p>
                <p className="text-lg font-semibold text-white">{stat.value}</p>
              </motion.div>
            ))}
          </div>
        </header>

        <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <Card className="relative overflow-hidden">
            <div className="absolute inset-0 opacity-50 [mask-image:radial-gradient(ellipse_at_top,black,transparent_70%)]">
              <div className="absolute -left-10 -top-10 h-40 w-40 rounded-full bg-indigo-500/20 blur-3xl" />
              <div className="absolute -right-10 top-10 h-32 w-32 rounded-full bg-sky-500/20 blur-3xl" />
            </div>
            <div className="relative flex flex-col gap-4">
              <CardHeader>
                <CardTitle>Identity</CardTitle>
                <CardDescription>
                  Email is optional; used for limits and admin allowlist. Anon ID is stored locally.
                </CardDescription>
              </CardHeader>
              <CardContent className="gap-3">
                <div className="flex flex-col gap-3 sm:flex-row">
                  <Input
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@company.com"
                  />
                  <Button type="button" variant="secondary" onClick={refreshIdentity}>
                    New anon ID
                  </Button>
                </div>
                <p className="text-xs text-zinc-500">
                  User ID: <span className="font-mono text-zinc-200">{userId}</span>
                </p>
                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between text-sm text-zinc-400">
                    <span>Prompt</span>
                    <span className="text-zinc-500">
                      Component if new UI; Override if modifying canvas.
                    </span>
                  </div>
                  <Textarea
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    rows={10}
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-3">
                    <Button
                      type="button"
                      onClick={onGenerate}
                      disabled={disableGenerate}
                      className="w-full sm:w-auto"
                    >
                      {status === "loading"
                        ? "Generating…"
                        : disableGenerate
                          ? "Limit reached"
                          : "Generate Framer code"}
                    </Button>
                    <span className="text-xs text-zinc-400">
                      {typeof used === "number" && !isAdmin ? `${used}/${MAX_FREE} used` : null}
                    </span>
                  </div>
                  {status === "error" && error ? (
                    <p className="text-xs text-red-400">{error}</p>
                  ) : (
                    <p className="text-xs text-zinc-500">
                      Output is validated for sections, TSX fence, property controls, and default export.
                    </p>
                  )}
                </div>
              </CardContent>
            </div>
          </Card>

          <Card className="h-full">
            <CardHeader className="flex-row items-center justify-between">
              <div>
                <CardTitle>Output</CardTitle>
                <CardDescription>
                  Format: Type → Description → Code → Usage Notes (TSX fenced)
                </CardDescription>
              </div>
              <Badge className="bg-emerald-500/10 text-emerald-300 border-emerald-500/30">
                Validated
              </Badge>
            </CardHeader>
            <CardContent>
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25 }}
                className="rounded-xl border border-white/5 bg-black/60 p-4"
              >
                <pre className="h-[420px] overflow-auto whitespace-pre-wrap break-words text-xs text-zinc-100">
                  {output || "Generation output will appear here."}
                </pre>
              </motion.div>
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  );
}
