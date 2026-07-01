import { cn } from "@/utils/cn";
import { initials } from "@/lib/format";

const PALETTE = ["bg-rose-500", "bg-amber-500", "bg-emerald-500", "bg-sky-500", "bg-violet-500", "bg-pink-500", "bg-indigo-500", "bg-teal-500"];

function hashColor(str: string) {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = str.charCodeAt(i) + ((h << 5) - h);
  return PALETTE[Math.abs(h) % PALETTE.length];
}

export function Avatar({ name, size = "md", className }: { name: string; size?: "sm" | "md" | "lg"; className?: string }) {
  const [first = "", last = ""] = name.split(" ");
  const sz = { sm: "h-7 w-7 text-[10px]", md: "h-9 w-9 text-xs", lg: "h-12 w-12 text-base" }[size];
  return (
    <div className={cn("rounded-full flex items-center justify-center font-semibold text-white shrink-0", hashColor(name), sz, className)}>
      {initials(first, last)}
    </div>
  );
}