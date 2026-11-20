import { NextRequest, NextResponse } from "next/server";
import { list, del } from "@vercel/blob";

import {
  verifyAdminSession,
  COOKIE_NAME
} from "../../../../lib/auth";

import {
  getProducts,
  saveProducts
} from "../../../../lib/product-store";

import { Product } from "../../../../lib/products";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const TOKEN = process.env.PUBLIC_BLOB_READ_WRITE_TOKEN;

function authorized(request: NextRequest) {
  return verifyAdminSession(
    request.cookies.get(COOKIE_NAME)?.value
  );
}

function validText(value: unknown, max = 500) {
  return typeof value === "string" &&
    value.trim().length > 0 &&
    value.length <= max;
}

function validProduct(data: any) {
  return (
    validText(data.name, 100) &&
    (data.category === "Door" || data.category === "Window") &&
    validText(data.size, 100) &&
    validText(data.option, 100) &&
    typeof data.description === "string" &&
    data.description.length <= 1000
  );
}

// ADD PRODUCT
export async function POST(request: NextRequest) {
  if (!authorized(request)) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

  try {
    const data = await request.json();

    if (!validProduct(data)) {
      return NextResponse.json(
        { error: "Please enter valid product details" },
        { status: 400 }
      );
    }

    const products = await getProducts();

    const id = products.length
      ? Math.max(...products.map((p) => p.id)) + 1
      : 1;

    const newProduct: Product = {
      id,
      name: data.name.trim(),
      category: data.category,
      size: data.size.trim(),
      option: data.option.trim(),
      description: data.description.trim()
    };

    await saveProducts([...products, newProduct]);

    return NextResponse.json({
      success: true,
      product: newProduct
    });

  } catch (error) {
    console.error("Add product error:", error);

    return NextResponse.json(
      { error: "Unable to add product" },
      { status: 500 }
    );
  }
}

// EDIT PRODUCT
export async function PUT(request: NextRequest) {
  if (!authorized(request)) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

  try {
    const data = await request.json();
    const id = Number(data.id);

    if (!Number.isInteger(id) || !validProduct(data)) {
      return NextResponse.json(
        { error: "Invalid product details" },
        { status: 400 }
      );
    }

    const products = await getProducts();
    const index = products.findIndex((p) => p.id === id);

    if (index === -1) {
      return NextResponse.json(
        { error: "Product not found" },
        { status: 404 }
      );
    }

    const updated: Product = {
      id,
      name: data.name.trim(),
      category: data.category,
      size: data.size.trim(),
      option: data.option.trim(),
      description: data.description.trim()
    };

    products[index] = updated;

    await saveProducts(products);

    return NextResponse.json({
      success: true,
      product: updated
    });

  } catch (error) {
    console.error("Edit product error:", error);

    return NextResponse.json(
      { error: "Unable to update product" },
      { status: 500 }
    );
  }
}

// DELETE PRODUCT
export async function DELETE(request: NextRequest) {
  if (!authorized(request)) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

  try {
    if (!TOKEN) {
      throw new Error("Blob token missing");
    }

    const data = await request.json();
    const id = Number(data.id);

    if (!Number.isInteger(id)) {
      return NextResponse.json(
        { error: "Invalid product ID" },
        { status: 400 }
      );
    }

    const products = await getProducts();
    const exists = products.some((p) => p.id === id);

    if (!exists) {
      return NextResponse.json(
        { error: "Product not found" },
        { status: 404 }
      );
    }

    await saveProducts(
      products.filter((p) => p.id !== id)
    );

    // Delete this product's photo, if one exists
    const result = await list({
      prefix: "products/",
      token: TOKEN
    });

    const photos = result.blobs.filter((blob) => {
      const filename = blob.pathname.split("/").pop() || "";

      return new RegExp(
        `^${id}(?:[-.]|$)`
      ).test(filename);
    });

    if (photos.length > 0) {
      await del(
        photos.map((photo) => photo.url),
        { token: TOKEN }
      );
    }

    return NextResponse.json({
      success: true
    });

  } catch (error) {
    console.error("Delete product error:", error);

    return NextResponse.json(
      { error: "Unable to delete product" },
      { status: 500 }
    );
  }
}