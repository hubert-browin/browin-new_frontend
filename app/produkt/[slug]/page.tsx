import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";

import { ProductDetail } from "@/components/store/product-detail";
import {
  getComplementaryProducts,
  getRelatedProducts,
  resolveProductSlug,
} from "@/lib/catalog";
import { getProducts } from "@/lib/product-feed";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const products = await getProducts();
  const resolvedProduct = resolveProductSlug(products, slug);

  if (!resolvedProduct) {
    return {
      title: "Produkt nie istnieje",
    };
  }

  const { canonicalSlug, product } = resolvedProduct;

  return {
    title: product.title,
    description: product.shortDescription,
    alternates: {
      canonical: `/produkt/${canonicalSlug}`,
    },
  };
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const products = await getProducts();
  const resolvedProduct = resolveProductSlug(products, slug);

  if (!resolvedProduct) {
    notFound();
  }

  if (resolvedProduct.isAlias) {
    redirect(`/produkt/${resolvedProduct.canonicalSlug}`);
  }

  const { product } = resolvedProduct;

  return (
    <ProductDetail
      key={product.id}
      complementaryProducts={getComplementaryProducts(products, product)}
      product={product}
      relatedProducts={getRelatedProducts(products, product)}
    />
  );
}
