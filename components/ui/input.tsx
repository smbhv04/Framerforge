import { cn } from "@/lib/utils";
import type { DetailedHTMLProps, InputHTMLAttributes } from "react";

type InputProps = DetailedHTMLProps<
  InputHTMLAttributes<HTMLInputElement>,
  HTMLInputElement
>;

export const Input = ({ className, ...props }: InputProps) => {
  return (
    <input
      className={cn(
        "w-full rounded-xl border border-white/10 bg-black/40 px-4 py-2 text-sm text-white outline-none ring-1 ring-transparent transition focus:border-white/30 focus:ring-white/20 placeholder:text-zinc-500",
        className
      )}
      {...props}
    />
  );
};

