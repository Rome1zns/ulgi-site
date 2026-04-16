import { Pin } from "lucide-react";
import { kk } from "@/lib/locale/kk";
import { optimizeUrl } from "@/lib/cloudinary/upload";
import type { Announcement } from "@/types/db";

const categoryStyles: Record<string, { bg: string; text: string; label: string }> = {
  event: { bg: "bg-[var(--duo-orange-bg)]", text: "text-[var(--duo-orange)]", label: kk.announcements.events },
  sport: { bg: "bg-[var(--duo-blue-bg)]", text: "text-[var(--duo-blue)]", label: kk.announcements.sport },
  academic: { bg: "bg-[var(--duo-green-bg)]", text: "text-[var(--duo-green)]", label: kk.announcements.academic },
  general: { bg: "bg-[var(--duo-bg)]", text: "text-[var(--duo-text)]", label: kk.announcements.general },
};

export function PinnedAnnouncement({ item }: { item: Announcement }) {
  const style = categoryStyles[item.category] ?? categoryStyles.general;

  return (
    <div className="overflow-hidden rounded-[var(--radius-lg)] border-2 border-[var(--duo-yellow)] bg-[var(--duo-yellow-bg)]">
      {item.media_url && item.media_type === "image" && (
        /* eslint-disable-next-line @next/next/no-img-element */
        <img src={optimizeUrl(item.media_url, 600)} alt="" className="w-full h-[140px] object-cover" loading="lazy" />
      )}
      <div className="p-4">
        <div className="mb-2 flex items-center gap-2">
          <Pin className="h-4 w-4 text-[var(--duo-yellow)]" fill="var(--duo-yellow)" />
          <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--duo-orange)]">{kk.announcements.pinned}</span>
          <span className={`badge-duo ${style.bg} ${style.text}`} style={{fontSize: 10, padding: '2px 10px'}}>{style.label}</span>
        </div>
        <h3 className="mb-1 text-sm font-bold text-[var(--duo-text)]">{item.title}</h3>
        <p className="text-sm text-[var(--duo-text-secondary)] line-clamp-2">{item.content}</p>
        {(item.event_date || item.event_location) && (
          <div className="mt-2 flex items-center gap-3 text-xs text-[var(--duo-text-secondary)]">
            {item.event_date && <span>📅 {item.event_date}{item.event_time ? ` • ${item.event_time}` : ""}</span>}
            {item.event_location && <span>📍 {item.event_location}</span>}
          </div>
        )}
      </div>
    </div>
  );
}
