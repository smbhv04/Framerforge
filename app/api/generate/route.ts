import { NextResponse } from "next/server";
import { z } from "zod";

import { callFramerModel } from "@/lib/ai";
import {
  ADMIN_EMAIL_ALLOWLIST,
  ADMIN_USER_ID_ALLOWLIST,
  GENERATION_TABLE,
  MAX_GENERATIONS,
} from "@/lib/constants";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { validateFramerOutput } from "@/lib/validate";

const requestSchema = z.object({
  prompt: z.string().min(8),
  email: z.string().email().optional(),
  userId: z.string().min(6).optional(),
});

type UsageInfo = {
  used: number;
};

async function fetchUsage(userId: string): Promise<UsageInfo> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from(GENERATION_TABLE)
    .select("used")
    .eq("user_id", userId)
    .limit(1)
    .maybeSingle();

  if (error && error.code !== "PGRST116") {
    throw new Error(`Failed to fetch usage: ${error.message}`);
  }

  return { used: data?.used ?? 0 };
}

async function saveUsage(userId: string, used: number) {
  const supabase = getSupabaseAdmin();
  const { error } = await supabase.from(GENERATION_TABLE).upsert(
    {
      user_id: userId,
      used,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "user_id" }
  );

  if (error) {
    throw new Error(`Failed to persist usage: ${error.message}`);
  }
}

function isAdmin(email?: string | null, userId?: string | null) {
  const normalizedEmail = email?.trim().toLowerCase();
  const normalizedId = userId?.trim().toLowerCase();
  return (
    (normalizedEmail && ADMIN_EMAIL_ALLOWLIST.includes(normalizedEmail)) ||
    (normalizedId && ADMIN_USER_ID_ALLOWLIST.includes(normalizedId))
  );
}

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = requestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid payload", issues: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const { prompt, email, userId: providedUserId } = parsed.data;
  const normalizedUserId =
    providedUserId?.toLowerCase() ||
    email?.toLowerCase() ||
    crypto.randomUUID().toLowerCase();
  const admin = isAdmin(email, normalizedUserId);

  let used = 0;
  if (!admin) {
    try {
      ({ used } = await fetchUsage(normalizedUserId));
    } catch (err) {
      const message = err instanceof Error ? err.message : "Usage fetch failed";
      return NextResponse.json({ error: message }, { status: 500 });
    }

    if (used >= MAX_GENERATIONS) {
      return NextResponse.json(
        { error: "Free limit reached (10/10)", remaining: 0, used },
        { status: 403 }
      );
    }
  }

  const attempts = 2;
  let finalResult: string | null = null;
  let lastError = "Validation failed";

  for (let i = 0; i < attempts; i += 1) {
    const generated = await callFramerModel(prompt);
    const validation = validateFramerOutput(generated);
    if (validation.ok) {
      finalResult = generated.trim();
      break;
    } else {
      lastError = validation.error;
    }
  }

  if (!finalResult) {
    return NextResponse.json(
      { error: `Generation failed validation: ${lastError}` },
      { status: 422 }
    );
  }

  if (!admin) {
    used += 1;
    try {
      await saveUsage(normalizedUserId, used);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Usage save failed";
      return NextResponse.json({ error: message }, { status: 500 });
    }
  }

  const remaining = admin ? null : Math.max(0, MAX_GENERATIONS - used);

  return NextResponse.json({
    result: finalResult,
    remaining,
    used,
    isAdmin: admin,
  });
}

