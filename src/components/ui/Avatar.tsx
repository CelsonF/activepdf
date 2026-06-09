import { cn } from "@/lib/cn";

interface AvatarProps {
  name: string;
  size?: number;
  src?: string;
  square?: boolean;
  className?: string;
}

export function Avatar({ name, size = 38, src, square = false, className }: AvatarProps) {
  const initials = name
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <span
      className={cn(
        "inline-flex items-center justify-center bg-brand-light text-brand font-bold shrink-0 overflow-hidden select-none",
        square ? "rounded-lg" : "rounded-full",
        className
      )}
      style={{ width: size, height: size, fontSize: Math.round(size * 0.38) }}
    >
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src} alt={name} className="w-full h-full object-cover" />
      ) : (
        initials
      )}
    </span>
  );
}
