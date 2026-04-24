"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import type { User } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase/client";
import { uploadToCloudinary } from "@/lib/cloudinary/upload";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { kk } from "@/lib/locale/kk";
import { MAX_BIO_LENGTH } from "@/lib/constants";
import Image from "next/image";
import { Camera } from "lucide-react";

export default function CompleteProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [username, setUsername] = useState("");
  const [bio, setBio] = useState("");
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [usernameStatus, setUsernameStatus] = useState<
    "idle" | "checking" | "available" | "taken"
  >("idle");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) {
        router.replace("/login");
      } else {
        setUser(data.user);
      }
    });
  }, [router]);

  const checkUsername = useCallback(async (value: string) => {
    if (value.length < 3) {
      setUsernameStatus("idle");
      return;
    }
    setUsernameStatus("checking");
    const { data, error } = await supabase
      .from("profiles")
      .select("id")
      .eq("username", value)
      .maybeSingle();
    if (error) {
      console.error("[complete-profile] username check failed:", error);
      setUsernameStatus("idle");
      return;
    }
    setUsernameStatus(data ? "taken" : "available");
  }, []);

  function handleUsernameChange(value: string) {
    const clean = value.toLowerCase().replace(/[^a-z0-9_]/g, "").slice(0, 20);
    setUsername(clean);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => checkUsername(clean), 500);
  }

  function handleAvatarSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;
    if (!username || username.length < 3) return;
    if (usernameStatus === "taken" || usernameStatus === "checking") return;

    setLoading(true);
    setError("");

    try {
      let avatarUrl: string | null = null;

      if (avatarFile) {
        const result = await uploadToCloudinary(avatarFile, "ulgi/avatars");
        avatarUrl = result.url;
      }

      const { error: updateError } = await supabase
        .from("profiles")
        .update({
          username,
          bio: bio.trim() || null,
          ...(avatarUrl && { avatar_url: avatarUrl }),
        })
        .eq("id", user.id);

      if (updateError) {
        console.error("[complete-profile] update error:", updateError);
        setError(kk.errors.generic);
        setLoading(false);
        return;
      }

      router.replace("/feed");
      router.refresh();
    } catch {
      setError(kk.errors.generic);
      setLoading(false);
    }
  }

  const usernameHint = {
    idle: null,
    checking: (
      <span className="text-muted-foreground">{kk.auth.checkingUsername}</span>
    ),
    available: (
      <span className="text-[var(--duo-green)]">{kk.auth.usernameAvailable}</span>
    ),
    taken: (
      <span className="text-[var(--duo-red)]">{kk.auth.usernameTaken}</span>
    ),
  }[usernameStatus];

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="rounded-2xl border-2 border-[var(--duo-border)] bg-[var(--duo-white)] p-6 shadow-sm dark:bg-zinc-900">
        <h2 className="mb-6 text-xl font-semibold">{kk.auth.completeTitle}</h2>

        <div className="space-y-5">
          {/* Avatar */}
          <div className="flex justify-center">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="relative flex h-24 w-24 items-center justify-center overflow-hidden rounded-full bg-[var(--duo-bg)] transition-colors hover:bg-[var(--duo-green-bg)] dark:bg-zinc-800 dark:hover:bg-zinc-700"
            >
              {avatarPreview ? (
                <Image
                  src={avatarPreview}
                  alt="Avatar"
                  fill
                  className="object-cover"
                />
              ) : (
                <Camera className="h-8 w-8 text-muted-foreground" />
              )}
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleAvatarSelect}
              className="hidden"
            />
          </div>
          <p className="text-center text-xs text-muted-foreground">
            {kk.auth.uploadAvatar}
          </p>

          {/* Username */}
          <div>
            <label className="mb-1.5 block text-sm font-medium">
              {kk.auth.pickUsername}
            </label>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">@</span>
              <Input
                value={username}
                onChange={(e) => handleUsernameChange(e.target.value)}
                placeholder="username"
                disabled={loading}
                className="rounded-xl"
              />
            </div>
            {usernameHint && (
              <p className="mt-1 text-xs">{usernameHint}</p>
            )}
          </div>

          {/* Bio */}
          <div>
            <label className="mb-1.5 block text-sm font-medium">
              {kk.profile.bio}
            </label>
            <Textarea
              value={bio}
              onChange={(e) => setBio(e.target.value.slice(0, MAX_BIO_LENGTH))}
              placeholder={kk.auth.bioPlaceholder}
              disabled={loading}
              rows={3}
              className="rounded-xl resize-none"
            />
            <p className="mt-1 text-right text-xs text-muted-foreground">
              {bio.length}/{MAX_BIO_LENGTH}
            </p>
          </div>

          {error && (
            <p className="text-sm text-[var(--duo-red)]">{error}</p>
          )}

          <Button
            type="submit"
            className="w-full rounded-xl"
            disabled={
              loading ||
              username.length < 3 ||
              usernameStatus === "taken" ||
              usernameStatus === "checking"
            }
          >
            {loading ? kk.feed.loading : kk.auth.done}
          </Button>
        </div>
      </div>
    </form>
  );
}
