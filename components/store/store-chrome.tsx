"use client";

import {
  ArrowRight,
  ArrowsLeftRight,
  BookOpen,
  Calculator,
  Camera,
  CaretLeft,
  CaretDown,
  CaretRight,
  Check,
  Gift,
  Globe,
  Handshake,
  Heart,
  List,
  MagnifyingGlass,
  Plus,
  ShoppingCart,
  Sliders,
  SquaresFour,
  Tag,
  User,
  X,
} from "@phosphor-icons/react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import { CartDrawer } from "@/components/store/cart-drawer";
import { StoreFooter } from "@/components/store/store-footer";
import { StoreIcon } from "@/components/store/icon-map";
import { useCart } from "@/components/store/cart-provider";
import { useFavorites } from "@/components/store/favorites-provider";
import {
  trustBadges,
  type CategoryId,
  type CategoryTopic,
  type StoreCategory,
} from "@/data/store";
import { formatCurrency } from "@/lib/catalog";

type StoreChromeProps = {
  children: React.ReactNode;
  storeCategories: StoreCategory[];
};

type MobileSearchFormProps = {
  className?: string;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
  searchSeed: string;
};

type MobileBottomNavItem = "home" | "categories" | "recipes" | "cart" | null;

const topBarLinks = [
  { label: "Dostawa i płatność", href: "/checkout" },
  { label: "Kontakt", href: "/checkout" },
  { label: "Blog", href: "/produkty?search=poradnik" },
] as const;

const mobileMenuQuickLinks = [
  {
    href: "/produkty?search=termometr",
    icon: Calculator,
    label: "Kalkulatory",
  },
  {
    href: "/produkty?search=starter",
    icon: Sliders,
    label: "Konfigurator",
  },
  {
    href: "/produkty?search=prezent",
    icon: Gift,
    label: "Prezenty",
  },
  {
    href: "/checkout",
    icon: Handshake,
    label: "Usługi",
  },
] as const;

const dockUtilityLinks = [
  {
    href: "/produkty?search=zestaw",
    icon: BookOpen,
    label: "Przepiśnik",
  },
  ...mobileMenuQuickLinks,
] as const;

const buildCategoryHref = (slug: string, query?: string) =>
  query ? `/kategoria/${slug}?search=${encodeURIComponent(query)}` : `/kategoria/${slug}`;

const mobileBottomNavItemClass =
  "flex w-16 flex-col items-center text-browin-dark/60 transition-colors hover:text-browin-red";

const getMobileBottomNavIconClass = (isActive: boolean) =>
  isActive ? "text-browin-red" : "text-browin-dark/60";

const getMobileBottomNavActiveItem = ({
  isCartOpen,
  isMenuOpen,
  pathname,
}: {
  isCartOpen: boolean;
  isMenuOpen: boolean;
  pathname: string;
}): MobileBottomNavItem => {
  if (isCartOpen) {
    return "cart";
  }

  if (isMenuOpen) {
    return "categories";
  }

  if (pathname === "/koszyk") {
    return "cart";
  }

  if (pathname.startsWith("/kategoria")) {
    return "categories";
  }

  if (pathname === "/produkty") {
    return "recipes";
  }

  if (pathname === "/") {
    return "home";
  }

  return null;
};

function MobileSearchForm({
  className = "",
  onSubmit,
  searchSeed,
}: MobileSearchFormProps) {
  return (
    <form
      className={`group relative flex min-h-12 items-stretch overflow-hidden border border-browin-dark/12 bg-browin-white transition-colors focus-within:border-browin-red ${className}`}
      onSubmit={onSubmit}
    >
      <div className="relative min-w-0 flex-1">
        <input
          className="search-ui-copy block h-full w-full rounded-none border-0 bg-transparent pl-11 pr-4 text-browin-dark transition-colors placeholder:text-browin-dark/45 focus:bg-transparent"
          defaultValue={searchSeed}
          name="search"
          placeholder="Szukaj produktów..."
        />
        <MagnifyingGlass
          className="absolute left-3.5 top-1/2 -translate-y-1/2 text-browin-dark/40 transition-colors group-focus-within:text-browin-red"
          size={18}
        />
      </div>
      <button
        className="search-ui-copy flex shrink-0 items-center justify-center border-l border-browin-dark/10 bg-browin-red px-5 text-sm font-bold text-browin-white transition-colors hover:bg-browin-red/90"
        type="submit"
      >
        Szukaj
      </button>
    </form>
  );
}

const getUniqueTopics = (category: StoreCategory) => {
  const seenTopics = new Set<string>();

  return category.menuSections
    .flatMap((section) => section.topics)
    .filter((topic) => {
      const topicKey = `${topic.label}::${topic.query ?? ""}`;

      if (seenTopics.has(topicKey)) {
        return false;
      }

      seenTopics.add(topicKey);

      return true;
    });
};

export function StoreChrome({ children, storeCategories }: StoreChromeProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { closeCart, count: cartCount, isOpen, openCart, subtotal } = useCart();
  const { count: favoritesCount } = useFavorites();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileLangOpen, setMobileLangOpen] = useState(false);
  const [activeMobileCategoryId, setActiveMobileCategoryId] =
    useState<CategoryId | null>(null);
  const [isIslandEnabled, setIsIslandEnabled] = useState(false);
  const [breadcrumbCategoryId, setBreadcrumbCategoryId] = useState<CategoryId | null>(
    null,
  );
  const [breadcrumbTopic, setBreadcrumbTopic] = useState<CategoryTopic | null>(null);
  const [breadcrumbMenuOpen, setBreadcrumbMenuOpen] = useState(false);
  const [breadcrumbMenuMode, setBreadcrumbMenuMode] = useState<"categories" | "topics">(
    "categories",
  );
  const [activeIslandCategoryId, setActiveIslandCategoryId] = useState<CategoryId | null>(
    storeCategories[0]?.id ?? null,
  );
  const [activeDockCategoryId, setActiveDockCategoryId] = useState<CategoryId | null>(
    null,
  );
  const breadcrumbRef = useRef<HTMLDivElement | null>(null);
  const dockRef = useRef<HTMLElement | null>(null);
  const dockHoverIntentTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const searchSeed = "";
  const isProductPage = pathname.startsWith("/produkt/");
  const showDesktopNav = pathname !== "/";
  const routeBreadcrumbCategory =
    storeCategories.find((category) => pathname === `/kategoria/${category.slug}`) ??
    null;
  const stateBreadcrumbCategory =
    storeCategories.find((category) => category.id === breadcrumbCategoryId) ?? null;
  const activeBreadcrumbCategory = routeBreadcrumbCategory ?? stateBreadcrumbCategory;
  const activeIslandCategory =
    storeCategories.find((category) => category.id === activeIslandCategoryId) ??
    storeCategories[0] ??
    null;
  const activeDockCategory =
    storeCategories.find((category) => category.id === activeDockCategoryId) ?? null;
  const highlightedDockCategory = activeDockCategory ?? routeBreadcrumbCategory;
  const activeIslandSections = activeIslandCategory
    ? activeIslandCategory.menuSections.slice(0, 2)
    : [];
  const activeBreadcrumbTopics = activeBreadcrumbCategory
    ? getUniqueTopics(activeBreadcrumbCategory)
    : [];
  const activeBreadcrumbTopic =
    activeBreadcrumbCategory?.id === breadcrumbCategoryId ? breadcrumbTopic : null;
  const activeDockSections = activeDockCategory
    ? activeDockCategory.menuSections.slice(0, 2)
    : [];
  const contentShellClass = `min-h-screen transition-[margin] duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${
    showDesktopNav ? "md:ml-20" : ""
  }`;
  const activeMobileBottomNavItem = getMobileBottomNavActiveItem({
    isCartOpen: isOpen,
    isMenuOpen: mobileMenuOpen,
    pathname,
  });
  const isHomeBottomNavActive = activeMobileBottomNavItem === "home";
  const isCategoriesBottomNavActive = activeMobileBottomNavItem === "categories";
  const isRecipesBottomNavActive = activeMobileBottomNavItem === "recipes";
  const isCartBottomNavActive = activeMobileBottomNavItem === "cart";
  const activeMobileCategory =
    storeCategories.find((category) => category.id === activeMobileCategoryId) ?? null;

  useEffect(() => {
    document.body.style.overflow = mobileMenuOpen || isOpen ? "hidden" : "";

    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen, mobileMenuOpen]);

  useEffect(() => {
    if (!showDesktopNav || !activeDockCategoryId) {
      return;
    }

    const closeDockOnOutsideClick = (event: PointerEvent) => {
      if (!dockRef.current?.contains(event.target as Node)) {
        setActiveDockCategoryId(null);
      }
    };

    document.addEventListener("pointerdown", closeDockOnOutsideClick);

    return () => {
      document.removeEventListener("pointerdown", closeDockOnOutsideClick);
    };
  }, [activeDockCategoryId, showDesktopNav]);

  useEffect(() => {
    if (!showDesktopNav || !breadcrumbMenuOpen) {
      return;
    }

    const closeBreadcrumbOnOutsideClick = (event: PointerEvent) => {
      if (!breadcrumbRef.current?.contains(event.target as Node)) {
        setBreadcrumbMenuOpen(false);
      }
    };

    document.addEventListener("pointerdown", closeBreadcrumbOnOutsideClick);

    return () => {
      document.removeEventListener("pointerdown", closeBreadcrumbOnOutsideClick);
    };
  }, [breadcrumbMenuOpen, showDesktopNav]);

  useEffect(() => {
    return () => {
      if (dockHoverIntentTimeout.current) {
        clearTimeout(dockHoverIntentTimeout.current);
      }
    };
  }, []);

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
    setMobileLangOpen(false);
    setActiveMobileCategoryId(null);
  };

  const closeMobileOverlays = () => {
    closeMobileMenu();
    closeCart();
  };

  const openMobileMenu = () => {
    closeCart();
    setMobileLangOpen(false);
    setActiveMobileCategoryId(null);
    setMobileMenuOpen(true);
  };

  const toggleMobileMenuFromBottomNav = () => {
    if (mobileMenuOpen) {
      closeMobileMenu();
      return;
    }

    openMobileMenu();
  };

  const handleOpenCart = () => {
    closeMobileMenu();
    openCart();
  };

  const toggleCartFromBottomNav = () => {
    if (isOpen) {
      closeCart();
      return;
    }

    handleOpenCart();
  };

  const handleHomeBottomNavClick = (event: React.MouseEvent<HTMLAnchorElement>) => {
    if (pathname !== "/") {
      closeMobileOverlays();
      return;
    }

    event.preventDefault();
    closeMobileOverlays();
    window.scrollTo({
      behavior: "smooth",
      left: 0,
      top: 0,
    });
  };

  const handleSearchSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);
    const trimmedSearch = String(formData.get("search") ?? "").trim();
    const params = new URLSearchParams();

    if (trimmedSearch) {
      params.set("search", trimmedSearch);
    }

    router.push(params.size ? `/produkty?${params.toString()}` : "/produkty");
    setBreadcrumbMenuOpen(false);
    closeMobileMenu();
  };

  const openBreadcrumbCategoryMenu = () => {
    setBreadcrumbCategoryId(null);
    setBreadcrumbTopic(null);
    setBreadcrumbMenuMode("categories");
    setBreadcrumbMenuOpen((current) => !current || Boolean(activeBreadcrumbCategory));
  };

  const toggleBreadcrumbTopicsMenu = () => {
    setBreadcrumbMenuMode("topics");
    setBreadcrumbMenuOpen((current) =>
      breadcrumbMenuMode === "topics" ? !current : true,
    );
  };

  const selectBreadcrumbCategory = (categoryId: CategoryId) => {
    const category = storeCategories.find((entry) => entry.id === categoryId);

    setBreadcrumbCategoryId(categoryId);
    setBreadcrumbTopic(null);
    setBreadcrumbMenuMode("topics");
    setBreadcrumbMenuOpen(true);

    if (category) {
      router.push(`/kategoria/${category.slug}`);
    }
  };

  const selectBreadcrumbTopic = (topic: CategoryTopic) => {
    if (activeBreadcrumbCategory) {
      setBreadcrumbCategoryId(activeBreadcrumbCategory.id);
    }

    setBreadcrumbTopic(topic);
    setBreadcrumbMenuOpen(false);
  };

  const navigateAfterPaint = (href: string) => {
    window.requestAnimationFrame(() => {
      router.push(href);
    });
  };

  const scheduleDockCategoryPreview = (categoryId: CategoryId) => {
    if (dockHoverIntentTimeout.current) {
      clearTimeout(dockHoverIntentTimeout.current);
    }

    dockHoverIntentTimeout.current = setTimeout(() => {
      setActiveDockCategoryId(categoryId);
      dockHoverIntentTimeout.current = null;
    }, 120);
  };

  const cancelDockCategoryPreview = () => {
    if (dockHoverIntentTimeout.current) {
      clearTimeout(dockHoverIntentTimeout.current);
      dockHoverIntentTimeout.current = null;
    }
  };

  return (
    <div className="min-h-screen bg-browin-gray text-browin-dark">
      {showDesktopNav ? (
        <button
          aria-pressed={isIslandEnabled}
          className="fixed bottom-4 right-4 z-[120] hidden items-center gap-2 rounded-full border border-browin-dark/10 bg-browin-white/90 p-1.5 pr-3 text-[11px] font-extrabold uppercase text-browin-dark shadow-2xl backdrop-blur-md transition-colors hover:text-browin-red md:flex"
          onClick={() => setIsIslandEnabled((current) => !current)}
          type="button"
        >
          <span
            className={`relative flex h-5 w-9 shrink-0 items-center rounded-full transition-colors ${
              isIslandEnabled ? "bg-browin-red" : "bg-browin-dark/15"
            }`}
          >
            <span
              className={`absolute h-4 w-4 rounded-full bg-browin-white transition-transform ${
                isIslandEnabled ? "translate-x-4" : "translate-x-0.5"
              }`}
            />
          </span>
          Island
        </button>
      ) : null}

      {showDesktopNav && isIslandEnabled && activeIslandCategory ? (
        <nav
          aria-label="Kategorie sklepu"
          className="group/island fixed bottom-8 left-1/2 z-[100] hidden -translate-x-1/2 md:block"
        >
          <div className="pointer-events-none absolute bottom-9 left-0 right-0 translate-y-3 rounded-t-[2rem] border border-browin-dark/10 bg-white/85 px-6 pb-16 pt-4 opacity-0 shadow-2xl backdrop-blur-md transition-all duration-200 group-hover/island:pointer-events-auto group-hover/island:translate-y-0 group-hover/island:opacity-100">
            <div className="mb-4 flex items-center justify-between gap-4 border-b border-browin-dark/8 pb-3">
              <div className="flex min-w-0 items-center gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-browin-red/10 text-browin-red">
                  <StoreIcon icon={activeIslandCategory.icon} size={22} weight="fill" />
                </span>
                <div className="min-w-0">
                  <p className="text-[10px] font-bold uppercase text-browin-dark/45">
                    Kategoria
                  </p>
                  <h3 className="truncate text-sm font-extrabold text-browin-dark">
                    {activeIslandCategory.label}
                  </h3>
                </div>
              </div>

              <Link
                className="shrink-0 rounded-full border border-browin-red/25 px-3 py-1.5 text-[11px] font-extrabold uppercase text-browin-red transition-colors hover:border-browin-red hover:bg-browin-red hover:text-browin-white"
                href={`/kategoria/${activeIslandCategory.slug}`}
              >
                Wszystkie
              </Link>
            </div>

            <div className="grid max-h-[18rem] grid-cols-2 gap-5 overflow-y-auto pr-1">
              {activeIslandSections.map((section) => (
                <div key={section.title}>
                  <div className="space-y-1">
                    {section.topics.map((topic) => (
                      <Link
                        className="block rounded-md px-2 py-1.5 text-[12px] font-semibold leading-snug text-browin-dark/75 transition-colors hover:bg-browin-dark/5 hover:text-browin-red"
                        href={buildCategoryHref(activeIslandCategory.slug, topic.query)}
                        key={`${section.title}-${topic.label}-${topic.query ?? ""}`}
                      >
                        {topic.label}
                      </Link>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="relative z-10 flex items-center gap-2 rounded-full border border-browin-dark/10 bg-white/80 px-6 py-3 shadow-2xl backdrop-blur-md">
            {storeCategories.map((category) => {
              const isActive = category.id === activeIslandCategory.id;

              return (
                <Link
                  aria-label={category.label}
                  className={`flex h-12 w-12 items-center justify-center rounded-full border transition-all duration-200 ${
                    isActive
                      ? "-translate-y-0.5 border-browin-red/20 bg-browin-red text-browin-white"
                      : "border-transparent text-browin-dark hover:-translate-y-0.5 hover:border-browin-red/20 hover:bg-browin-red hover:text-browin-white"
                  }`}
                  href={`/kategoria/${category.slug}`}
                  key={category.id}
                  onFocus={() => setActiveIslandCategoryId(category.id)}
                  onMouseEnter={() => setActiveIslandCategoryId(category.id)}
                >
                  <StoreIcon icon={category.icon} size={23} weight="fill" />
                </Link>
              );
            })}
          </div>
        </nav>
      ) : null}

      {showDesktopNav ? (
        <aside
          className="group/dock fixed left-0 top-0 z-[100] hidden h-screen w-20 overflow-visible border-r border-browin-dark/10 bg-browin-white text-browin-dark transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] hover:w-72 md:block"
          ref={dockRef}
        >
          <div className="flex h-full flex-col overflow-hidden">
            <div className="min-h-0 flex-1 overflow-y-auto px-3 py-3 [@media_(min-width:1024px)_and_(max-width:1439px)_and_(max-height:860px)]:py-2">
              <nav aria-label="Kategorie sklepu" className="divide-y divide-browin-dark/5">
                {storeCategories.map((category) => {
                  const isActive = highlightedDockCategory?.id === category.id;

                  return (
                    <button
                      className="group/category flex min-h-14 w-full items-center justify-between rounded-md px-1 py-2 text-left text-browin-dark transition-colors hover:text-browin-red [@media_(min-width:1024px)_and_(max-width:1439px)_and_(max-height:860px)]:min-h-[3.25rem] [@media_(min-width:1024px)_and_(max-width:1439px)_and_(max-height:860px)]:py-1.5"
                      key={category.id}
                      onClick={() => {
                        navigateAfterPaint(`/kategoria/${category.slug}`);
                      }}
                      onFocus={() => setActiveDockCategoryId(category.id)}
                      onMouseEnter={() => scheduleDockCategoryPreview(category.id)}
                      onMouseLeave={cancelDockCategoryPreview}
                      type="button"
                    >
                      <span className="flex min-w-0 items-center gap-3">
                        <span
                          className={`flex h-12 w-12 shrink-0 items-center justify-center border transition-colors [@media_(min-width:1024px)_and_(max-width:1439px)_and_(max-height:860px)]:h-11 [@media_(min-width:1024px)_and_(max-width:1439px)_and_(max-height:860px)]:w-11 ${
                            isActive
                              ? "border-browin-red/20 bg-browin-red/8 text-browin-red"
                              : "border-browin-dark/10 bg-browin-white text-browin-dark group-hover/category:bg-browin-dark/5 group-hover/category:text-browin-red"
                          }`}
                        >
                          <StoreIcon
                            className="[@media_(min-width:1024px)_and_(max-width:1439px)_and_(max-height:860px)]:h-[22px] [@media_(min-width:1024px)_and_(max-width:1439px)_and_(max-height:860px)]:w-[22px]"
                            icon={category.icon}
                            size={23}
                            weight={isActive ? "fill" : "regular"}
                          />
                        </span>
                        <span className="max-w-0 overflow-hidden whitespace-nowrap text-[14px] font-bold opacity-0 transition-all duration-200 group-hover/dock:max-w-[11rem] group-hover/dock:opacity-100 [@media_(min-width:1024px)_and_(max-width:1439px)_and_(max-height:860px)]:text-[13px]">
                          {category.label}
                        </span>
                      </span>
                      <CaretRight
                        className={`shrink-0 opacity-0 transition-opacity duration-200 group-hover/dock:opacity-100 ${
                          isActive ? "text-browin-red" : "text-browin-dark/30"
                        }`}
                        size={14}
                      />
                    </button>
                  );
                })}
              </nav>
            </div>

            <div className="pointer-events-none shrink-0 border-t border-browin-dark/8 bg-browin-white px-3 py-3 opacity-0 transition-opacity duration-200 group-hover/dock:pointer-events-auto group-hover/dock:opacity-100 [@media_(min-width:1024px)_and_(max-width:1439px)_and_(max-height:860px)]:py-2">
              <div className="space-y-2 [@media_(min-width:1024px)_and_(max-width:1439px)_and_(max-height:860px)]:space-y-1.5">
                {dockUtilityLinks
                  .filter((item) => item.label === "Przepiśnik")
                  .map((item) => {
                    const Icon = item.icon;

                    return (
                      <Link
                        className="group/link flex min-w-0 items-center gap-2 rounded-md border border-browin-red bg-browin-red px-2.5 py-2 text-[11px] font-bold text-browin-white transition-colors hover:bg-browin-red/90 [@media_(min-width:1024px)_and_(max-width:1439px)_and_(max-height:860px)]:py-1.5"
                        href={item.href}
                        key={item.label}
                      >
                        <Icon
                          className="shrink-0 text-browin-white transition-transform group-hover/link:scale-110"
                          size={16}
                          weight="fill"
                        />
                        <span className="truncate">{item.label}</span>
                      </Link>
                    );
                  })}

                <div className="grid grid-cols-1 gap-2 [@media_(min-width:1024px)_and_(max-width:1439px)_and_(max-height:860px)]:grid-cols-2 [@media_(min-width:1024px)_and_(max-width:1439px)_and_(max-height:860px)]:gap-1.5">
                  {dockUtilityLinks
                    .filter((item) => item.label !== "Przepiśnik")
                    .map((item) => {
                      const Icon = item.icon;

                      return (
                        <Link
                          className="group/link flex min-w-0 items-center justify-start gap-2 rounded-md border border-browin-dark/8 bg-browin-white px-2.5 py-2 text-[11px] font-bold text-browin-dark transition-colors hover:border-browin-red/25 hover:bg-browin-red/5 hover:text-browin-red [@media_(min-width:1024px)_and_(max-width:1439px)_and_(max-height:860px)]:min-h-8 [@media_(min-width:1024px)_and_(max-width:1439px)_and_(max-height:860px)]:gap-1.5 [@media_(min-width:1024px)_and_(max-width:1439px)_and_(max-height:860px)]:px-2 [@media_(min-width:1024px)_and_(max-width:1439px)_and_(max-height:860px)]:py-1.5 [@media_(min-width:1024px)_and_(max-width:1439px)_and_(max-height:860px)]:text-[10px] [@media_(min-width:1024px)_and_(max-width:1439px)_and_(max-height:860px)]:leading-none"
                          href={item.href}
                          key={item.label}
                        >
                          <Icon
                            className="shrink-0 text-browin-red transition-transform group-hover/link:scale-110 [@media_(min-width:1024px)_and_(max-width:1439px)_and_(max-height:860px)]:h-3.5 [@media_(min-width:1024px)_and_(max-width:1439px)_and_(max-height:860px)]:w-3.5"
                            size={16}
                            weight="fill"
                          />
                          <span className="truncate">{item.label}</span>
                        </Link>
                      );
                    })}
                </div>
              </div>
            </div>
          </div>

          {activeDockCategory ? (
            <div className="pointer-events-none absolute left-full top-0 flex h-screen w-80 translate-x-3 flex-col border-r border-browin-dark/10 bg-browin-white opacity-0 transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover/dock:pointer-events-auto group-hover/dock:translate-x-0 group-hover/dock:opacity-100">
              <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4">
                <Link
                  className="mb-4 inline-flex items-center gap-2 rounded-md border border-browin-dark/10 bg-browin-white px-3 py-2 text-[11px] font-bold uppercase tracking-[0.16em] text-browin-red transition-colors hover:border-browin-red hover:bg-browin-red/5"
                  href={`/kategoria/${activeDockCategory.slug}`}
                  onClick={() => setActiveDockCategoryId(null)}
                >
                  Zobacz wszystkie
                  <ArrowRight size={14} />
                </Link>

                <div className="space-y-4">
                  {activeDockSections.map((section) => (
                    <div key={section.title}>
                      <p className="mb-2 text-[10px] font-extrabold uppercase tracking-[0.14em] text-browin-dark/45">
                        {section.title}
                      </p>
                      <div className="divide-y divide-browin-dark/5 border-b border-browin-dark/5">
                        {section.topics.slice(0, 6).map((topic) => (
                          <Link
                            className="-mx-2 block rounded-md px-2 py-2.5 text-[13px] font-bold text-browin-dark/75 transition-colors hover:bg-browin-red/8 hover:text-browin-red"
                            href={buildCategoryHref(activeDockCategory.slug, topic.query)}
                            key={`${section.title}-${topic.label}-${topic.query ?? ""}`}
                            onClick={() => setActiveDockCategoryId(null)}
                          >
                            {topic.label}
                          </Link>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : null}
        </aside>
      ) : null}

      <div className={contentShellClass}>
      <div className="desktop-topbar hidden bg-browin-red py-2 text-[11px] text-browin-white md:block">
        <div className="container mx-auto flex items-center justify-between px-4">
          <div className="flex flex-wrap items-center gap-6 font-medium">
            {trustBadges.map((badge) => (
              <span className="flex items-center gap-2" key={badge.label}>
                <StoreIcon className="text-browin-white" icon={badge.icon} size={18} />
                <span>{badge.label}</span>
              </span>
            ))}
          </div>

          <div className="flex items-center gap-6">
            {topBarLinks.map((link) => (
              <Link
                className="font-medium transition-colors hover:text-browin-red"
                href={link.href}
                key={link.label}
              >
                {link.label}
              </Link>
            ))}

            <div className="relative flex cursor-pointer items-center gap-1 border-l border-browin-white/20 pl-4">
              <Globe size={16} />
              <span className="font-bold tracking-wide">PL</span>
              <CaretDown className="text-browin-white/70" size={10} />
            </div>
          </div>
        </div>
      </div>

      <header className="glass-header sticky top-0 z-50 border-b border-browin-border shadow-none transition-all duration-300">
        <div className="desktop-header-shell container relative mx-auto hidden items-center justify-between gap-5 px-4 py-3 md:flex">
          <Link className="z-10 flex-shrink-0" href="/">
            <Image
              alt="BROWIN"
              className="brand-logo object-contain"
              height={55}
              priority
              src="/assets/logo_BROWIN.svg"
              width={224}
            />
          </Link>

          <form
            className="desktop-header-search group relative flex min-h-[3.25rem] w-full max-w-none flex-grow items-stretch overflow-hidden border border-browin-dark/12 bg-browin-white transition-colors focus-within:border-browin-red"
            onSubmit={handleSearchSubmit}
          >
            <div className="relative min-w-0 flex-1">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                <MagnifyingGlass className="text-browin-dark/40 transition-colors group-focus-within:text-browin-red" size={20} />
              </div>
              <input
                className="search-ui-copy block h-full w-full rounded-none border-0 bg-transparent py-3.5 pl-12 pr-14 text-sm text-browin-dark outline-none transition-colors placeholder:text-browin-dark/45 focus:bg-transparent"
                defaultValue={searchSeed}
                name="search"
                placeholder="Szukaj sprzętu, drożdży, przepisów..."
              />
              <button
                className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-browin-dark/35 transition-colors hover:text-browin-red"
                title="Wyszukaj wizualnie po obrazku"
                type="button"
              >
                <Camera size={22} />
              </button>
            </div>
            <button
              className="search-ui-copy flex shrink-0 items-center justify-center border-l border-browin-dark/10 bg-browin-red px-7 text-sm font-bold text-browin-white transition-colors hover:bg-browin-red/90"
              type="submit"
            >
              Szukaj
            </button>
          </form>

          <div className="desktop-header-actions flex flex-shrink-0 items-center gap-2 lg:gap-3">
            <button className="border border-transparent p-2 text-browin-dark transition-colors hover:border-browin-dark/10 hover:text-browin-red" type="button">
              <User size={26} />
            </button>
            <button className="relative border border-transparent p-2 text-browin-dark transition-colors hover:border-browin-dark/10 hover:text-browin-red" type="button">
              <Heart size={26} />
              <span className="absolute right-1 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-browin-red text-[9px] font-bold text-browin-white">
                {favoritesCount}
              </span>
            </button>
            <button
              className="desktop-cart-trigger ml-2 flex cursor-pointer items-center border border-transparent p-2 transition-colors hover:border-browin-dark/10 hover:bg-browin-dark/5"
              onClick={handleOpenCart}
              type="button"
            >
              <div className="relative mr-3">
                <ShoppingCart className="text-browin-dark" size={28} />
                <span className="absolute -right-2 -top-1 flex h-5 w-5 items-center justify-center rounded-full border-2 border-browin-white bg-browin-red text-[10px] font-bold text-browin-white">
                  {cartCount}
                </span>
              </div>
              <div className="desktop-cart-copy flex flex-col items-start">
                <span className="text-[10px] font-bold uppercase tracking-wider text-browin-dark/60">
                  Koszyk
                </span>
                <span className="text-[14px] font-extrabold text-browin-dark">
                  {formatCurrency(subtotal)}
                </span>
              </div>
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between bg-browin-white px-3 py-2.5 md:hidden">
          <div className="flex min-w-0 items-center">
            <button className="-ml-1 mr-1 p-2 text-browin-dark focus:outline-none" onClick={openMobileMenu} type="button">
              <List size={26} />
            </button>
            <Link className="min-w-0 flex-shrink" href="/">
              <Image
                alt="BROWIN"
                className="brand-logo-mobile object-contain"
                height={35}
                priority
                src="/assets/logo_BROWIN.svg"
                width={162}
              />
            </Link>
          </div>

          <div className="flex shrink-0 items-center gap-4">
            <button
              aria-label="Logowanie"
              className="flex h-8 w-8 items-center justify-center text-browin-dark transition-colors hover:text-browin-red"
              type="button"
            >
              <User size={23} />
            </button>
            <button
              aria-label="Ulubione"
              className="relative flex h-8 w-8 items-center justify-center text-browin-dark transition-colors hover:text-browin-red"
              type="button"
            >
              <Heart size={23} />
              <span className="absolute -right-0.5 -top-0.5 flex h-[15px] w-[15px] items-center justify-center rounded-full bg-browin-red text-[8px] font-bold text-browin-white">
                {favoritesCount}
              </span>
            </button>
            <button
              aria-label="Koszyk"
              className="relative flex h-8 w-8 items-center justify-center text-browin-dark transition-colors hover:text-browin-red"
              onClick={handleOpenCart}
              type="button"
            >
              <ShoppingCart size={24} />
              <span className="absolute -right-0.5 -top-0.5 flex h-[15px] w-[15px] items-center justify-center rounded-full bg-browin-red text-[8px] font-bold text-browin-white">
                {cartCount}
              </span>
            </button>
          </div>
        </div>

        <div className="block border-t border-browin-dark/8 bg-browin-white px-4 pb-3 pt-2 md:hidden">
          <MobileSearchForm onSubmit={handleSearchSubmit} searchSeed={searchSeed} />
        </div>
      </header>

      {showDesktopNav ? (
        <div className="sticky top-20 z-40 hidden border-b border-browin-dark/8 bg-browin-white/92 backdrop-blur-md md:block [@media_(min-width:1024px)_and_(max-height:900px)]:top-[4.5rem]">
          <div className="container relative mx-auto flex h-12 items-center px-4" ref={breadcrumbRef}>
            <div className="flex min-w-0 items-center gap-1 text-sm font-semibold">
              <button
                aria-expanded={breadcrumbMenuOpen && breadcrumbMenuMode === "categories"}
                className="inline-flex items-center gap-2 rounded-md px-2.5 py-1.5 text-browin-dark/72 transition-colors hover:bg-browin-dark/5 hover:text-browin-red"
                onClick={openBreadcrumbCategoryMenu}
                type="button"
              >
                <SquaresFour
                  className="shrink-0 text-browin-red"
                  size={16}
                  weight="fill"
                />
                <span>Katalog produktów</span>
                {!activeBreadcrumbCategory ? (
                  <Plus
                    className="pointer-events-none shrink-0 text-browin-dark/35"
                    size={12}
                    weight="bold"
                  />
                ) : null}
              </button>

              {activeBreadcrumbCategory ? (
                <>
                  <CaretRight className="shrink-0 text-browin-dark/28" size={14} />
                  <button
                    aria-expanded={
                      !activeBreadcrumbTopic &&
                      breadcrumbMenuOpen &&
                      breadcrumbMenuMode === "topics"
                    }
                    className="inline-flex min-w-0 items-center gap-2 rounded-md px-2.5 py-1.5 text-browin-dark transition-colors hover:bg-browin-dark/5 hover:text-browin-red"
                    onClick={() => {
                      if (activeBreadcrumbTopic) {
                        setBreadcrumbCategoryId(activeBreadcrumbCategory.id);
                        setBreadcrumbTopic(null);
                        setBreadcrumbMenuOpen(false);
                        navigateAfterPaint(`/kategoria/${activeBreadcrumbCategory.slug}`);
                        return;
                      }

                      toggleBreadcrumbTopicsMenu();
                    }}
                    type="button"
                  >
                    <StoreIcon
                      className="shrink-0 text-browin-red"
                      icon={activeBreadcrumbCategory.icon}
                      size={16}
                      weight="fill"
                    />
                    <span className="truncate">{activeBreadcrumbCategory.label}</span>
                    {!activeBreadcrumbTopic ? (
                      <Plus
                        className="pointer-events-none shrink-0 text-browin-dark/35"
                        size={12}
                        weight="bold"
                      />
                    ) : null}
                  </button>
                </>
              ) : null}

              {activeBreadcrumbCategory && activeBreadcrumbTopic ? (
                <>
                  <CaretRight className="shrink-0 text-browin-dark/28" size={14} />
                  <button
                    aria-expanded={breadcrumbMenuOpen && breadcrumbMenuMode === "topics"}
                    className="inline-flex min-w-0 items-center gap-2 rounded-md px-2.5 py-1.5 text-browin-dark/72 transition-colors hover:bg-browin-dark/5 hover:text-browin-red"
                    onClick={toggleBreadcrumbTopicsMenu}
                    type="button"
                  >
                    <span className="truncate">
                      {activeBreadcrumbTopic.label}
                    </span>
                    <ArrowsLeftRight
                      className="pointer-events-none shrink-0 text-browin-red"
                      size={13}
                      weight="bold"
                    />
                  </button>
                </>
              ) : null}
            </div>

            {breadcrumbMenuOpen ? (
              <div className="absolute left-4 top-[calc(100%+0.5rem)] w-[28rem] overflow-hidden rounded-md border border-browin-dark/10 bg-browin-white shadow-2xl">
                {breadcrumbMenuMode === "categories" || !activeBreadcrumbCategory ? (
                  <div className="p-2">
                    <p className="px-3 pb-2 pt-1 text-[10px] font-extrabold uppercase tracking-[0.16em] text-browin-dark/40">
                      Kategorie
                    </p>
                    <Link
                      className="mb-2 flex items-center justify-between rounded-md bg-browin-dark/5 px-3 py-2.5 text-sm font-bold text-browin-dark transition-colors hover:bg-browin-red hover:text-browin-white"
                      href="/produkty"
                      onClick={() => {
                        setBreadcrumbCategoryId(null);
                        setBreadcrumbTopic(null);
                        setBreadcrumbMenuOpen(false);
                      }}
                    >
                      <span>Wyświetl wszystkie produkty</span>
                      <ArrowRight size={14} />
                    </Link>
                    <div className="grid grid-cols-2 gap-1">
                      {storeCategories.map((category) => (
                        <button
                          className="flex min-w-0 items-center gap-3 rounded-md px-3 py-2.5 text-left text-sm font-bold text-browin-dark transition-colors hover:bg-browin-dark/5 hover:text-browin-red"
                          key={category.id}
                          onClick={() => selectBreadcrumbCategory(category.id)}
                          type="button"
                        >
                          <StoreIcon
                            className="shrink-0 text-browin-red"
                            icon={category.icon}
                            size={18}
                            weight="fill"
                          />
                          <span className="truncate">{category.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="p-2">
                    <div className="flex items-center justify-between gap-3 px-3 pb-2 pt-1">
                      <p className="text-[10px] font-extrabold uppercase tracking-[0.16em] text-browin-dark/40">
                        {activeBreadcrumbCategory.label}
                      </p>
                      <button
                        aria-label="Zmień kategorię"
                        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-browin-red transition-colors hover:bg-browin-red/8"
                        onClick={() => {
                          setBreadcrumbCategoryId(null);
                          setBreadcrumbTopic(null);
                          setBreadcrumbMenuMode("categories");
                        }}
                        title="Zmień kategorię"
                        type="button"
                      >
                        <ArrowsLeftRight size={17} weight="bold" />
                      </button>
                    </div>

                    <Link
                      className="mb-2 flex items-center justify-between rounded-md bg-browin-dark/5 px-3 py-2.5 text-sm font-bold text-browin-dark transition-colors hover:bg-browin-red hover:text-browin-white"
                      href={`/kategoria/${activeBreadcrumbCategory.slug}`}
                      onClick={() => {
                        setBreadcrumbTopic(null);
                        setBreadcrumbMenuOpen(false);
                      }}
                    >
                      <span>Wszystkie produkty kategorii</span>
                      <CaretRight size={14} />
                    </Link>

                    <div className="max-h-[20rem] overflow-y-auto border-t border-browin-dark/8 pt-2">
                      {activeBreadcrumbTopics.map((topic) => (
                        <Link
                          className="block rounded-md px-3 py-2 text-sm font-semibold text-browin-dark/72 transition-colors hover:bg-browin-dark/5 hover:text-browin-red"
                          href={buildCategoryHref(activeBreadcrumbCategory.slug, topic.query)}
                          key={`${activeBreadcrumbCategory.id}-${topic.label}-${topic.query ?? ""}`}
                          onClick={(event) => {
                            event.preventDefault();
                            selectBreadcrumbTopic(topic);
                            navigateAfterPaint(
                              buildCategoryHref(activeBreadcrumbCategory.slug, topic.query),
                            );
                          }}
                        >
                          {topic.label}
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : null}
          </div>
        </div>
      ) : null}

      {!isProductPage ? (
        <div className="no-scrollbar overflow-x-auto border-b border-browin-border bg-browin-white py-3 md:hidden">
          <div className="flex w-max space-x-4 px-4">
            {storeCategories.map((category) => (
              <Link className={`group flex flex-col items-center gap-1.5 ${category.id === "domiogrod" ? "w-20" : "w-16"}`} href={`/kategoria/${category.slug}`} key={category.id} onClick={closeMobileMenu}>
                <div className="flex h-12 w-12 items-center justify-center rounded-none border border-browin-dark/10 bg-browin-dark/5 text-browin-red transition-colors group-hover:bg-browin-red group-hover:text-browin-white">
                  <StoreIcon icon={category.icon} size={22} weight="fill" />
                </div>
                <span className="text-center text-[9px] font-bold uppercase tracking-wide text-browin-dark">
                  {category.shortLabel}
                </span>
              </Link>
            ))}
          </div>
        </div>
      ) : null}

      <main>{children}</main>

      <StoreFooter />
      </div>

      <div
        className={`fixed inset-x-0 top-0 z-[55] bg-browin-dark/20 transition-opacity duration-300 md:hidden ${
          mobileMenuOpen ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        onClick={closeMobileMenu}
        style={{ bottom: "var(--mobile-bottom-nav-height)" }}
      />

      <div
        className={`fixed inset-x-0 top-0 z-[60] flex flex-col bg-browin-gray transition-[opacity,transform] duration-200 ease-out md:hidden ${
          mobileMenuOpen
            ? "translate-y-0 scale-100 opacity-100"
            : "pointer-events-none translate-y-1 scale-[0.985] opacity-0"
        }`}
        id="mobile-mega-menu"
        style={{ bottom: "var(--mobile-bottom-nav-height)" }}
      >
        <div className="flex shrink-0 items-center justify-between border-b border-browin-dark/10 bg-browin-white px-4 py-3 shadow-none">
          <Image
            alt="BROWIN"
            className="brand-logo-menu object-contain"
            height={30}
            src="/assets/logo_BROWIN.svg"
            width={146}
          />

          <div className="flex items-center space-x-2">
            <div className="relative group cursor-pointer">
              <button
                className="flex shrink-0 items-center justify-center space-x-1 rounded-none border border-transparent bg-browin-dark/5 px-3 py-1.5 text-[11px] font-bold text-browin-dark transition-colors hover:border-browin-dark/10 hover:bg-browin-dark/10 focus:outline-none"
                onClick={() => setMobileLangOpen((current) => !current)}
                type="button"
              >
                <Globe className="text-browin-dark/70" size={14} />
                <span>PL</span>
                <CaretDown className="ml-0.5 text-browin-dark/50" size={10} />
              </button>

              <div
                className={`absolute right-0 top-full z-50 mt-2 w-40 overflow-hidden border border-browin-dark/10 bg-browin-white py-1 shadow-sharp ${
                  mobileLangOpen ? "flex flex-col" : "hidden"
                }`}
                id="mobile-lang-menu"
              >
                <button className="flex items-center justify-between bg-browin-red/5 px-4 py-2.5 text-sm font-bold text-browin-red" type="button">
                  <span>Polski</span>
                  <Check size={16} />
                </button>
                <button className="px-4 py-2.5 text-left text-sm font-medium text-browin-dark/70 transition-colors hover:bg-browin-dark/5" type="button">
                  English
                </button>
                <button className="px-4 py-2.5 text-left text-sm font-medium text-browin-dark/70 transition-colors hover:bg-browin-dark/5" type="button">
                  Deutsch
                </button>
              </div>
            </div>

            <button
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-none border border-transparent bg-browin-dark/5 text-browin-dark transition-colors hover:border-browin-dark/10 hover:text-browin-red focus:outline-none"
              onClick={closeMobileMenu}
              type="button"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        <div className="relative flex-1 overflow-y-auto bg-browin-white pb-8 no-scrollbar">
          {!activeMobileCategory ? (
            <div className="border-b border-browin-border bg-browin-white py-2.5">
              <div className="grid grid-cols-4 gap-2 px-4">
                {mobileMenuQuickLinks.map((item) => {
                  const Icon = item.icon;

                  return (
                    <Link
                      className="group flex min-w-0 flex-col items-center gap-1.5"
                      href={item.href}
                      key={item.label}
                      onClick={closeMobileMenu}
                    >
                      <span className="flex h-10 w-10 items-center justify-center rounded-none border border-browin-dark/10 bg-browin-dark/5 text-browin-red transition-colors group-hover:bg-browin-red group-hover:text-browin-white">
                        <Icon size={20} weight="fill" />
                      </span>
                      <span className="text-center text-[9px] font-bold uppercase leading-tight tracking-wide text-browin-dark">
                        {item.label}
                      </span>
                    </Link>
                  );
                })}
              </div>
            </div>
          ) : null}

          {activeMobileCategory ? (
            <div className="px-4 pb-2">
              <button
                className="mb-3 inline-flex items-center gap-2 pt-2 text-[13px] font-bold uppercase tracking-[0.16em] text-browin-dark/60 transition-colors hover:text-browin-red"
                onClick={() => setActiveMobileCategoryId(null)}
                type="button"
              >
                <CaretLeft size={16} />
                Wróć
              </button>

              <div className="mb-2 border-b border-browin-dark/8 pb-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center border border-browin-dark/10 bg-browin-gray text-browin-red">
                    <StoreIcon icon={activeMobileCategory.icon} size={22} weight="fill" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-browin-dark/45">
                      Kategoria
                    </p>
                    <h3 className="mt-1 text-base font-extrabold tracking-tight text-browin-dark">
                      {activeMobileCategory.label}
                    </h3>
                  </div>
                </div>

                <Link
                  className="mt-3 inline-flex items-center gap-2 border border-browin-dark/10 bg-browin-white px-3 py-2 text-[11px] font-bold uppercase tracking-[0.16em] text-browin-red transition-colors hover:border-browin-red hover:bg-browin-red/5"
                  href={`/kategoria/${activeMobileCategory.slug}`}
                  onClick={closeMobileMenu}
                >
                  Wszystkie produkty
                  <ArrowRight size={14} />
                </Link>
              </div>

              <div className="divide-y divide-browin-dark/5 border-b border-browin-dark/5">
                {getUniqueTopics(activeMobileCategory).map((topic) => (
                  <Link
                    className="flex items-center justify-between gap-3 py-4 text-[14px] font-bold text-browin-dark transition-colors hover:text-browin-red"
                    href={buildCategoryHref(activeMobileCategory.slug, topic.query)}
                    key={`${activeMobileCategory.id}-${topic.label}-${topic.query ?? ""}`}
                    onClick={closeMobileMenu}
                  >
                    <span>{topic.label}</span>
                    <CaretRight className="shrink-0 text-browin-dark/35" size={16} />
                  </Link>
                ))}
              </div>
            </div>
          ) : (
            <div className="divide-y divide-browin-dark/5 px-4 shrink-0">
              <Link
                className="group flex w-full items-center justify-between py-4 transition-all focus:outline-none"
                href="/produkty?deal=true"
                onClick={closeMobileMenu}
              >
                <div className="flex items-center space-x-4">
                  <Tag className="text-browin-red" size={24} />
                  <span className="text-[15px] font-bold tracking-wide text-browin-red">
                    Promocje
                  </span>
                </div>
                <CaretRight
                  className="text-browin-red/50 transition-transform duration-300 group-hover:translate-x-0.5"
                  size={16}
                />
              </Link>
              {storeCategories.map((category) => (
                <button
                  className="group flex w-full items-center justify-between py-4 transition-all focus:outline-none"
                  key={category.id}
                  onClick={() => setActiveMobileCategoryId(category.id)}
                  type="button"
                >
                  <div className="flex items-center space-x-4">
                    <StoreIcon
                      className="text-browin-dark transition-colors group-hover:text-browin-red"
                      icon={category.icon}
                      size={24}
                    />
                    <span className="text-[15px] font-bold tracking-wide text-browin-dark">
                      {category.label}
                    </span>
                  </div>
                  <CaretRight
                    className="text-browin-dark/40 transition-transform duration-300 group-hover:translate-x-0.5"
                    size={16}
                  />
                </button>
              ))}
            </div>
          )}

        </div>
      </div>

      <div className="store-mobile-bottom-nav pb-safe fixed bottom-0 left-0 z-50 flex w-full items-center justify-between border-t border-browin-dark/10 bg-browin-white px-8 py-2 text-browin-dark/60 shadow-none md:hidden">
        <Link
          aria-current={isHomeBottomNavActive ? "page" : undefined}
          className={mobileBottomNavItemClass}
          href="/"
          onClick={handleHomeBottomNavClick}
        >
          <StoreIcon
            className={getMobileBottomNavIconClass(isHomeBottomNavActive)}
            icon="house"
            size={26}
            weight={isHomeBottomNavActive ? "fill" : "regular"}
          />
          <span className="text-[9px] font-bold uppercase">Główna</span>
        </Link>
        <button
          aria-pressed={isCategoriesBottomNavActive}
          className={mobileBottomNavItemClass}
          onClick={toggleMobileMenuFromBottomNav}
          type="button"
        >
          <List
            className={getMobileBottomNavIconClass(isCategoriesBottomNavActive)}
            size={26}
            weight={isCategoriesBottomNavActive ? "bold" : "regular"}
          />
          <span className="text-[9px] font-bold uppercase">Kategorie</span>
        </button>
        <Link
          aria-current={isRecipesBottomNavActive ? "page" : undefined}
          className={mobileBottomNavItemClass}
          href="/produkty?search=zestaw"
          onClick={closeMobileOverlays}
        >
          <BookOpen
            className={getMobileBottomNavIconClass(isRecipesBottomNavActive)}
            size={26}
            weight={isRecipesBottomNavActive ? "fill" : "regular"}
          />
          <span className="text-[9px] font-bold uppercase">Przepisy</span>
        </Link>
        <button
          aria-pressed={isCartBottomNavActive}
          className={`${mobileBottomNavItemClass} relative focus:outline-none`}
          onClick={toggleCartFromBottomNav}
          type="button"
        >
          <ShoppingCart
            className={getMobileBottomNavIconClass(isCartBottomNavActive)}
            size={26}
            weight={isCartBottomNavActive ? "fill" : "regular"}
          />
          <span className="text-[9px] font-bold uppercase">Koszyk</span>
          <span className="absolute right-2 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-browin-red text-[9px] font-bold text-browin-white">
            {cartCount}
          </span>
        </button>
      </div>

      <CartDrawer />
    </div>
  );
}
