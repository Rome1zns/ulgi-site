"use client";

import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { kk } from "@/lib/locale/kk";
import { cn } from "@/lib/utils";

const categories = [
  { value: "all", label: kk.announcements.general },
  { value: "event", label: kk.announcements.events },
  { value: "sport", label: kk.announcements.sport },
  { value: "academic", label: kk.announcements.academic },
];

export function AnnouncementsFilter({ active }: { active: string }) {
  const router = useRouter();

  return (
    <div className="flex flex-wrap gap-2">
      {categories.map((c) => (
        <button
          key={c.value}
          onClick={() =>
            router.push(
              c.value === "all"
                ? "/announcements"
                : `/announcements?category=${c.value}`
            )
          }
        >
          <Badge
            variant={active === c.value ? "default" : "secondary"}
            className={cn(
              "cursor-pointer rounded-xl px-3 py-1 text-xs transition-colors",
              active === c.value && "bg-foreground text-background"
            )}
          >
            {c.label}
          </Badge>
        </button>
      ))}
    </div>
  );
}
