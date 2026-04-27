function SkeletonBlock({ className }: { className: string }) {
  return <div className={`skeleton-shimmer rounded-[24px] ${className}`} />;
}

export function HomeSkeleton() {
  return (
    <div className="mx-auto w-full max-w-[1320px] px-4 py-8 md:px-6 xl:px-8">
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_420px]">
        <SkeletonBlock className="h-[520px]" />
        <SkeletonBlock className="h-[520px]" />
      </div>
      <SkeletonBlock className="mt-8 h-36" />
      <div className="mt-8 grid gap-4 md:grid-cols-3">
        <SkeletonBlock className="h-64" />
        <SkeletonBlock className="h-64" />
        <SkeletonBlock className="h-64" />
      </div>
      <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <SkeletonBlock className="h-[420px]" />
        <SkeletonBlock className="h-[420px]" />
        <SkeletonBlock className="h-[420px]" />
        <SkeletonBlock className="h-[420px]" />
      </div>
    </div>
  );
}

export function CatalogSkeleton() {
  return (
    <div className="mx-auto w-full max-w-[1320px] px-4 py-8 md:px-6 xl:px-8">
      <SkeletonBlock className="h-48" />
      <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <SkeletonBlock className="h-[420px]" />
        <SkeletonBlock className="h-[420px]" />
        <SkeletonBlock className="h-[420px]" />
        <SkeletonBlock className="h-[420px]" />
      </div>
    </div>
  );
}

export function ProductDetailSkeleton() {
  return (
    <div className="mx-auto w-full max-w-[1320px] px-4 py-8 md:px-6 xl:px-8">
      <SkeletonBlock className="h-[640px]" />
      <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <SkeletonBlock className="h-[420px]" />
        <SkeletonBlock className="h-[420px]" />
        <SkeletonBlock className="h-[420px]" />
        <SkeletonBlock className="h-[420px]" />
      </div>
    </div>
  );
}

export function RecipeDetailSkeleton() {
  return (
    <section className="bg-browin-gray pb-16">
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_18rem]">
        <div className="min-w-0 bg-browin-white lg:shadow-sm">
          <div className="border-b border-browin-dark/10 p-4 md:p-8 lg:border">
            <SkeletonBlock className="h-7 w-40 rounded-sm" />
            <div className="mt-5">
              <SkeletonBlock className="h-8 w-28 rounded-sm" />
              <SkeletonBlock className="mt-5 h-14 w-full max-w-4xl rounded-sm" />
              <SkeletonBlock className="mt-4 h-6 w-full max-w-3xl rounded-sm" />
              <SkeletonBlock className="mt-2 h-6 w-4/5 max-w-2xl rounded-sm" />
            </div>
            <SkeletonBlock className="mt-6 h-[18rem] w-full rounded-sm md:h-[22rem]" />
          </div>
          <div className="border-b border-browin-dark/10 bg-browin-gray/55 p-4 md:p-7 lg:border-x">
            <SkeletonBlock className="h-4 w-32 rounded-sm" />
            <SkeletonBlock className="mt-5 h-5 w-full rounded-sm" />
            <SkeletonBlock className="mt-2 h-5 w-11/12 rounded-sm" />
            <SkeletonBlock className="mt-2 h-5 w-4/5 rounded-sm" />
          </div>
          <div className="border-b border-browin-dark/10 p-4 md:p-8 lg:border-x">
            <SkeletonBlock className="h-4 w-28 rounded-sm" />
            <SkeletonBlock className="mt-5 h-5 w-full rounded-sm" />
            <SkeletonBlock className="mt-2 h-5 w-full rounded-sm" />
            <SkeletonBlock className="mt-2 h-5 w-10/12 rounded-sm" />
            <SkeletonBlock className="mt-6 h-56 w-full rounded-sm" />
            <SkeletonBlock className="mt-6 h-5 w-full rounded-sm" />
            <SkeletonBlock className="mt-2 h-5 w-11/12 rounded-sm" />
            <SkeletonBlock className="mt-2 h-5 w-4/5 rounded-sm" />
          </div>
        </div>

        <aside className="hidden overflow-hidden border border-browin-dark/10 bg-browin-white shadow-sm lg:block">
          <div className="border-b border-browin-dark/10 px-4 py-3.5">
            <SkeletonBlock className="h-4 w-32 rounded-sm" />
            <SkeletonBlock className="mt-2 h-7 w-24 rounded-sm" />
          </div>
          <div className="px-4 py-3.5">
            <SkeletonBlock className="h-5 w-full rounded-sm" />
            <SkeletonBlock className="mt-3 h-5 w-5/6 rounded-sm" />
            <SkeletonBlock className="mt-3 h-5 w-full rounded-sm" />
            <SkeletonBlock className="mt-3 h-5 w-4/5 rounded-sm" />
            <SkeletonBlock className="mt-6 h-5 w-3/4 rounded-sm" />
          </div>
        </aside>
      </div>
    </section>
  );
}
