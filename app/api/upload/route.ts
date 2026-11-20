
import { NextRequest, NextResponse } from "next/server";
import { put, list, del } from "@vercel/blob";
import {
  verifyAdminSession,
  COOKIE_NAME
} from "../../../lib/auth";
import { products } from "../../../lib/products";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const BLOB_TOKEN = process.env.PUBLIC_BLOB_READ_WRITE_TOKEN;

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
    if (!BLOB_TOKEN) {
      throw new Error("Public Blob token is missing");
    }

    const form = await request.formData();
    const id = Number(form.get("productId"));
    const file = form.get("file");

    if (
      !Number.isInteger(id) ||
      !products.some((product) => product.id === id)
    ) {
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

    if (file.size > 4 * 1024 * 1024) {
      return NextResponse.json(
        { error: "Maximum file size is 4 MB" },
        { status: 400 }
      );
    }

    const extension: Record<string, string> = {
      "image/jpeg": "jpg",
      "image/png": "png",
      "image/webp": "webp"
    };

    const blob = await put(
      `products/${id}.${extension[file.type]}`,
      file,
      {
        access: "public",
        addRandomSuffix: true,
        token: BLOB_TOKEN
      }
    );

    const existing = await list({
      prefix: `products/${id}.`,
      token: BLOB_TOKEN
    });

    const oldBlobs = existing.blobs.filter(
      (item) => item.url !== blob.url
    );

    if (oldBlobs.length > 0) {
      await del(
        oldBlobs.map((item) => item.url),
        { token: BLOB_TOKEN }
      );
    }

    return NextResponse.json({
      success: true,
      imageUrl: blob.url
    });

  } catch (error) {
    console.error("Upload error:", error);

    return NextResponse.json(
      { error: "Upload failed. Check Blob configuration." },
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
    if (!BLOB_TOKEN) {
      throw new Error("Public Blob token is missing");
    }

    const { productId } = await request.json();
    const id = Number(productId);

    if (
      !Number.isInteger(id) ||
      !products.some((product) => product.id === id)
    ) {
      return NextResponse.json(
        { error: "Invalid product" },
        { status: 400 }
      );
    }

    const existing = await list({
      prefix: `products/${id}.`,
      token: BLOB_TOKEN
    });

    if (existing.blobs.length > 0) {
      await del(
        existing.blobs.map((blob) => blob.url),
        { token: BLOB_TOKEN }
      );
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
