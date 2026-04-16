"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";

export default function TestSupabase() {
  const [result, setResult] = useState("⏳ Тестирование...");

  useEffect(() => {
    (async () => {
      try {
        const start = Date.now();
        const { error, count } = await supabase
          .from("profiles")
          .select("*", { count: "exact", head: true });
        const elapsed = Date.now() - start;

        if (error) {
          setResult(`❌ Ошибка (${elapsed}ms): ${error.code} — ${error.message}`);
          return;
        }
        setResult(`✅ Supabase работает! profiles: ${count ?? 0} строк за ${elapsed}ms`);
      } catch (err) {
        setResult(`❌ Исключение: ${(err as Error).message}`);
      }
    })();
  }, []);

  return (
    <div style={{ padding: 40, fontFamily: "monospace", fontSize: 18, background: "#111", color: "#0f0", minHeight: "100vh" }}>
      <h1 style={{ color: "#fff" }}>Supabase Connection Test</h1>
      <p>{result}</p>
    </div>
  );
}
