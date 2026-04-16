"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/lib/contexts/auth-context";
import {
  checkIsFollowing,
  followUser,
  unfollowUser,
} from "@/lib/supabase/queries/follows";
import { kk } from "@/lib/locale/kk";

export function FollowButton({ targetUserId }: { targetUserId: string }) {
  const { user } = useAuth();
  const [following, setFollowing] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user || user.id === targetUserId) return;
    let alive = true;
    checkIsFollowing(user.id, targetUserId).then((v) => {
      if (alive) setFollowing(v);
    });
    return () => { alive = false; };
  }, [user, targetUserId]);

  if (!user || user.id === targetUserId) return null;

  async function handleToggle() {
    if (!user) return;
    setLoading(true);
    try {
      if (following) {
        await unfollowUser(user.id, targetUserId);
        setFollowing(false);
      } else {
        await followUser(user.id, targetUserId);
        setFollowing(true);
      }
    } catch (err) {
      console.error("Follow toggle error:", err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <button onClick={handleToggle} disabled={loading}
      className={`btn-duo ${following ? "btn-duo-white" : "btn-duo-green"} !text-sm`}>
      {following ? kk.profile.unfollow : kk.profile.follow}
    </button>
  );
}
