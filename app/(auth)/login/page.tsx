"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import { PhoneInput } from "@/components/auth/phone-input";
import { kk } from "@/lib/locale/kk";
import Link from "next/link";

function phoneToEmail(digits: string) {
  return `7${digits}@ulgi.app`;
}

export default function LoginPage() {
  const router = useRouter();
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (phone.length < 10) { setError(kk.auth.phoneTooShort); return; }

    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: phoneToEmail(phone),
        password,
      });

      if (error) {
        if (error.message.toLowerCase().includes("invalid")) {
          setError(kk.auth.wrongCredentials);
        } else if (error.message.toLowerCase().includes("rate")) {
          setError("Тым көп сұраныс. Кейінірек қайта көріңіз");
        } else {
          setError(kk.errors.generic);
          console.error("Login error:", error);
        }
        return;
      }

      router.push("/feed");
      router.refresh();
    } catch (err) {
      console.error("Login exception:", err);
      setError(kk.errors.offline);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="card-duo p-8">
        <h2 className="mb-6 text-center text-[22px] font-bold text-[var(--duo-text)]">
          {kk.auth.login}
        </h2>

        <div className="space-y-4">
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

          {error && (
            <div className="rounded-[var(--radius-sm)] bg-[var(--duo-red-bg)] px-4 py-3 text-sm font-bold text-[var(--duo-red)]">
              {error}
            </div>
          )}

          <button type="submit" className="btn-duo btn-duo-green w-full" disabled={loading || phone.length < 10 || !password}>
            {loading ? kk.auth.submitting : kk.auth.login}
          </button>
        </div>
      </div>

      <p className="text-center text-sm font-bold text-[var(--duo-text-secondary)]">
        {kk.auth.noAccount}{" "}
        <Link href="/register" className="text-[var(--duo-blue)] hover:underline">
          {kk.auth.register}
        </Link>
      </p>
    </form>
  );
}
