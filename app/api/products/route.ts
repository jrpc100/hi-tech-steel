
import { list } from "@vercel/blob";
import { NextResponse } from "next/server";
import { products } from "../../../lib/products";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const BLOB_TOKEN = process.env.PUBLIC_BLOB_READ_WRITE_TOKEN;

export async function GET() {
  try {
    if (!BLOB_TOKEN) {
      throw new Error("Public Blob token is missing");
    }

    const result = await list({
      prefix: "products/",
      token: BLOB_TOKEN
    });

    const items = products.map((product) => {
      const photo = result.blobs.find((blob) =>
        blob.pathname.startsWith(`products/${product.id}.`)
      );

      return {
        ...product,
        imageUrl: photo?.url || null
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
