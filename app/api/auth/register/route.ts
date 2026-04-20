import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { CLASS_NAMES } from "@/lib/constants";

// Регистрация через service_role обходит дефолтный email rate limit Supabase.
// Клиент зовёт этот endpoint, затем сам делает signInWithPassword чтобы получить сессию.

export async function POST(request: Request) {
  let body: {
    phone?: string;
    password?: string;
    full_name?: string;
    class_name?: string;
  };

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "bad_json" }, { status: 400 });
  }

  const phone = (body.phone || "").trim();
  const password = body.password || "";
  const fullName = (body.full_name || "").trim();
  const className = (body.class_name || "").trim();

  if (!/^\d{10}$/.test(phone)) {
    return NextResponse.json({ error: "phone_invalid" }, { status: 400 });
  }
  if (password.length < 6) {
    return NextResponse.json({ error: "password_too_short" }, { status: 400 });
  }
  if (fullName.length < 2) {
    return NextResponse.json({ error: "name_required" }, { status: 400 });
  }
  if (!(CLASS_NAMES as readonly string[]).includes(className)) {
    return NextResponse.json({ error: "class_required" }, { status: 400 });
  }

  const email = `7${phone}@ulgi.app`;
  const fullPhone = `+7${phone}`;

  // Проверка дубликата.
  const { data: list, error: listErr } = await supabaseAdmin.auth.admin.listUsers({
    perPage: 1000,
  });
  if (listErr) {
    console.error("[register] listUsers:", listErr);
    return NextResponse.json({ error: "server_error" }, { status: 500 });
  }
  if (list?.users?.some((u) => u.email === email)) {
    return NextResponse.json({ error: "phone_taken" }, { status: 409 });
  }

  // Создаём юзера с email_confirm: true — Supabase не шлёт welcome-email,
  // значит не упираемся в rate limit дефолтного SMTP.
  const { error: createErr } = await supabaseAdmin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: {
      phone: fullPhone,
      full_name: fullName,
      class_name: className,
    },
  });

  if (createErr) {
    console.error("[register] createUser:", createErr);
    const msg = createErr.message.toLowerCase();
    if (msg.includes("registered") || msg.includes("already") || msg.includes("exists")) {
      return NextResponse.json({ error: "phone_taken" }, { status: 409 });
    }
    if (msg.includes("password")) {
      return NextResponse.json({ error: "password_too_short" }, { status: 400 });
    }
    if (msg.includes("email") || msg.includes("invalid")) {
      return NextResponse.json({ error: "phone_invalid" }, { status: 400 });
    }
    return NextResponse.json({ error: createErr.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
