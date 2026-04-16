"use client";

import { useState, useRef } from "react";
import { useAuth } from "@/lib/contexts/auth-context";
import { updateProfile } from "@/lib/supabase/queries/profiles";
import { uploadToCloudinary } from "@/lib/cloudinary/upload";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { kk } from "@/lib/locale/kk";
import { MAX_BIO_LENGTH } from "@/lib/constants";
import { Camera } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import Image from "next/image";

interface EditProfileDialogProps {
  profile: { full_name: string; bio: string | null; avatar_url: string | null };
}

export function EditProfileDialog({ profile }: EditProfileDialogProps) {
  const router = useRouter();
  const { user, refreshProfile } = useAuth();
  const [open, setOpen] = useState(false);
  const [fullName, setFullName] = useState(profile.full_name);
  const [bio, setBio] = useState(profile.bio ?? "");
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  function handleAvatarSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0]; if (!f) return;
    setAvatarFile(f); setAvatarPreview(URL.createObjectURL(f));
  }

  async function handleSave() {
    if (!user) return;
    setSaving(true);
    try {
      let avatarUrl = profile.avatar_url;
      if (avatarFile) {
        const r = await uploadToCloudinary(avatarFile, "ulgi/avatars");
        avatarUrl = r.url;
      }
      await updateProfile(user.id, {
        full_name: fullName.trim(),
        bio: bio.trim() || null,
        avatar_url: avatarUrl,
      });
      await refreshProfile();
      toast.success(kk.toasts.saved);
      setOpen(false);
      router.refresh();
    } catch (err) {
      console.error("Save profile error:", err);
      toast.error(kk.errors.generic);
    } finally {
      setSaving(false);
    }
  }

  const displayAvatar = avatarPreview ?? profile.avatar_url;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger>
        <span className="btn-duo btn-duo-white !text-sm">{kk.profile.edit}</span>
      </DialogTrigger>
      <DialogContent className="!rounded-[var(--radius-xl)] !border-2 !border-[var(--duo-border)]">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold text-[var(--duo-text)]">{kk.profile.edit}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 pt-2">
          <div className="flex justify-center">
            <button type="button" onClick={() => fileRef.current?.click()}
              className="relative flex h-20 w-20 items-center justify-center overflow-hidden rounded-full border-4 border-[var(--duo-green)] bg-[var(--duo-bg)]">
              {displayAvatar ? <Image src={displayAvatar} alt="" fill className="object-cover" /> : <Camera className="h-6 w-6 text-[var(--duo-text-secondary)]" />}
            </button>
            <input ref={fileRef} type="file" accept="image/*" onChange={handleAvatarSelect} className="hidden" />
          </div>
          <div>
            <label className="mb-2 block text-[13px] font-bold uppercase tracking-wider text-[var(--duo-text-secondary)]">{kk.auth.fullName}</label>
            <input value={fullName} onChange={(e) => setFullName(e.target.value)} className="input-duo" />
          </div>
          <div>
            <label className="mb-2 block text-[13px] font-bold uppercase tracking-wider text-[var(--duo-text-secondary)]">{kk.profile.bio}</label>
            <textarea value={bio} onChange={(e) => setBio(e.target.value.slice(0, MAX_BIO_LENGTH))} placeholder={kk.auth.bioPlaceholder} rows={3} className="input-duo resize-none" />
            <p className="mt-1 text-right text-xs font-bold text-[var(--duo-text-secondary)]">{bio.length}/{MAX_BIO_LENGTH}</p>
          </div>
          <button onClick={handleSave} disabled={saving || !fullName.trim()} className="btn-duo btn-duo-green w-full">
            {saving ? kk.auth.submitting : kk.profile.save}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
