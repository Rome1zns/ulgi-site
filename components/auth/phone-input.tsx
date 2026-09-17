"use client";

import { useCallback, type ChangeEvent } from "react";

interface PhoneInputProps {
  value: string;
  onChange: (digits: string) => void;
  placeholder?: string;
  disabled?: boolean;
}

function formatPhone(digits: string) {
  const d = digits.slice(0, 10);
  if (d.length === 0) return "";
  if (d.length <= 3) return `(${d}`;
  if (d.length <= 6) return `(${d.slice(0, 3)}) ${d.slice(3)}`;
  if (d.length <= 8) return `(${d.slice(0, 3)}) ${d.slice(3, 6)}-${d.slice(6)}`;
  return `(${d.slice(0, 3)}) ${d.slice(3, 6)}-${d.slice(6, 8)}-${d.slice(8)}`;
}

function normalizePhoneDigits(raw: string): string {
  const digits = raw.replace(/\D/g, "");
  if (digits.length === 11 && (digits.startsWith("7") || digits.startsWith("8"))) {
    return digits.slice(1);
  }
  return digits.slice(0, 10);
}

export function PhoneInput({ value, onChange, placeholder, disabled }: PhoneInputProps) {
  const handleChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      const normalized = normalizePhoneDigits(e.target.value);
      onChange(normalized);
    },
    [onChange]
  );

  return (
    <div className="flex items-center gap-2">
      <span className="shrink-0 text-base font-bold text-[var(--duo-text-secondary)]">+7</span>
      <input
        type="tel"
        inputMode="numeric"
        value={formatPhone(value)}
        onChange={handleChange}
        placeholder={placeholder}
        disabled={disabled}
        className="input-duo"
      />
    </div>
  );
}
