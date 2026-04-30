import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { InfoPageView } from "@/components/store/info-page";
import { getInfoPageByPath, getTopLevelInfoSlugs } from "@/data/info-pages";

export async function generateStaticParams() {
  return getTopLevelInfoSlugs();
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const page = getInfoPageByPath(`/${slug}`);

  if (!page) {
    return { title: "Strona nie istnieje" };
  }

  return {
    title: page.title,
    description: page.lead,
    alternates: { canonical: page.path },
  };
}

export default async function TopLevelInfoPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const page = getInfoPageByPath(`/${slug}`);

  if (!page) {
    notFound();
  }

  return <InfoPageView page={page} />;
}
