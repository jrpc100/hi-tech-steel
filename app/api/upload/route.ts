
import { NextRequest, NextResponse } from "next/server";
import { put, list, del } from "@vercel/blob";
import {
  verifyAdminSession,
  COOKIE_NAME
} from "@/lib/auth";
import { products } from "@/lib/products";

export const runtime = "nodejs";

function isAuthorized(request: NextRequest) {
  return verifyAdminSession(
    request.cookies.get(COOKIE_NAME)?.value
  );
}

export async function POST(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

  try {
    const form = await request.formData();

    const id = Number(form.get("productId"));
    const file = form.get("file");

    if (!products.some((product) => product.id === id)) {
      return NextResponse.json(
        { error: "Invalid product" },
        { status: 400 }
      );
    }

    if (!(file instanceof File)) {
      return NextResponse.json(
        { error: "Select a photo" },
        { status: 400 }
      );
    }

    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/webp"
    ];

    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: "Only JPG, PNG and WEBP allowed" },
        { status: 400 }
      );
    }

    if (file.size > 8 * 1024 * 1024) {
      return NextResponse.json(
        { error: "Maximum file size is 8 MB" },
        { status: 400 }
      );
    }

    const extension: Record<string, string> = {
      "image/jpeg": "jpg",
      "image/png": "png",
      "image/webp": "webp"
    };

    const pathname =
      `products/${id}.${extension[file.type]}`;

    const existing = await list({
      prefix: `products/${id}.`
    });

    if (existing.blobs.length > 0) {
      await del(existing.blobs.map((blob) => blob.url));
    }

    const blob = await put(pathname, file, {
      access: "public",
      addRandomSuffix: false,
      allowOverwrite: true
    });

    return NextResponse.json({
      success: true,
      imageUrl: blob.url
    });
  } catch (error) {
    console.error("Upload error:", error);

    return NextResponse.json(
      { error: "Upload failed. Check Blob Storage." },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

  try {
    const { productId } = await request.json();

    const id = Number(productId);

    if (!products.some((product) => product.id === id)) {
      return NextResponse.json(
        { error: "Invalid product" },
        { status: 400 }
      );
    }

    const existing = await list({
      prefix: `products/${id}.`
    });

    if (existing.blobs.length > 0) {
      await del(existing.blobs.map((blob) => blob.url));
    }

    return NextResponse.json({
      success: true
    });
  } catch (error) {
    console.error("Delete error:", error);

    return NextResponse.json(
      { error: "Delete failed" },
      { status: 500 }
    );
  }
}
