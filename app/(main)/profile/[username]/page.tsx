"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { getProfileByUsername } from "@/lib/supabase/queries/profiles";
import { getPostsByAuthor } from "@/lib/supabase/queries/posts";
import { ProfileOwnerActions } from "@/components/profile/profile-owner-actions";
import type { Profile, PostWithAuthor } from "@/types/db";
import { kk } from "@/lib/locale/kk";
import Image from "next/image";

export default function ProfilePage() {
  const { username } = useParams<{ username: string }>();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [posts, setPosts] = useState<PostWithAuthor[]>([]);
  const [notFound, setNotFound] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!username) return;
    let alive = true;
    (async () => {
      try {
        const prof = await getProfileByUsername(username);
        if (!prof) { if (alive) { setNotFound(true); setLoaded(true); } return; }
        if (!alive) return;
        setProfile(prof as Profile);

        const userPosts = await getPostsByAuthor(prof.id, 30);
        if (alive) setPosts(userPosts as PostWithAuthor[]);
      } catch (err) {
        console.error("[profile]", err);
      } finally {
        if (alive) setLoaded(true);
      }
    })();
    return () => { alive = false; };
  }, [username]);

  if (!loaded) return <div className="flex justify-center py-20"><div className="h-10 w-10 animate-spin rounded-full border-4 border-[var(--duo-border)] border-t-[var(--duo-green)]" /></div>;
  if (notFound || !profile) return <p className="py-20 text-center text-lg font-bold text-[var(--duo-text-secondary)]">{kk.errors.notFound}</p>;

  const initials = (profile.full_name || "?").split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();

  return (
    <div className="space-y-6">
      <div className="card-duo p-6 text-center">
        <div className="mx-auto mb-4 flex h-24 w-24 items-center justify-center overflow-hidden rounded-full border-4 border-[var(--duo-green)] bg-[var(--duo-bg)]">
          {profile.avatar_url ? (
            <Image src={profile.avatar_url} alt={profile.full_name} width={96} height={96} className="h-full w-full object-cover" />
          ) : (
            <span className="text-2xl font-extrabold text-[var(--duo-text-secondary)]">{initials}</span>
          )}
        </div>
        <h1 className="text-2xl font-extrabold text-[var(--duo-text)]">{profile.full_name}</h1>
        <p className="text-sm font-bold text-[var(--duo-text-secondary)]">
          @{profile.username}
          {profile.class_name ? <span className="ml-2 badge-duo bg-[var(--duo-bg)] text-[var(--duo-text-secondary)]" style={{fontSize: 10, padding: '2px 8px'}}>{profile.class_name}</span> : null}
        </p>
        {profile.bio ? <p className="mt-2 text-sm text-[var(--duo-text)]">{profile.bio}</p> : null}

        <div className="mt-4 flex justify-center gap-8">
          {[
            { count: posts.length, label: "пост" },
            { count: profile.followers_count ?? 0, label: kk.profile.followers },
            { count: profile.following_count ?? 0, label: kk.profile.following },
          ].map((s) => (
            <div key={s.label} className="text-center">
              <p className="text-xl font-extrabold text-[var(--duo-text)]">{s.count}</p>
              <p className="text-[11px] font-bold uppercase tracking-wider text-[var(--duo-text-secondary)]">{s.label}</p>
            </div>
          ))}
        </div>

        <div className="mt-4">
          <ProfileOwnerActions
            profileId={profile.id}
            profile={{ full_name: profile.full_name, bio: profile.bio, avatar_url: profile.avatar_url }}
          />
        </div>
      </div>

      {posts.length === 0 ? (
        <p className="py-12 text-center text-sm font-bold text-[var(--duo-text-secondary)]">{kk.profile.empty}</p>
      ) : (
        <div className="grid grid-cols-3 gap-1 overflow-hidden rounded-[var(--radius-lg)]">
          {posts.map((post) =>
            post.media_type === "image" && post.media_urls?.[0] ? (
              <a key={post.id} href={`/post/${post.id}`} className="relative aspect-square">
                <Image src={post.media_urls[0]} alt="" fill className="object-cover" sizes="(max-width: 672px) 33vw, 224px" />
              </a>
            ) : (
              <a key={post.id} href={`/post/${post.id}`} className="flex aspect-square items-center justify-center bg-[var(--duo-bg)] p-2 text-center text-xs font-semibold text-[var(--duo-text-secondary)] border border-[var(--duo-border)]">
                <span className="line-clamp-4">{post.content}</span>
              </a>
            )
          )}
        </div>
      )}
    </div>
  );
}
