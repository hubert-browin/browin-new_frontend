"use client";

import {
  ArrowRight,
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
  ShoppingCart,
  Sliders,
  Tag,
  User,
  X,
} from "@phosphor-icons/react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { CartDrawer } from "@/components/store/cart-drawer";
import { StoreFooter } from "@/components/store/store-footer";
import { StoreIcon } from "@/components/store/icon-map";
import { useCart } from "@/components/store/cart-provider";
import { useFavorites } from "@/components/store/favorites-provider";
import { trustBadges, type CategoryId, type StoreCategory } from "@/data/store";
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
  const searchSeed = "";
  const isProductPage = pathname.startsWith("/produkt/");
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
    closeMobileMenu();
  };

  return (
    <div className="min-h-screen bg-browin-gray text-browin-dark">
      <div className="desktop-topbar hidden bg-browin-dark py-2 text-[11px] text-browin-white md:block">
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

        <div className="flex items-center justify-between bg-browin-white px-4 py-2.5 md:hidden">
          <div className="flex items-center">
            <button className="-ml-2 mr-2 p-2 text-browin-dark focus:outline-none" onClick={openMobileMenu} type="button">
              <List size={26} />
            </button>
            <Link className="flex-shrink-0" href="/">
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

          <div className="flex items-center">
            <button className="relative cursor-pointer p-1 text-browin-dark" onClick={handleOpenCart} type="button">
              <ShoppingCart size={24} />
              <span className="absolute -right-1 -top-1 flex h-[16px] w-[16px] items-center justify-center rounded-full bg-browin-red text-[9px] font-bold text-browin-white">
                {cartCount}
              </span>
            </button>
          </div>
        </div>

        <div className="block border-t border-browin-dark/8 bg-browin-white px-4 pb-3 pt-2 md:hidden">
          <MobileSearchForm onSubmit={handleSearchSubmit} searchSeed={searchSeed} />
        </div>
      </header>

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
          <MobileSearchForm
            className="m-4 mb-2 shrink-0"
            onSubmit={handleSearchSubmit}
            searchSeed={searchSeed}
          />

          {!activeMobileCategory ? (
            <Link
              className="mb-2 flex items-center justify-between border-y border-browin-dark/5 bg-browin-dark/5 px-4 py-3 transition-colors hover:bg-browin-dark/10 shrink-0"
              href="/produkty?deal=true"
              onClick={closeMobileMenu}
            >
              <div className="flex items-center space-x-3">
                <Tag className="text-browin-red" size={20} />
                <span className="text-[15px] font-bold tracking-wide text-browin-red">
                  Promocje Outlet do -30%
                </span>
              </div>
              <ArrowRight className="text-browin-dark/40" size={16} />
            </Link>
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

          {!activeMobileCategory ? (
            <>
              <div className="my-4 h-2 w-full border-y border-browin-dark/5 bg-browin-gray shrink-0" />

              <div className="px-4 shrink-0">
                <h3 className="mb-4 ml-1 text-[10px] font-bold uppercase tracking-wider text-browin-dark/50">
                  Narzędzia i wsparcie
                </h3>

                <div className="mb-6 grid grid-cols-2 gap-3">
                  <Link
                    className="flex min-h-[6.75rem] flex-col items-center justify-center gap-3 rounded-none border border-browin-dark/10 bg-browin-dark/5 p-4 text-center transition-colors hover:border-browin-red"
                    href="/produkty?search=termometr"
                    onClick={closeMobileMenu}
                  >
                    <Calculator className="text-browin-dark" size={24} />
                    <span className="text-[11px] font-bold leading-tight text-browin-dark">
                      Kalkulatory
                    </span>
                  </Link>
                  <Link
                    className="flex min-h-[6.75rem] flex-col items-center justify-center gap-3 rounded-none border border-browin-red bg-browin-red p-4 text-center text-browin-white shadow-sharp transition-colors hover:bg-browin-red/90"
                    href="/produkty?search=zestaw"
                    onClick={closeMobileMenu}
                  >
                    <BookOpen className="text-browin-white" size={24} weight="fill" />
                    <span className="text-[11px] font-extrabold leading-tight text-browin-white">
                      Przepiśnik
                    </span>
                  </Link>
                  <Link
                    className="flex min-h-[6.75rem] flex-col items-center justify-center gap-3 rounded-none border border-browin-dark/10 bg-browin-dark/5 p-4 text-center transition-colors hover:border-browin-red"
                    href="/produkty?search=starter"
                    onClick={closeMobileMenu}
                  >
                    <Sliders className="text-browin-dark" size={24} />
                    <span className="text-[11px] font-bold leading-tight text-browin-dark">
                      Konfigurator
                    </span>
                  </Link>
                  <Link
                    className="flex min-h-[6.75rem] flex-col items-center justify-center gap-3 rounded-none border border-browin-dark/10 bg-browin-dark/5 p-4 text-center transition-colors hover:border-browin-red"
                    href="/produkty?search=prezent"
                    onClick={closeMobileMenu}
                  >
                    <Gift className="text-browin-dark" size={24} />
                    <span className="text-[11px] font-bold uppercase tracking-wide text-browin-dark">
                      Karty podarunkowe
                    </span>
                  </Link>
                  <Link
                    className="col-span-2 flex min-h-[6.75rem] flex-col items-center justify-center gap-3 rounded-none border border-browin-dark/10 bg-browin-dark/5 p-4 text-center transition-colors hover:border-browin-red"
                    href="/checkout"
                    onClick={closeMobileMenu}
                  >
                    <Handshake className="text-browin-dark" size={24} />
                    <span className="text-[11px] font-bold uppercase tracking-wide text-browin-dark">
                      Nasze usługi
                    </span>
                  </Link>
                </div>
              </div>
            </>
          ) : null}
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
