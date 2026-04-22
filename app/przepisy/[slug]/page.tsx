import { redirect } from "next/navigation";

export default async function OldRecipePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  redirect(`/przepisnik/przepis/${slug}`);
}
