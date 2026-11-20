
import { NextRequest, NextResponse } from "next/server";
import { put, list, del } from "@vercel/blob";

import {
  verifyAdminSession,
  COOKIE_NAME
} from "../../../lib/auth";

import { getProducts } from "../../../lib/product-store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const TOKEN = process.env.PUBLIC_BLOB_READ_WRITE_TOKEN;

function isAuthorized(request: NextRequest) {
  return verifyAdminSession(
    request.cookies.get(COOKIE_NAME)?.value
  );
}

// UPLOAD / REPLACE PHOTO
export async function POST(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

  try {
    if (!TOKEN) {
      throw new Error("Public Blob token is missing");
    }

    const form = await request.formData();

    const id = Number(form.get("productId"));
    const file = form.get("file");

    const products = await getProducts();

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
        token: TOKEN
      }
    );

    // Remove older photos for this product
    const existing = await list({
      prefix: "products/",
      token: TOKEN
    });

    const oldPhotos = existing.blobs.filter((item) => {
      const filename = item.pathname.split("/").pop() || "";

      return (
        new RegExp(`^${id}(?:[-.]|$)`).test(filename) &&
        item.url !== blob.url
      );
    });

    if (oldPhotos.length > 0) {
      await del(
        oldPhotos.map((item) => item.url),
        { token: TOKEN }
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

// DELETE PHOTO
export async function DELETE(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

  try {
    if (!TOKEN) {
      throw new Error("Public Blob token is missing");
    }

    const body = await request.json();
    const id = Number(body.productId);

    const products = await getProducts();

    if (
      !Number.isInteger(id) ||
      !products.some((product) => product.id === id)
    ) {
      return NextResponse.json(
        { error: "Invalid product" },
        { status: 400 }
      );
    }

    // Find all photos belonging to this product
    const result = await list({
      prefix: "products/",
      token: TOKEN
    });

    const matchingPhotos = result.blobs.filter((blob) => {
      const filename = blob.pathname.split("/").pop() || "";

      return new RegExp(
        `^${id}(?:[-.]|$)`
      ).test(filename);
    });

    if (matchingPhotos.length === 0) {
      return NextResponse.json({
        success: true,
        deleted: 0
      });
    }

    // Delete all matching photos
    await del(
      matchingPhotos.map((blob) => blob.url),
      { token: TOKEN }
    );

    // Verify deletion
    const verify = await list({
      prefix: "products/",
      token: TOKEN
    });

    const stillExists = verify.blobs.some((blob) =>
      matchingPhotos.some((old) => old.url === blob.url)
    );

    if (stillExists) {
      return NextResponse.json(
        { error: "Photo still exists in Blob Storage" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      deleted: matchingPhotos.length
    });

  } catch (error) {
    console.error("Photo delete error:", error);

    return NextResponse.json(
      { error: "Photo deletion failed" },
      { status: 500 }
    );
  }
}
