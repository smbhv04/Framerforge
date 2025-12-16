import { cn } from "@/lib/utils";
import type { DetailedHTMLProps, TextareaHTMLAttributes } from "react";

type TextAreaProps = DetailedHTMLProps<
  TextareaHTMLAttributes<HTMLTextAreaElement>,
  HTMLTextAreaElement
>;

export const Textarea = ({ className, ...props }: TextAreaProps) => {
  return (
    <textarea
      className={cn(
        "w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white outline-none ring-1 ring-transparent transition focus:border-white/30 focus:ring-white/20 placeholder:text-zinc-500",
        className
      )}
      {...props}
    />
  );
};

