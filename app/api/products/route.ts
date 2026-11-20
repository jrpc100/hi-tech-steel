
import { list } from "@vercel/blob";
import { NextResponse } from "next/server";
import { products } from "../../../lib/products";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const result = await list({
      prefix: "products/"
    });

    const items = products.map((product) => {
      const photo = result.blobs.find((blob) =>
        blob.pathname.startsWith(
          `products/${product.id}.`
        )
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
