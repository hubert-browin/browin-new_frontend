import { redirect } from "next/navigation";

type SearchParamRecord = Record<string, string | string[] | undefined>;

const appendSearchParams = (target: string, searchParams: SearchParamRecord) => {
  const params = new URLSearchParams();

  for (const [key, value] of Object.entries(searchParams)) {
    if (Array.isArray(value)) {
      value.forEach((entry) => params.append(key, entry));
      continue;
    }

    if (value !== undefined) {
      params.set(key, value);
    }
  }

  return params.size ? `${target}?${params.toString()}` : target;
};

export default async function OldRecipesPage({
  searchParams,
}: {
  searchParams: Promise<SearchParamRecord>;
}) {
  redirect(appendSearchParams("/przepisnik", await searchParams));
}
