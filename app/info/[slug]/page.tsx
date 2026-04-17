import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { InfoPageView } from "@/components/store/info-page";
import { getInfoPage, infoPages } from "@/data/info-pages";

export async function generateStaticParams() {
  return infoPages.map((page) => ({ slug: page.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const page = getInfoPage(slug);

  if (!page) {
    return { title: "Strona nie istnieje" };
  }

  return {
    title: page.title,
    description: page.lead,
    alternates: { canonical: `/info/${page.slug}` },
  };
}

export default async function InfoPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const page = getInfoPage(slug);

  if (!page) {
    notFound();
  }

  return <InfoPageView page={page} />;
}
