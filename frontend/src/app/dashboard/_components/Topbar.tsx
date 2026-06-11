import { Avatar } from "@/components/ui";
import { SearchBox } from "./SearchBox";
import { NotificationsBell } from "./NotificationsBell";
import type { SessionRole } from "@/types";

interface TopbarProps {
  initials: string;
  role: SessionRole;
}

export function Topbar({ initials, role }: TopbarProps) {
  return (
    <header className="h-[64px] bg-white/90 backdrop-blur border-b border-slate-200 flex items-center gap-3 px-6 sticky top-0 z-20">
      <SearchBox role={role} />

      <div className="ml-auto flex items-center gap-2">
        <NotificationsBell role={role} />
        <Avatar name={initials} size={34} />
      </div>
    </header>
  );
}
