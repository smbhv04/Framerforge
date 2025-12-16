import { cn } from "@/lib/utils";
import type { ButtonHTMLAttributes, DetailedHTMLProps } from "react";

type ButtonProps = DetailedHTMLProps<
  ButtonHTMLAttributes<HTMLButtonElement>,
  HTMLButtonElement
> & {
  variant?: "primary" | "secondary" | "ghost";
};

export function Button({
  className,
  variant = "primary",
  ...props
}: ButtonProps) {
  const base =
    "inline-flex items-center justify-center rounded-lg text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-black disabled:opacity-50 disabled:cursor-not-allowed";
  type VariantKey = NonNullable<ButtonProps["variant"]>;
  const variants: Record<VariantKey, string> = {
    primary:
      "bg-gradient-to-r from-indigo-500 via-purple-500 to-sky-500 text-white shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 focus-visible:ring-indigo-400",
    secondary:
      "border border-white/10 bg-white/5 text-white hover:bg-white/10 focus-visible:ring-white/30",
    ghost: "text-zinc-300 hover:bg-white/5 focus-visible:ring-white/20",
  };

  return (
    <button className={cn(base, variants[variant], className)} {...props} />
  );
}

