"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import { PhoneInput } from "@/components/auth/phone-input";
import { CLASS_NAMES } from "@/lib/constants";
import { kk } from "@/lib/locale/kk";
import Link from "next/link";

function phoneToEmail(digits: string) {
  return `7${digits}@ulgi.app`;
}

export default function RegisterPage() {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [className, setClassName] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!fullName.trim()) { setError(kk.auth.requiredField); return; }
    if (!className) { setError(kk.auth.requiredField); return; }
    if (phone.length < 10) { setError(kk.auth.phoneTooShort); return; }
    if (password.length < 6) { setError(kk.auth.passwordTooShort); return; }
    if (password !== confirmPw) { setError(kk.auth.passwordMismatch); return; }

    setLoading(true);
    try {
      // Регистрация через серверный endpoint с service_role —
      // обходит Supabase email rate limit (2/hr), который бьёт всех
      // когда одновременно регаются несколько новых юзеров.
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone,
          password,
          full_name: fullName.trim(),
          class_name: className,
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        switch (data.error) {
          case "phone_taken":
            setError(kk.auth.phoneExists);
            break;
          case "password_too_short":
            setError(kk.auth.passwordTooShort);
            break;
          case "phone_invalid":
            setError("Телефон нөмірі қате форматта");
            break;
          case "name_required":
          case "class_required":
            setError(kk.auth.requiredField);
            break;
          default:
            setError(kk.errors.generic + ": " + (data.error || res.status));
        }
        return;
      }

      // Получаем сессию — логинимся только что созданным юзером.
      const { error: signInErr } = await supabase.auth.signInWithPassword({
        email: phoneToEmail(phone),
        password,
      });

      if (signInErr) {
        console.error("[register] signIn after create:", signInErr);
        setError(kk.errors.generic);
        return;
      }

      router.push("/complete-profile");
      router.refresh();
    } catch (err) {
      console.error("[register] error:", err);
      setError(kk.errors.generic);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="card-duo p-8">
        <h2 className="mb-6 text-center text-[22px] font-bold text-[var(--duo-text)]">
          {kk.auth.register}
        </h2>

        <div className="space-y-4">
          <div>
            <label className="mb-2 block text-[13px] font-bold uppercase tracking-wider text-[var(--duo-text-secondary)]">
              {kk.auth.fullName}
            </label>
            <input value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder={kk.auth.whatsYourName} disabled={loading} className="input-duo" />
          </div>

          <div>
            <label className="mb-2 block text-[13px] font-bold uppercase tracking-wider text-[var(--duo-text-secondary)]">
              {kk.auth.yourClass}
            </label>
            <select value={className} onChange={(e) => setClassName(e.target.value)} disabled={loading} className="input-duo">
              <option value="">{kk.auth.yourClass}</option>
              {CLASS_NAMES.map((cn) => (
                <option key={cn} value={cn}>{cn}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-2 block text-[13px] font-bold uppercase tracking-wider text-[var(--duo-text-secondary)]">
              {kk.auth.phone}
            </label>
            <PhoneInput value={phone} onChange={setPhone} placeholder={kk.auth.phonePlaceholder} disabled={loading} />
          </div>

          <div>
            <label className="mb-2 block text-[13px] font-bold uppercase tracking-wider text-[var(--duo-text-secondary)]">
              {kk.auth.password}
            </label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder={kk.auth.password} disabled={loading} className="input-duo" />
          </div>

          <div>
            <label className="mb-2 block text-[13px] font-bold uppercase tracking-wider text-[var(--duo-text-secondary)]">
              {kk.auth.confirmPassword}
            </label>
            <input type="password" value={confirmPw} onChange={(e) => setConfirmPw(e.target.value)} placeholder={kk.auth.confirmPassword} disabled={loading} className="input-duo" />
          </div>

          {error && (
            <div className="rounded-[var(--radius-sm)] bg-[var(--duo-red-bg)] px-4 py-3 text-sm font-bold text-[var(--duo-red)]">
              {error}
            </div>
          )}

          <button type="submit" className="btn-duo btn-duo-green w-full" disabled={loading || !fullName.trim() || !className || phone.length < 10 || password.length < 6 || password !== confirmPw}>
            {loading ? kk.auth.submitting : kk.auth.register}
          </button>
        </div>
      </div>

      <p className="text-center text-sm font-bold text-[var(--duo-text-secondary)]">
        {kk.auth.hasAccount}{" "}
        <Link href="/login" className="text-[var(--duo-blue)] hover:underline">
          {kk.auth.login}
        </Link>
      </p>
    </form>
  );
}
