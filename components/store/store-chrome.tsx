"use client";

import {
  ArrowRight,
  ArrowsLeftRight,
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
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import { CartDrawer } from "@/components/store/cart-drawer";
import {
  DesktopProductRecipeNav,
  DesktopRecipeProductReturnNav,
} from "@/components/store/desktop-product-recipe-nav";
import {
  PRODUCT_BRIDGE_CONTEXT_STORAGE_KEY,
  RECIPE_BRIDGE_CONTEXT_STORAGE_KEY,
  type ProductBridgeContext,
  type RecipeBridgeContext,
} from "@/components/store/recipe-bridge-context";
import { StoreFooter } from "@/components/store/store-footer";
import { StoreIcon } from "@/components/store/icon-map";
import { MobileProductRecipePanel } from "@/components/store/mobile-product-recipe-panel";
import { useProductRecipeNav } from "@/components/store/product-recipe-nav-context";
import { RecipebookIcon } from "@/components/store/recipebook-icon";
import { RecipebookCategoryRail } from "@/components/store/recipebook-category-rail";
import { useCart } from "@/components/store/cart-provider";
import { useFavorites } from "@/components/store/favorites-provider";
import {
  trustBadges,
  type CategoryId,
  type CategoryTopic,
  type StoreCategory,
} from "@/data/store";
import type { RecipeCommerceEntry } from "@/data/recipes";
import { formatCurrency } from "@/lib/catalog";
import {
  RECIPEBOOK_LAST_HREF_STORAGE_KEY,
  RECIPEBOOK_LAST_LIST_HREF_STORAGE_KEY,
  buildCurrentRouteHref,
  getRecipebookScrollStorageKey,
  isRecipebookPathname,
  normalizeRecipebookHref,
  normalizeRecipebookListHref,
  type RecipebookCategoryNav,
} from "@/lib/recipebook-navigation";

type StoreChromeProps = {
  children: React.ReactNode;
  recipeCommerceEntries?: RecipeCommerceEntry[];
  recipebookCategories?: RecipebookCategoryNav[];
  storeCategories: StoreCategory[];
};

type MobileSearchFormProps = {
  className?: string;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
  searchSeed: string;
};

type MobileBottomNavItem = "home" | "categories" | "recipes" | "cart" | null;
type HomeLayoutVariant = "current" | "expandedDock" | "expandedDockSplit";

const HOME_LAYOUT_VARIANT_STORAGE_KEY = "browin-home-layout-variant";

const homeLayoutVariantOptions: ReadonlyArray<{
  id: HomeLayoutVariant;
  title: string;
}> = [
  { id: "current", title: "Aktualny homepage" },
  { id: "expandedDock", title: "Dock, szeroki baner i dwa kafle pod spodem" },
  { id: "expandedDockSplit", title: "Dock, baner po lewej i kafle po prawej" },
];

const topBarLinks = [
  { label: "Dostawa i płatność", href: "/checkout" },
  { label: "Kontakt", href: "/checkout" },
  { label: "Blog", href: "/produkty?search=poradnik" },
] as const;

const utilityQuickLinks = [
  {
    href: "/przepisnik",
    icon: RecipebookIcon,
    label: "Przepiśnik",
  },
  {
    href: "/kalkulatory",
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

const mobileMenuQuickLinks = utilityQuickLinks.filter(
  (item) => item.label !== "Przepiśnik",
);

const dockUtilityLinks = utilityQuickLinks;

const buildCategoryHref = (slug: string, query?: string) =>
  query ? `/kategoria/${slug}?search=${encodeURIComponent(query)}` : `/kategoria/${slug}`;

const isMobileViewport = () => window.matchMedia("(max-width: 767px)").matches;

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

  if (pathname === "/") {
    return "home";
  }

  return null;
};

const getRecipeSlugFromPathname = (pathname: string) => {
  if (pathname.startsWith("/przepisnik/przepis/")) {
    return decodeURIComponent(pathname.split("/")[3] ?? "");
  }

  if (pathname.startsWith("/przepisy/")) {
    return decodeURIComponent(pathname.split("/")[2] ?? "");
  }

  return null;
};

const readStoredProductContext = (recipeSlug: string | null) => {
  if (!recipeSlug) {
    return null;
  }

  try {
    const storedContext = window.sessionStorage.getItem(
      PRODUCT_BRIDGE_CONTEXT_STORAGE_KEY,
    );

    if (!storedContext) {
      return null;
    }

    const parsedContext = JSON.parse(storedContext) as Partial<ProductBridgeContext>;

    if (
      parsedContext.recipeSlug !== recipeSlug ||
      typeof parsedContext.productSlug !== "string" ||
      typeof parsedContext.productTitle !== "string"
    ) {
      return null;
    }

    return {
      productImage:
        typeof parsedContext.productImage === "string"
          ? parsedContext.productImage
          : undefined,
      productSlug: parsedContext.productSlug,
      productTitle: parsedContext.productTitle,
      recipeSlug,
      recipeTitle:
        typeof parsedContext.recipeTitle === "string"
          ? parsedContext.recipeTitle
          : undefined,
      savedAt:
        typeof parsedContext.savedAt === "number"
          ? parsedContext.savedAt
          : Date.now(),
    } satisfies ProductBridgeContext;
  } catch {
    return null;
  }
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
          key={searchSeed}
          name="search"
          placeholder="Szukaj..."
        />
        <MagnifyingGlass
          className="absolute left-3.5 top-1/2 -translate-y-1/2 text-browin-dark/40 transition-colors group-focus-within:text-browin-red"
          size={18}
        />
      </div>
      <button
        className="search-ui-copy flex shrink-0 items-center justify-center border-l border-browin-dark/10 bg-browin-red px-5 text-sm font-semibold text-browin-white transition-colors hover:bg-browin-red/90"
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

export function StoreChrome({
  children,
  recipeCommerceEntries = [],
  recipebookCategories = [],
  storeCategories,
}: StoreChromeProps) {
  const pathname = usePathname();
  const router = useRouter();
  const routeSearchParams = useSearchParams();
  const { closeCart, count: cartCount, isOpen, openCart, subtotal } = useCart();
  const { count: favoritesCount } = useFavorites();
  const {
    closeProductRecipePanel,
    currentProductRecipeContext,
    isProductRecipePanelOpen,
    openProductRecipePanel,
  } = useProductRecipeNav();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileLangOpen, setMobileLangOpen] = useState(false);
  const [activeMobileCategoryId, setActiveMobileCategoryId] =
    useState<CategoryId | null>(null);
  const [breadcrumbCategoryId, setBreadcrumbCategoryId] = useState<CategoryId | null>(
    null,
  );
  const [breadcrumbTopic, setBreadcrumbTopic] = useState<CategoryTopic | null>(null);
  const [breadcrumbMenuOpen, setBreadcrumbMenuOpen] = useState(false);
  const [breadcrumbMenuMode, setBreadcrumbMenuMode] = useState<"categories" | "topics">(
    "categories",
  );
  const [activeDockCategoryId, setActiveDockCategoryId] = useState<CategoryId | null>(
    null,
  );
  const [recipeReturnContext, setRecipeReturnContext] =
    useState<ProductBridgeContext | null>(null);
  const [recipebookReturnHref, setRecipebookReturnHref] = useState("/przepisnik");
  const [isMobileContextSearchHidden, setIsMobileContextSearchHidden] =
    useState(false);
  const [isHomeBreadcrumbVisible, setIsHomeBreadcrumbVisible] = useState(false);
  const [homeLayoutVariant, setHomeLayoutVariant] =
    useState<HomeLayoutVariant>("current");
  const breadcrumbRef = useRef<HTMLDivElement | null>(null);
  const dockRef = useRef<HTMLElement | null>(null);
  const dockHoverIntentTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const mobileContextSearchScrollY = useRef(0);
  const routeSearch = routeSearchParams.toString();
  const currentRouteHref = buildCurrentRouteHref(pathname, routeSearch);
  const searchSeed =
    pathname === "/szukaj" ? routeSearchParams.get("search") ?? "" : "";
  const isProductPage = pathname.startsWith("/produkt/");
  const isRecipePage =
    pathname.startsWith("/przepisnik") || pathname.startsWith("/przepisy");
  const isRecipeDetailPage =
    pathname.startsWith("/przepisnik/przepis/") || pathname.startsWith("/przepisy/");
  const currentRecipeSlug = isRecipeDetailPage
    ? getRecipeSlugFromPathname(pathname)
    : null;
  const canAutoHideMobileSearch =
    isProductPage || isRecipeDetailPage || pathname === "/przepisnik";
  const showMobileCategoryStrip = !isProductPage && !isRecipePage;
  const isHomePage = pathname === "/";
  const isHomeDockLayout = isHomePage && homeLayoutVariant !== "current";
  const isHomeExpandedDockLayout =
    isHomePage && homeLayoutVariant === "expandedDock";
  const isHomeSplitDockLayout =
    isHomePage && homeLayoutVariant === "expandedDockSplit";
  const showDesktopNav = pathname !== "/" || isHomeDockLayout;
  const showDesktopBreadcrumbNav = isHomePage
    ? isHomeDockLayout || isHomeBreadcrumbVisible
    : showDesktopNav;
  const showDesktopBreadcrumbShell = showDesktopNav || isHomePage;
  const routeBreadcrumbCategory =
    storeCategories.find((category) => pathname === `/kategoria/${category.slug}`) ??
    null;
  const stateBreadcrumbCategory =
    storeCategories.find((category) => category.id === breadcrumbCategoryId) ?? null;
  const activeBreadcrumbCategory = routeBreadcrumbCategory ?? stateBreadcrumbCategory;
  const activeDockCategory =
    storeCategories.find((category) => category.id === activeDockCategoryId) ?? null;
  const highlightedDockCategory = activeDockCategory ?? routeBreadcrumbCategory;
  const activeBreadcrumbTopics = activeBreadcrumbCategory
    ? getUniqueTopics(activeBreadcrumbCategory)
    : [];
  const activeBreadcrumbTopic =
    activeBreadcrumbCategory?.id === breadcrumbCategoryId ? breadcrumbTopic : null;
  const activeRecipebookCategorySlug =
    pathname === "/przepisnik" ? routeSearchParams.get("category") ?? "" : "";
  const activeRecipebookSearchQuery =
    pathname === "/przepisnik" ? routeSearchParams.get("search") ?? "" : "";
  const activeDockSections = activeDockCategory
    ? activeDockCategory.menuSections.slice(0, 2)
    : [];
  const contentShellClass = `min-h-screen transition-[margin] duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${
    showDesktopNav
      ? isHomeDockLayout
        ? "md:ml-20 lg:ml-72"
        : "md:ml-20"
      : ""
  } ${isHomeExpandedDockLayout ? "home-layout-expanded-dock" : ""} ${
    isHomeSplitDockLayout ? "home-layout-dock-split" : ""
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
  const productRecipeNavProductId = currentProductRecipeContext?.product.id ?? null;
  const productRecipeNavCount = currentProductRecipeContext?.recipes.length ?? 0;
  const hasProductRecipeNavContext = isProductPage && productRecipeNavCount > 0;
  const productRecipeNavContext = hasProductRecipeNavContext
    ? currentProductRecipeContext
    : null;
  const isRecipesBottomNavHighlighted =
    isRecipesBottomNavActive || isProductRecipePanelOpen;
  const shouldHideMobileSearch =
    canAutoHideMobileSearch &&
    isMobileContextSearchHidden &&
    !mobileMenuOpen &&
    !isOpen;
  const activeMobileCategory =
    storeCategories.find((category) => category.id === activeMobileCategoryId) ?? null;
  const showRecipebookCategoryRail =
    recipebookCategories.length > 0 && pathname === "/przepisnik";
  const visibleRecipeReturnContext = currentRecipeSlug ? recipeReturnContext : null;
  const shouldReturnToRecipebookList =
    isRecipeDetailPage && !visibleRecipeReturnContext;
  const recipebookNavHref = shouldReturnToRecipebookList
    ? recipebookReturnHref
    : "/przepisnik";
  const recipebookNavLabel = shouldReturnToRecipebookList
    ? "Wróć do przepiśnika"
    : "Przepiśnik";
  const desktopBreadcrumbClass = isHomeDockLayout
    ? "sticky top-20 z-[70] hidden border-b border-browin-dark/8 bg-browin-white/92 backdrop-blur-md md:block [@media_(min-width:1024px)_and_(max-height:900px)]:top-[4.5rem]"
    : isHomePage
      ? `fixed inset-x-0 top-20 z-[70] hidden border-b border-browin-dark/8 bg-browin-white/92 backdrop-blur-md transition-[opacity,transform] duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] md:block [@media_(min-width:1024px)_and_(max-height:900px)]:top-[4.5rem] ${
          isHomeBreadcrumbVisible
            ? "pointer-events-auto translate-y-0 opacity-100"
          : "pointer-events-none -translate-y-2 opacity-0"
      }`
    : "sticky top-20 z-[70] hidden border-b border-browin-dark/8 bg-browin-white/92 backdrop-blur-md md:block [@media_(min-width:1024px)_and_(max-height:900px)]:top-[4.5rem]";
  const desktopDockClass = `group/dock fixed left-0 top-0 z-[100] hidden h-screen overflow-visible border-r border-browin-dark/10 bg-browin-white text-browin-dark transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] md:block ${
    isHomeDockLayout ? "w-20 hover:w-72 lg:w-72" : "w-20 hover:w-72"
  }`;

  useEffect(() => {
    document.body.style.overflow =
      mobileMenuOpen || isOpen ? "hidden" : "";

    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen, mobileMenuOpen]);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      try {
        const storedVariant = window.localStorage.getItem(
          HOME_LAYOUT_VARIANT_STORAGE_KEY,
        );

        if (
          storedVariant === "current" ||
          storedVariant === "expandedDock" ||
          storedVariant === "expandedDockSplit"
        ) {
          setHomeLayoutVariant(storedVariant);
        }
      } catch {
        // The homepage layout switch is a local dev helper only.
      }
    });

    return () => window.cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      closeProductRecipePanel();
    });

    return () => window.cancelAnimationFrame(frame);
  }, [closeProductRecipePanel, pathname]);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      setRecipeReturnContext(readStoredProductContext(currentRecipeSlug));
    });

    return () => window.cancelAnimationFrame(frame);
  }, [currentRecipeSlug]);

  useEffect(() => {
    if (!isRecipebookPathname(pathname)) {
      return;
    }

    const nextRecipebookHref = normalizeRecipebookHref(currentRouteHref);
    const nextRecipebookListHref =
      pathname === "/przepisnik"
        ? normalizeRecipebookListHref(currentRouteHref)
        : null;
    const frame = window.requestAnimationFrame(() => {
      try {
        window.sessionStorage.setItem(
          RECIPEBOOK_LAST_HREF_STORAGE_KEY,
          nextRecipebookHref,
        );

        if (nextRecipebookListHref) {
          window.sessionStorage.setItem(
            RECIPEBOOK_LAST_LIST_HREF_STORAGE_KEY,
            nextRecipebookListHref,
          );
        }
      } catch {
        // Remembered recipebook navigation is a client-side enhancement.
      }
    });

    return () => window.cancelAnimationFrame(frame);
  }, [currentRouteHref, pathname]);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      if (pathname === "/przepisnik") {
        setRecipebookReturnHref(normalizeRecipebookListHref(currentRouteHref));
        return;
      }

      if (!isRecipeDetailPage) {
        setRecipebookReturnHref("/przepisnik");
        return;
      }

      try {
        setRecipebookReturnHref(
          normalizeRecipebookListHref(
            window.sessionStorage.getItem(RECIPEBOOK_LAST_LIST_HREF_STORAGE_KEY) ??
              window.sessionStorage.getItem(RECIPEBOOK_LAST_HREF_STORAGE_KEY),
          ),
        );
      } catch {
        setRecipebookReturnHref("/przepisnik");
      }
    });

    return () => window.cancelAnimationFrame(frame);
  }, [currentRouteHref, isRecipeDetailPage, pathname]);

  useEffect(() => {
    if (pathname !== "/przepisnik" || !isMobileViewport()) {
      return;
    }

    let savedScrollTop = 0;

    try {
      savedScrollTop = Number(
        window.sessionStorage.getItem(getRecipebookScrollStorageKey(currentRouteHref)) ??
          0,
      );
    } catch {
      savedScrollTop = 0;
    }

    if (!Number.isFinite(savedScrollTop) || savedScrollTop < 24) {
      return;
    }

    let secondFrame = 0;
    const firstFrame = window.requestAnimationFrame(() => {
      secondFrame = window.requestAnimationFrame(() => {
        window.scrollTo({
          behavior: "auto",
          left: 0,
          top: savedScrollTop,
        });
      });
    });

    return () => {
      window.cancelAnimationFrame(firstFrame);

      if (secondFrame) {
        window.cancelAnimationFrame(secondFrame);
      }
    };
  }, [currentRouteHref, pathname]);

  useEffect(() => {
    if (pathname !== "/przepisnik") {
      return;
    }

    let frame = 0;
    let isListening = false;

    const saveScrollPosition = () => {
      if (!isMobileViewport()) {
        return;
      }

      try {
        window.sessionStorage.setItem(
          getRecipebookScrollStorageKey(currentRouteHref),
          String(window.scrollY),
        );
      } catch {
        // Scroll memory is best-effort only.
      }
    };

    const scheduleScrollSave = () => {
      if (frame) {
        return;
      }

      frame = window.requestAnimationFrame(() => {
        frame = 0;
        saveScrollPosition();
      });
    };

    const startListeningFrame = window.requestAnimationFrame(() => {
      isListening = true;
      window.addEventListener("scroll", scheduleScrollSave, { passive: true });
      window.addEventListener("pagehide", saveScrollPosition);
    });

    return () => {
      window.cancelAnimationFrame(startListeningFrame);

      if (frame) {
        window.cancelAnimationFrame(frame);
      }

      if (isListening) {
        window.removeEventListener("scroll", scheduleScrollSave);
        window.removeEventListener("pagehide", saveScrollPosition);
      }

      saveScrollPosition();
    };
  }, [currentRouteHref, pathname]);

  useEffect(() => {
    if (!canAutoHideMobileSearch) {
      return;
    }

    let frame = 0;

    const resetFrame = window.requestAnimationFrame(() => {
      mobileContextSearchScrollY.current = window.scrollY;
      setIsMobileContextSearchHidden(false);
    });

    const evaluateScrollDirection = () => {
      frame = 0;

      const currentScrollY = window.scrollY;
      const delta = currentScrollY - mobileContextSearchScrollY.current;

      if (currentScrollY < 24) {
        setIsMobileContextSearchHidden(false);
      } else if (delta > 8) {
        setIsMobileContextSearchHidden(true);
      } else if (delta < -8) {
        setIsMobileContextSearchHidden(false);
      }

      mobileContextSearchScrollY.current = currentScrollY;
    };

    const scheduleScrollEvaluation = () => {
      if (frame) {
        return;
      }

      frame = window.requestAnimationFrame(evaluateScrollDirection);
    };

    window.addEventListener("scroll", scheduleScrollEvaluation, { passive: true });
    window.addEventListener("resize", scheduleScrollEvaluation);

    return () => {
      window.cancelAnimationFrame(resetFrame);

      if (frame) {
        window.cancelAnimationFrame(frame);
      }

      window.removeEventListener("scroll", scheduleScrollEvaluation);
      window.removeEventListener("resize", scheduleScrollEvaluation);
    };
  }, [canAutoHideMobileSearch, pathname]);

  useEffect(() => {
    if (!isHomePage) {
      const resetFrame = window.requestAnimationFrame(() => {
        setIsHomeBreadcrumbVisible(false);
      });

      return () => window.cancelAnimationFrame(resetFrame);
    }

    let frame = 0;

    const evaluateHomeScroll = () => {
      frame = 0;

      const heroFrame = document.querySelector<HTMLElement>(".desktop-hero-frame");
      const heroBottom = heroFrame
        ? heroFrame.offsetTop + heroFrame.offsetHeight
        : 420;
      const threshold = Math.max(260, heroBottom - 96);

      setIsHomeBreadcrumbVisible(window.scrollY > threshold);
    };

    const scheduleHomeScrollEvaluation = () => {
      if (frame) {
        return;
      }

      frame = window.requestAnimationFrame(evaluateHomeScroll);
    };

    const initialFrame = window.requestAnimationFrame(evaluateHomeScroll);

    window.addEventListener("scroll", scheduleHomeScrollEvaluation, { passive: true });
    window.addEventListener("resize", scheduleHomeScrollEvaluation);

    return () => {
      window.cancelAnimationFrame(initialFrame);

      if (frame) {
        window.cancelAnimationFrame(frame);
      }

      window.removeEventListener("scroll", scheduleHomeScrollEvaluation);
      window.removeEventListener("resize", scheduleHomeScrollEvaluation);
    };
  }, [isHomePage]);

  useEffect(() => {
    if (showDesktopBreadcrumbNav) {
      return;
    }

    const closeFrame = window.requestAnimationFrame(() => {
      setBreadcrumbMenuOpen(false);
    });

    return () => window.cancelAnimationFrame(closeFrame);
  }, [showDesktopBreadcrumbNav]);

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
    if (!showDesktopBreadcrumbNav || !breadcrumbMenuOpen) {
      return;
    }

    const closeDesktopSubnavOnOutsideClick = (event: PointerEvent) => {
      if (!breadcrumbRef.current?.contains(event.target as Node)) {
        setBreadcrumbMenuOpen(false);
      }
    };

    document.addEventListener("pointerdown", closeDesktopSubnavOnOutsideClick);

    return () => {
      document.removeEventListener("pointerdown", closeDesktopSubnavOnOutsideClick);
    };
  }, [breadcrumbMenuOpen, showDesktopBreadcrumbNav]);

  useEffect(() => {
    if (
      !showDesktopBreadcrumbNav ||
      !breadcrumbMenuOpen ||
      breadcrumbMenuMode !== "topics" ||
      !activeBreadcrumbCategory
    ) {
      return;
    }

    router.prefetch(`/kategoria/${activeBreadcrumbCategory.slug}`);

    getUniqueTopics(activeBreadcrumbCategory).forEach((topic) => {
      router.prefetch(buildCategoryHref(activeBreadcrumbCategory.slug, topic.query));
    });
  }, [
    activeBreadcrumbCategory,
    breadcrumbMenuMode,
    breadcrumbMenuOpen,
    router,
    showDesktopBreadcrumbNav,
  ]);

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
    closeProductRecipePanel();
  };

  const closeMobileOverlays = () => {
    closeMobileMenu();
    closeCart();
    closeProductRecipePanel();
  };

  const openMobileMenu = () => {
    closeCart();
    closeProductRecipePanel();
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
    closeProductRecipePanel();
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

  const handleProductRecipesBottomNavClick = () => {
    closeCart();
    closeMobileMenu();

    if (isProductRecipePanelOpen) {
      closeProductRecipePanel();
      return;
    }

    openProductRecipePanel();
  };

  const handleProductRecipesDesktopNavClick = () => {
    closeCart();
    setMobileMenuOpen(false);
    setMobileLangOpen(false);
    setActiveMobileCategoryId(null);
    setBreadcrumbMenuOpen(false);

    if (isProductRecipePanelOpen) {
      closeProductRecipePanel();
      return;
    }

    openProductRecipePanel();
  };

  const handleRecipebookNavClick = () => {
    setBreadcrumbMenuOpen(false);
    closeProductRecipePanel();
  };

  const handleRecipeProductReturn = (context: ProductBridgeContext) => {
    setBreadcrumbMenuOpen(false);
    closeProductRecipePanel();

    try {
      const recipeContext = {
        recipeSlug: context.recipeSlug,
        recipeTitle: context.recipeTitle ?? context.recipeSlug,
        savedAt: Date.now(),
      } satisfies RecipeBridgeContext;

      window.sessionStorage.setItem(
        RECIPE_BRIDGE_CONTEXT_STORAGE_KEY,
        JSON.stringify(recipeContext),
      );
    } catch {
      // Session storage is an enhancement only.
    }
  };

  const handleSearchSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);
    const trimmedSearch = String(formData.get("search") ?? "").trim();
    const params = new URLSearchParams();

    if (trimmedSearch) {
      params.set("search", trimmedSearch);
    }

    router.push(params.size ? `/szukaj?${params.toString()}` : "/szukaj");
    setBreadcrumbMenuOpen(false);
    closeMobileMenu();
  };

  const openBreadcrumbCategoryMenu = () => {
    closeProductRecipePanel();
    setBreadcrumbCategoryId(null);
    setBreadcrumbTopic(null);
    setBreadcrumbMenuMode("categories");
    setBreadcrumbMenuOpen((current) => !current || Boolean(activeBreadcrumbCategory));
  };

  const toggleBreadcrumbTopicsMenu = () => {
    closeProductRecipePanel();
    setBreadcrumbMenuMode("topics");
    setBreadcrumbMenuOpen((current) =>
      breadcrumbMenuMode === "topics" ? !current : true,
    );
  };

  const selectBreadcrumbCategory = (categoryId: CategoryId) => {
    const category = storeCategories.find((entry) => entry.id === categoryId);

    closeProductRecipePanel();
    setBreadcrumbCategoryId(categoryId);
    setBreadcrumbTopic(null);
    setBreadcrumbMenuMode("topics");
    setBreadcrumbMenuOpen(true);

    if (category) {
      router.push(`/kategoria/${category.slug}`);
    }
  };

  const selectBreadcrumbTopic = (topic: CategoryTopic) => {
    closeProductRecipePanel();

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
      closeProductRecipePanel();
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

  const updateHomeLayoutVariant = (variant: HomeLayoutVariant) => {
    setHomeLayoutVariant(variant);
    setActiveDockCategoryId(null);
    setBreadcrumbMenuOpen(false);

    try {
      window.localStorage.setItem(HOME_LAYOUT_VARIANT_STORAGE_KEY, variant);
    } catch {
      // The switch can still work for the current session without storage.
    }
  };

  return (
    <div className="min-h-screen bg-browin-gray text-browin-dark">
      {showDesktopNav ? (
        <aside
          className={desktopDockClass}
          id="desktop-category-dock"
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
                      onFocus={() => {
                        closeProductRecipePanel();
                        setActiveDockCategoryId(category.id);
                      }}
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
                        <span
                          className={`overflow-hidden whitespace-nowrap text-[14px] font-semibold transition-all duration-200 group-hover/dock:max-w-[11rem] group-hover/dock:opacity-100 [@media_(min-width:1024px)_and_(max-width:1439px)_and_(max-height:860px)]:text-[13px] ${
                            isHomeDockLayout
                              ? "max-w-0 opacity-0 lg:max-w-[11rem] lg:opacity-100"
                              : "max-w-0 opacity-0"
                          }`}
                        >
                          {category.label}
                        </span>
                      </span>
                      <CaretRight
                        className={`shrink-0 transition-opacity duration-200 group-hover/dock:opacity-100 ${
                          isHomeDockLayout
                            ? "opacity-0 lg:opacity-100"
                            : "opacity-0"
                        } ${
                          isActive ? "text-browin-red" : "text-browin-dark/30"
                        }`}
                        size={14}
                      />
                    </button>
                  );
                })}
              </nav>
            </div>

            <div
              className={`shrink-0 border-t border-browin-dark/8 bg-browin-white px-3 py-3 transition-opacity duration-200 group-hover/dock:pointer-events-auto group-hover/dock:opacity-100 [@media_(min-width:1024px)_and_(max-width:1439px)_and_(max-height:860px)]:py-2 ${
                isHomeDockLayout
                  ? "pointer-events-none opacity-0 lg:pointer-events-auto lg:opacity-100"
                  : "pointer-events-none opacity-0"
              }`}
            >
              <div className="space-y-2 [@media_(min-width:1024px)_and_(max-width:1439px)_and_(max-height:860px)]:space-y-1.5">
                {dockUtilityLinks
                  .filter((item) => item.label === "Przepiśnik")
                  .map((item) => {
                    const Icon = item.icon;

                    return (
                      <Link
                        className="group/link flex min-h-11 min-w-0 items-center gap-2.5 rounded-md border border-browin-red bg-browin-red px-3 py-2.5 text-[12px] font-bold text-browin-white shadow-sharp transition-colors hover:bg-browin-red/90 [@media_(min-width:1024px)_and_(max-width:1439px)_and_(max-height:860px)]:min-h-10 [@media_(min-width:1024px)_and_(max-width:1439px)_and_(max-height:860px)]:py-2 [@media_(min-width:1024px)_and_(max-width:1439px)_and_(max-height:860px)]:text-[11px]"
                        href={item.href}
                        key={item.label}
                      >
                        <Icon
                          className="shrink-0 text-browin-white transition-transform group-hover/link:scale-110"
                          size={18}
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
                          className="group/link flex min-w-0 items-center justify-start gap-2 rounded-md border border-browin-dark/8 bg-browin-white px-2.5 py-2 text-[11px] font-semibold text-browin-dark transition-colors hover:border-browin-red/25 hover:bg-browin-red/5 hover:text-browin-red [@media_(min-width:1024px)_and_(max-width:1439px)_and_(max-height:860px)]:min-h-8 [@media_(min-width:1024px)_and_(max-width:1439px)_and_(max-height:860px)]:gap-1.5 [@media_(min-width:1024px)_and_(max-width:1439px)_and_(max-height:860px)]:px-2 [@media_(min-width:1024px)_and_(max-width:1439px)_and_(max-height:860px)]:py-1.5 [@media_(min-width:1024px)_and_(max-width:1439px)_and_(max-height:860px)]:text-[10px] [@media_(min-width:1024px)_and_(max-width:1439px)_and_(max-height:860px)]:leading-none"
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
                  className="mb-4 inline-flex items-center gap-2 rounded-md border border-browin-dark/10 bg-browin-white px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-browin-red transition-colors hover:border-browin-red hover:bg-browin-red/5"
                  href={`/kategoria/${activeDockCategory.slug}`}
                  onClick={() => setActiveDockCategoryId(null)}
                >
                  Zobacz wszystkie
                  <ArrowRight size={14} />
                </Link>

                <div className="space-y-4">
                  {activeDockSections.map((section) => (
                    <div key={section.title}>
                      <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-browin-dark/45">
                        {section.title}
                      </p>
                      <div className="divide-y divide-browin-dark/5 border-b border-browin-dark/5">
                        {section.topics.slice(0, 6).map((topic) => (
                          <Link
                            className="-mx-2 block rounded-md px-2 py-2.5 text-[13px] font-semibold text-browin-dark/75 transition-colors hover:bg-browin-red/8 hover:text-browin-red"
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
          <div className="flex flex-wrap items-center gap-6 font-semibold">
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
                className="font-semibold transition-colors hover:text-browin-red"
                href={link.href}
                key={link.label}
              >
                {link.label}
              </Link>
            ))}

            <div className="relative flex cursor-pointer items-center gap-1 border-l border-browin-white/20 pl-4">
              <Globe size={16} />
              <span className="font-semibold tracking-wide">PL</span>
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
                key={searchSeed}
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
              className="search-ui-copy flex shrink-0 items-center justify-center border-l border-browin-dark/10 bg-browin-red px-7 text-sm font-semibold text-browin-white transition-colors hover:bg-browin-red/90"
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
              <span className="absolute right-1 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-browin-red text-[9px] font-semibold text-browin-white">
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
                <span className="absolute -right-2 -top-1 flex h-5 w-5 items-center justify-center rounded-full border-2 border-browin-white bg-browin-red text-[10px] font-semibold text-browin-white">
                  {cartCount}
                </span>
              </div>
              <div className="desktop-cart-copy flex flex-col items-start">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-browin-dark/60">
                  Koszyk
                </span>
                <span className="text-[14px] font-bold text-browin-dark">
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
              <span className="absolute -right-0.5 -top-0.5 flex h-[15px] w-[15px] items-center justify-center rounded-full bg-browin-red text-[8px] font-semibold text-browin-white">
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
              <span className="absolute -right-0.5 -top-0.5 flex h-[15px] w-[15px] items-center justify-center rounded-full bg-browin-red text-[8px] font-semibold text-browin-white">
                {cartCount}
              </span>
            </button>
          </div>
        </div>

        <div
          className={`block overflow-hidden bg-browin-white px-4 transition-[max-height,opacity,padding] duration-200 ease-out md:hidden ${
            shouldHideMobileSearch
              ? "max-h-0 border-t-0 pb-0 pt-0 opacity-0"
              : "max-h-20 border-t border-browin-dark/8 pb-3 pt-2 opacity-100"
          }`}
        >
          <MobileSearchForm onSubmit={handleSearchSubmit} searchSeed={searchSeed} />
        </div>
      </header>

      {showDesktopBreadcrumbShell ? (
        <div className={desktopBreadcrumbClass}>
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

            <div className="ml-auto flex shrink-0 items-center">
              {visibleRecipeReturnContext ? (
                <DesktopRecipeProductReturnNav
                  context={visibleRecipeReturnContext}
                  onRecipebookClick={handleRecipebookNavClick}
                  onReturn={handleRecipeProductReturn}
                  recipebookHref={recipebookNavHref}
                  recipebookLabel={recipebookNavLabel}
                />
              ) : (
                <DesktopProductRecipeNav
                  context={productRecipeNavContext}
                  isOpen={isProductRecipePanelOpen}
                  onClose={closeProductRecipePanel}
                  onNavigate={handleRecipebookNavClick}
                  onToggle={handleProductRecipesDesktopNavClick}
                  recipebookHref={recipebookNavHref}
                  recipebookLabel={recipebookNavLabel}
                />
              )}
            </div>

            {breadcrumbMenuOpen ? (
              <div className="absolute left-4 top-full w-[28rem] overflow-hidden rounded-b-md border-x border-b border-browin-dark/10 bg-browin-white shadow-[0_18px_28px_-22px_rgba(51,51,51,0.38)]">
                {breadcrumbMenuMode === "categories" || !activeBreadcrumbCategory ? (
                  <div className="p-2">
                    <p className="px-3 pb-2 pt-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-browin-dark/40">
                      Kategorie
                    </p>
                    <Link
                      className="mb-2 flex items-center justify-between rounded-md bg-browin-dark/5 px-3 py-2.5 text-sm font-semibold text-browin-dark transition-colors hover:bg-browin-red hover:text-browin-white"
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
                          className="flex min-w-0 items-center gap-3 rounded-md px-3 py-2.5 text-left text-sm font-semibold text-browin-dark transition-colors hover:bg-browin-dark/5 hover:text-browin-red"
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
                      <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-browin-dark/40">
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
                      className="mb-2 flex items-center justify-between rounded-md bg-browin-dark/5 px-3 py-2.5 text-sm font-semibold text-browin-dark transition-colors hover:bg-browin-red hover:text-browin-white"
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
                            const href = buildCategoryHref(
                              activeBreadcrumbCategory.slug,
                              topic.query,
                            );

                            event.preventDefault();
                            selectBreadcrumbTopic(topic);
                            router.push(href);
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

      {showRecipebookCategoryRail ? (
        <div className="relative z-40 md:sticky md:top-32 md:z-30 [@media_(min-width:1024px)_and_(max-height:900px)]:top-[7.5rem]">
          <RecipebookCategoryRail
            activeCategorySlug={activeRecipebookCategorySlug}
            allActive={pathname === "/przepisnik" && !activeRecipebookCategorySlug}
            categories={recipebookCategories}
            searchQuery={activeRecipebookSearchQuery}
            showScrollControls
          />
        </div>
      ) : null}

      {showMobileCategoryStrip ? (
        <div className="no-scrollbar overflow-x-auto border-b border-browin-border bg-browin-white py-3 md:hidden">
          <div className="flex w-max space-x-4 px-4">
            {storeCategories.map((category) => (
              <Link className={`group flex flex-col items-center gap-1.5 ${category.id === "domiogrod" ? "w-20" : "w-16"}`} href={`/kategoria/${category.slug}`} key={category.id} onClick={closeMobileMenu}>
                <div className="flex h-12 w-12 items-center justify-center rounded-none border border-browin-dark/10 bg-browin-dark/5 text-browin-red transition-colors group-hover:bg-browin-red group-hover:text-browin-white">
                  <StoreIcon icon={category.icon} size={22} weight="fill" />
                </div>
                <span className="text-center text-[9px] font-semibold uppercase tracking-wide text-browin-dark">
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
                className="flex shrink-0 items-center justify-center space-x-1 rounded-none border border-transparent bg-browin-dark/5 px-3 py-1.5 text-[11px] font-semibold text-browin-dark transition-colors hover:border-browin-dark/10 hover:bg-browin-dark/10 focus:outline-none"
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
                <button className="flex items-center justify-between bg-browin-red/5 px-4 py-2.5 text-sm font-semibold text-browin-red" type="button">
                  <span>Polski</span>
                  <Check size={16} />
                </button>
                <button className="px-4 py-2.5 text-left text-sm font-semibold text-browin-dark/70 transition-colors hover:bg-browin-dark/5" type="button">
                  English
                </button>
                <button className="px-4 py-2.5 text-left text-sm font-semibold text-browin-dark/70 transition-colors hover:bg-browin-dark/5" type="button">
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
                      <span className="text-center text-[9px] font-semibold uppercase leading-tight tracking-wide text-browin-dark">
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
                className="mb-3 inline-flex items-center gap-2 pt-2 text-[13px] font-semibold uppercase tracking-[0.16em] text-browin-dark/60 transition-colors hover:text-browin-red"
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
                    <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-browin-dark/45">
                      Kategoria
                    </p>
                    <h3 className="mt-1 text-base font-semibold tracking-tight text-browin-dark">
                      {activeMobileCategory.label}
                    </h3>
                  </div>
                </div>

                <Link
                  className="mt-3 inline-flex items-center gap-2 border border-browin-dark/10 bg-browin-white px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-browin-red transition-colors hover:border-browin-red hover:bg-browin-red/5"
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
                    className="flex items-center justify-between gap-3 py-4 text-[14px] font-semibold text-browin-dark transition-colors hover:text-browin-red"
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
                  <span className="text-[15px] font-semibold tracking-wide text-browin-red">
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
                    <span className="text-[15px] font-semibold tracking-wide text-browin-dark">
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
          <span className="text-[9px] font-semibold uppercase">Główna</span>
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
          <span className="text-[9px] font-semibold uppercase">Kategorie</span>
        </button>
        {hasProductRecipeNavContext ? (
          <button
            aria-pressed={isProductRecipePanelOpen}
            className={`${mobileBottomNavItemClass} relative focus:outline-none`}
            onClick={handleProductRecipesBottomNavClick}
            type="button"
          >
            <span
              className="product-recipe-nav-buzz mobile-recipe-nav-buzz relative flex"
              key={productRecipeNavProductId}
            >
              <RecipebookIcon
                className={getMobileBottomNavIconClass(isRecipesBottomNavHighlighted)}
                size={26}
                weight={isRecipesBottomNavHighlighted ? "fill" : "regular"}
              />
              <span className="absolute -right-2 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-browin-red px-1 text-[9px] font-semibold leading-none text-browin-white">
                {productRecipeNavCount}
              </span>
            </span>
            <span className="text-[9px] font-semibold uppercase">Przepisy</span>
          </button>
        ) : (
          <Link
            aria-current={isRecipesBottomNavActive ? "page" : undefined}
            className={mobileBottomNavItemClass}
            href="/przepisnik"
            onClick={closeMobileOverlays}
          >
            <RecipebookIcon
              className={getMobileBottomNavIconClass(isRecipesBottomNavHighlighted)}
              size={26}
              weight={isRecipesBottomNavHighlighted ? "fill" : "regular"}
            />
            <span className="text-[9px] font-semibold uppercase">Przepisy</span>
          </Link>
        )}
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
          <span className="text-[9px] font-semibold uppercase">Koszyk</span>
          <span className="absolute right-2 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-browin-red text-[9px] font-semibold text-browin-white">
            {cartCount}
          </span>
        </button>
      </div>

      {isHomePage ? (
        <div
          aria-label="Przełącznik testowego układu homepage"
          className="fixed bottom-5 right-5 z-[120] hidden items-center gap-1 rounded-full border border-browin-dark/10 bg-browin-white/65 p-1 text-[10px] font-semibold text-browin-dark/45 opacity-25 shadow-sm backdrop-blur-md transition-opacity duration-200 hover:opacity-100 focus-within:opacity-100 md:flex"
        >
          {homeLayoutVariantOptions.map(({ id, title }, index) => {
            const isActive = homeLayoutVariant === id;

            return (
              <button
                aria-pressed={isActive}
                className={`flex h-7 w-7 items-center justify-center rounded-full text-[11px] font-bold transition-colors ${
                  isActive
                    ? "bg-browin-dark text-browin-white"
                    : "text-browin-dark/55 hover:bg-browin-dark/8 hover:text-browin-dark"
                }`}
                key={id}
                onClick={() => updateHomeLayoutVariant(id)}
                title={title}
                type="button"
              >
                {index + 1}
              </button>
            );
          })}
        </div>
      ) : null}

      <MobileProductRecipePanel
        context={hasProductRecipeNavContext ? currentProductRecipeContext : null}
        isOpen={isProductRecipePanelOpen}
        onClose={closeProductRecipePanel}
      />

      <CartDrawer recipeCommerceEntries={recipeCommerceEntries} />
    </div>
  );
}
