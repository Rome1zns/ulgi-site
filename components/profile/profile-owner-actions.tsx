"use client";

import { useAuth } from "@/lib/contexts/auth-context";
import { EditProfileDialog } from "./edit-profile-dialog";
import { FollowButton } from "./follow-button";

interface ProfileOwnerActionsProps {
  profileId: string;
  profile: { full_name: string; bio: string | null; avatar_url: string | null };
}

export function ProfileOwnerActions({ profileId, profile }: ProfileOwnerActionsProps) {
  const { user } = useAuth();
  if (!user) return null;
  if (user.id === profileId) return <EditProfileDialog profile={profile} />;
  return <FollowButton targetUserId={profileId} />;
}
