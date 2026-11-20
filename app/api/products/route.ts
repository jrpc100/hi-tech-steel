import { list } from "@vercel/blob";
import { NextResponse } from "next/server";
import { getProducts } from "../../../lib/product-store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const TOKEN = process.env.PUBLIC_BLOB_READ_WRITE_TOKEN;

export async function GET() {
  try {
    if (!TOKEN) {
      throw new Error("Public Blob token is missing");
    }

    const products = await getProducts();

    const result = await list({
      prefix: "products/",
      token: TOKEN
    });

    const items = products.map((product) => {
      const matchingPhotos = result.blobs.filter((blob) => {
        const filename = blob.pathname.split("/").pop() || "";

        return new RegExp(
          `^${product.id}(?:[-.]|$)`
        ).test(filename);
      });

      matchingPhotos.sort(
        (a, b) =>
          new Date(b.uploadedAt).getTime() -
          new Date(a.uploadedAt).getTime()
      );

      return {
        ...product,
        imageUrl: matchingPhotos[0]?.url || null
      };
    });

    return NextResponse.json(items, {
      headers: {
        "Cache-Control": "no-store"
      }
    });

  } catch (error) {
    console.error("Product loading error:", error);

    return NextResponse.json(
      { error: "Unable to load products" },
      { status: 500 }
    );
  }
}