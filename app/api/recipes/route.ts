import { RECIPEBOOK_PAGE_SIZE } from "@/data/recipes";
import { getRecipebookPage } from "@/lib/recipes";

const readPositiveInteger = (value: string | null, fallback: number) => {
  const parsed = Number.parseInt(value ?? "", 10);

  if (Number.isNaN(parsed)) {
    return fallback;
  }

  return Math.max(0, parsed);
};

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const categorySlug = searchParams.get("category")?.trim() ?? "";
  const searchQuery = searchParams.get("search")?.trim() ?? "";
  const offset = readPositiveInteger(searchParams.get("offset"), 0);
  const limit = Math.min(
    Math.max(readPositiveInteger(searchParams.get("limit"), RECIPEBOOK_PAGE_SIZE), 1),
    RECIPEBOOK_PAGE_SIZE,
  );
  const page = await getRecipebookPage({
    categorySlug,
    limit,
    offset,
    searchQuery,
  });

  return Response.json(page);
}
