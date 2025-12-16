export const MAX_GENERATIONS = 10;

export const ADMIN_EMAIL_ALLOWLIST = (process.env.ADMIN_EMAIL_ALLOWLIST || "")
  .split(",")
  .map((value) => value.trim().toLowerCase())
  .filter(Boolean);

export const ADMIN_USER_ID_ALLOWLIST = (process.env.ADMIN_USER_IDS || "")
  .split(",")
  .map((value) => value.trim().toLowerCase())
  .filter(Boolean);

export const GENERATION_TABLE = "generation_usage";

