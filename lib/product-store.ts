import { list, put } from "@vercel/blob";
import { products as defaultProducts, Product } from "./products";

const TOKEN = process.env.PUBLIC_BLOB_READ_WRITE_TOKEN;
const DATA_PREFIX = "product-data/";

export async function getProducts(): Promise<Product[]> {
  if (!TOKEN) {
    throw new Error("Public Blob token is missing");
  }

  const result = await list({
    prefix: DATA_PREFIX,
    token: TOKEN
  });

  if (result.blobs.length === 0) {
    return defaultProducts.map((item) => ({ ...item }));
  }

  const latest = result.blobs.sort(
    (a, b) =>
      new Date(b.uploadedAt).getTime() -
      new Date(a.uploadedAt).getTime()
  )[0];

  const response = await fetch(latest.url, {
    cache: "no-store"
  });

  if (!response.ok) {
    throw new Error("Unable to read saved products");
  }

  const data = await response.json();

  if (!Array.isArray(data)) {
    throw new Error("Invalid product data");
  }

  return data as Product[];
}

export async function saveProducts(items: Product[]) {
  if (!TOKEN) {
    throw new Error("Public Blob token is missing");
  }

  await put(
    `${DATA_PREFIX}products.json`,
    JSON.stringify(items),
    {
      access: "public",
      addRandomSuffix: true,
      contentType: "application/json",
      token: TOKEN
    }
  );
}