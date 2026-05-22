import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || "ndma_citizen";

    if (!cloudName) {
      // Return a placeholder image if Cloudinary is not configured
      return NextResponse.json({
        url: `https://placehold.co/400x300/1e293b/f59e0b?text=Photo+Uploaded`,
        public_id: "placeholder",
      });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64 = buffer.toString("base64");
    const dataUri = `data:${file.type};base64,${base64}`;

    const cloudinaryFormData = new FormData();
    cloudinaryFormData.append("file", dataUri);
    cloudinaryFormData.append("upload_preset", uploadPreset);
    cloudinaryFormData.append("folder", "ndma_citizen_empowerment");

    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
      { method: "POST", body: cloudinaryFormData }
    );

    if (!response.ok) {
      // Fallback: return base64 preview URL
      return NextResponse.json({
        url: dataUri,
        public_id: "local_preview",
        mode: "local",
      });
    }

    const data = await response.json();
    return NextResponse.json({ url: data.secure_url, public_id: data.public_id });
  } catch (err) {
    return NextResponse.json({ error: "Upload failed", detail: String(err) }, { status: 500 });
  }
}
