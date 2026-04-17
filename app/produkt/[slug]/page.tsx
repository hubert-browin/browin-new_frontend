import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";

import { ProductDetail } from "@/components/store/product-detail";
import { products } from "@/data/products";
import {
  getComplementaryProducts,
  getRelatedProducts,
  resolveProductSlug,
} from "@/lib/catalog";

export async function generateStaticParams() {
  return products.map((product) => ({ slug: product.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const resolvedProduct = resolveProductSlug(slug);

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
  const resolvedProduct = resolveProductSlug(slug);

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
      complementaryProducts={getComplementaryProducts(product)}
      product={product}
      relatedProducts={getRelatedProducts(product)}
    />
  );
}
