import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { cloudinary } from "@/lib/cloudinary";
import { verifyAdminApiRequest } from "@/lib/admin-auth";

const schema = z.object({
  data: z.string().min(1),
  mimeType: z.string().regex(/^image\//),
});

export async function POST(req: NextRequest) {
  if (!verifyAdminApiRequest(req)) {
    return NextResponse.json({ success: false, error: "Non autorisé" }, { status: 401 });
  }
  try {
    const body = await req.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ success: false, error: "Données invalides" }, { status: 400 });
    }

    const dataUri = `data:${parsed.data.mimeType};base64,${parsed.data.data}`;

    const result = await cloudinary.uploader.upload(dataUri, {
      folder: "istic-vote/candidates",
      transformation: [
        { width: 480, height: 600, crop: "fill", gravity: "face" },
        { quality: "auto", fetch_format: "auto" },
      ],
    });

    return NextResponse.json({ success: true, data: { url: result.secure_url } });
  } catch (error) {
    console.error("[POST /api/admin/upload]", error);
    return NextResponse.json({ success: false, error: "Erreur upload Cloudinary" }, { status: 500 });
  }
}
