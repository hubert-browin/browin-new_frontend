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
