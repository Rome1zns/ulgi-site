import { NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";
import { verifySupabaseAuth } from "@/lib/supabase/verify-request";

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(request: Request) {
  const auth = await verifySupabaseAuth(request);
  if (!auth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { publicId, resourceType = "image" } = await request.json();
  if (!publicId) {
    return NextResponse.json({ error: "publicId required" }, { status: 400 });
  }

  try {
    const result = await cloudinary.uploader.destroy(publicId, {
      resource_type: resourceType,
    });
    return NextResponse.json({ result });
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}
