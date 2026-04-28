"use client";

import {
  ArrowRight,
  Calculator,
  Camera,
  CaretDown,
  CaretLeft,
  CaretRight,
  Check,
  Fire,
  Gift,
  Globe,
  Heart,
  House,
  List,
  MagnifyingGlass,
  ShoppingCart,
  Sliders,
  Trash,
  User,
  X,
} from "@phosphor-icons/react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

import { RecipebookIcon } from "@/components/store/recipebook-icon";

import {
  categories,
  footerColumns,
  heroSlides,
  initialCart,
  products,
  supportSummary,
  trustBadges,
  utilityLinks,
  valuePoints,
  type CategoryId,
} from "@/lib/store-data";

type CategoryFilter = CategoryId | "all";

type CartItem = {
  productId: string;
  quantity: number;
};

const siteContainer = "mx-auto w-full max-w-[1440px] px-4";
const freeShippingThreshold = 149;
const formatCurrency = (value: number) =>
  new Intl.NumberFormat("pl-PL", {
    style: "currency",
    currency: "PLN",
  }).format(value);

export function Storefront() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] =
    useState<CategoryFilter>("all");
  const [desktopMenuOpen, setDesktopMenuOpen] = useState(false);
  const [activeDesktopCategory, setActiveDesktopCategory] = useState<CategoryId>(
    categories[0].id,
  );
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileLangOpen, setMobileLangOpen] = useState(false);
  const [activeAccordion, setActiveAccordion] = useState<CategoryId | null>(
    categories[0].id,
  );
  const [cartOpen, setCartOpen] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [cartItems, setCartItems] = useState<CartItem[]>(
    initialCart.map((item) => ({ ...item })),
  );

  const closeDesktopMenuTimeout = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);

  const activeDesktopData =
    categories.find((category) => category.id === activeDesktopCategory) ??
    categories[0];

  const filteredProducts = products.filter((product) => {
    const matchesCategory =
      selectedCategory === "all" || product.category === selectedCategory;
    const normalizedQuery = searchQuery.trim().toLowerCase();

    if (!normalizedQuery) {
      return matchesCategory;
    }

    const haystack = `${product.title} ${product.description} ${product.category}`.toLowerCase();
    return matchesCategory && haystack.includes(normalizedQuery);
  });

  const cartLines = cartItems
    .map((item) => {
      const product = products.find((candidate) => candidate.id === item.productId);

      if (!product) {
        return null;
      }

      return {
        product,
        quantity: item.quantity,
      };
    })
    .filter((item): item is { product: (typeof products)[number]; quantity: number } =>
      Boolean(item),
    );

  const cartCount = cartLines.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = cartLines.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0,
  );
  const shippingRemaining = Math.max(freeShippingThreshold - subtotal, 0);
  const shippingProgress = Math.min((subtotal / freeShippingThreshold) * 100, 100);

  useEffect(() => {
    document.body.style.overflow = mobileMenuOpen || cartOpen ? "hidden" : "";

    return () => {
      document.body.style.overflow = "";
    };
  }, [cartOpen, mobileMenuOpen]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setCartOpen(false);
        setMobileMenuOpen(false);
        setMobileLangOpen(false);
      }
    };

    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setMobileMenuOpen(false);
        setMobileLangOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  useEffect(() => {
    return () => {
      if (closeDesktopMenuTimeout.current) {
        clearTimeout(closeDesktopMenuTimeout.current);
      }
    };
  }, []);

  const scrollToSection = (sectionId: string) => {
    document.getElementById(sectionId)?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  const showDesktopCategory = (categoryId: CategoryId) => {
    if (closeDesktopMenuTimeout.current) {
      clearTimeout(closeDesktopMenuTimeout.current);
    }

    setActiveDesktopCategory(categoryId);
    setDesktopMenuOpen(true);
  };

  const scheduleDesktopMenuClose = () => {
    if (closeDesktopMenuTimeout.current) {
      clearTimeout(closeDesktopMenuTimeout.current);
    }

    closeDesktopMenuTimeout.current = setTimeout(() => {
      setDesktopMenuOpen(false);
    }, 140);
  };

  const cancelDesktopMenuClose = () => {
    if (closeDesktopMenuTimeout.current) {
      clearTimeout(closeDesktopMenuTimeout.current);
    }
  };

  const updateCartQuantity = (productId: string, quantity: number) => {
    setCartItems((current) => {
      if (quantity <= 0) {
        return current.filter((item) => item.productId !== productId);
      }

      const existingItem = current.find((item) => item.productId === productId);
      if (!existingItem) {
        return [...current, { productId, quantity }];
      }

      return current.map((item) =>
        item.productId === productId ? { ...item, quantity } : item,
      );
    });
  };

  const addToCart = (productId: string) => {
    const existingLine = cartItems.find((item) => item.productId === productId);
    updateCartQuantity(productId, (existingLine?.quantity ?? 0) + 1);
    setCartOpen(true);
  };

  const selectCategory = (categoryId: CategoryFilter) => {
    setSelectedCategory(categoryId);
    setMobileMenuOpen(false);
    setDesktopMenuOpen(false);
    setMobileLangOpen(false);
    scrollToSection("produkty");
  };

  const resetFilters = () => {
    setSearchQuery("");
    setSelectedCategory("all");
  };

  const handleSearchSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    scrollToSection("produkty");
  };

  const handleNextSlide = () => {
    setCurrentSlide((previous) => (previous + 1) % heroSlides.length);
  };

  const handlePreviousSlide = () => {
    setCurrentSlide(
      (previous) => (previous - 1 + heroSlides.length) % heroSlides.length,
    );
  };

  const handleSwipeStart = (clientX: number) => {
    touchStartX.current = clientX;
  };

  const handleSwipeEnd = (clientX: number) => {
    touchEndX.current = clientX;

    if (touchEndX.current < touchStartX.current - 50) {
      handleNextSlide();
    }

    if (touchEndX.current > touchStartX.current + 50) {
      handlePreviousSlide();
    }
  };

  const selectedCategoryLabel =
    selectedCategory === "all"
      ? "Wszystkie kategorie"
      : categories.find((category) => category.id === selectedCategory)?.label ??
        "Wszystkie kategorie";

  return (
    <div className="min-h-screen bg-browin-gray text-browin-dark">
      <div className="hidden bg-browin-dark text-[11px] text-browin-white md:block">
        <div className={`${siteContainer} flex items-center justify-between gap-6 py-2`}>
          <div className="flex flex-wrap items-center gap-6 font-semibold">
            {trustBadges.map((badge) => {
              const Icon = badge.icon;

              return (
                <span className="flex items-center gap-2" key={badge.label}>
                  <Icon size={18} />
                  <span>{badge.label}</span>
                </span>
              );
            })}
          </div>

          <div className="flex items-center gap-6 font-semibold">
            <button
              className="transition-colors hover:text-browin-red"
              onClick={() => scrollToSection("wartosci")}
              type="button"
            >
              Dostawa i płatność
            </button>
            <button
              className="transition-colors hover:text-browin-red"
              onClick={() => scrollToSection("kontakt")}
              type="button"
            >
              Kontakt
            </button>
            <button
              className="transition-colors hover:text-browin-red"
              onClick={() => scrollToSection("produkty")}
              type="button"
            >
              Blog
            </button>

            <div className="flex items-center gap-1 border-l border-white/20 pl-4">
              <Globe size={16} />
              <span className="font-bold tracking-wide">PL</span>
              <CaretDown size={12} className="text-white/70" />
            </div>
          </div>
        </div>
      </div>

      <header className="glass-header sticky top-0 z-50 border-b border-browin-border">
        <div
          className={`${siteContainer} hidden items-center gap-6 py-4 md:grid lg:grid-cols-[220px_minmax(0,1fr)_auto]`}
        >
          <Link aria-label="BROWIN demo" href="/">
            <Image
              alt="BROWIN"
              className="h-[2.1rem] w-auto max-w-[140px]"
              height={40}
              priority
              src="/assets/logo_BROWIN.svg"
              width={140}
            />
          </Link>

          <form className="relative" onSubmit={handleSearchSubmit}>
            <MagnifyingGlass
              className="absolute top-1/2 left-4 -translate-y-1/2 text-browin-dark/40"
              size={22}
            />
            <input
              className="w-full border-2 border-browin-dark/10 bg-browin-white py-3 pl-12 pr-44 text-sm font-semibold outline-none transition-colors placeholder:text-browin-dark/45 focus:border-browin-red"
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Szukaj sprzętu, drożdży, przepisów..."
              value={searchQuery}
            />
            <button
              aria-label="Wyszukaj obrazem"
              className="absolute top-1/2 right-32 -translate-y-1/2 p-2 text-browin-dark/40 transition-colors hover:text-browin-red"
              type="button"
            >
              <Camera size={22} />
            </button>
            <button
              className="absolute top-1 right-1 bottom-1 inline-flex w-28 items-center justify-center bg-browin-red text-sm font-bold text-browin-white transition-colors hover:bg-browin-dark"
              type="submit"
            >
              Szukaj
            </button>
          </form>

          <div className="flex items-center gap-2">
            <button
              className="border border-transparent p-2 transition-colors hover:border-browin-dark/10 hover:text-browin-red"
              type="button"
            >
              <User size={26} />
            </button>
            <button
              className="relative border border-transparent p-2 transition-colors hover:border-browin-dark/10 hover:text-browin-red"
              type="button"
            >
              <Heart size={26} />
              <span className="absolute top-1 right-1 inline-flex h-4 w-4 items-center justify-center rounded-full bg-browin-red text-[9px] font-bold text-white">
                0
              </span>
            </button>
            <button
              className="ml-2 flex items-center gap-3 border border-transparent px-2 py-2 transition-colors hover:border-browin-dark/10 hover:bg-browin-dark/5"
              onClick={() => setCartOpen(true)}
              type="button"
            >
              <span className="relative">
                <ShoppingCart size={28} />
                <span className="absolute -top-1 -right-2 inline-flex h-5 w-5 items-center justify-center rounded-full border-2 border-white bg-browin-red text-[10px] font-bold text-white">
                  {cartCount}
                </span>
              </span>
              <span className="hidden min-[1100px]:flex flex-col items-start">
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-browin-dark/60">
                  Koszyk
                </span>
                <span className="text-sm font-extrabold">
                  {formatCurrency(subtotal)}
                </span>
              </span>
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between bg-browin-white px-4 py-3 md:hidden">
          <div className="flex items-center gap-2">
            <button
              className="p-2 text-browin-dark"
              onClick={() => setMobileMenuOpen(true)}
              type="button"
            >
              <List size={26} />
            </button>

            <Link aria-label="BROWIN demo" href="/">
              <Image
                alt="BROWIN"
                className="h-[1.5rem] w-auto max-w-[112px]"
                height={28}
                priority
                src="/assets/logo_BROWIN.svg"
                width={112}
              />
            </Link>
          </div>

          <div className="flex items-center gap-3">
            <button className="text-browin-dark" type="button">
              <User size={24} />
            </button>
            <button
              className="relative text-browin-dark"
              onClick={() => setCartOpen(true)}
              type="button"
            >
              <ShoppingCart size={24} />
              <span className="absolute -top-1 -right-1 inline-flex h-4 w-4 items-center justify-center rounded-full bg-browin-red text-[9px] font-bold text-white">
                {cartCount}
              </span>
            </button>
          </div>
        </div>

        <div className="bg-browin-white px-4 pb-3 md:hidden">
          <form className="relative" onSubmit={handleSearchSubmit}>
            <MagnifyingGlass
              className="absolute top-1/2 left-3 -translate-y-1/2 text-browin-dark/40"
              size={20}
            />
            <input
              className="w-full border border-browin-dark/10 bg-browin-dark/5 py-2.5 pl-10 pr-10 text-sm font-semibold outline-none transition-colors placeholder:text-browin-dark/45 focus:border-browin-red focus:bg-white"
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Szukaj sprzętu..."
              value={searchQuery}
            />
            <button
              aria-label="Wyszukaj obrazem"
              className="absolute top-1/2 right-2 -translate-y-1/2 p-1 text-browin-dark/40 transition-colors hover:text-browin-red"
              type="button"
            >
              <Camera size={20} />
            </button>
          </form>
        </div>
      </header>

      <div className="no-scrollbar overflow-x-auto border-b border-browin-border bg-browin-white py-3 md:hidden">
        <div className="flex w-max gap-4 px-4">
          {categories.map((category) => {
            const Icon = category.icon;
            const isActive = selectedCategory === category.id;

            return (
              <button
                className="flex w-16 flex-col items-center gap-1.5"
                key={category.id}
                onClick={() => selectCategory(category.id)}
                type="button"
              >
                <span
                  className={`flex h-12 w-12 items-center justify-center border transition-colors ${
                    isActive
                      ? "border-browin-red bg-browin-red text-white"
                      : "border-browin-dark/10 bg-browin-dark/5 text-browin-red"
                  }`}
                >
                  <Icon size={22} weight="fill" />
                </span>
                <span className="text-center text-[9px] font-bold uppercase tracking-wide">
                  {category.shortLabel}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <main>
        <section className="relative z-30 bg-browin-gray py-4 md:py-6">
          <div className={siteContainer}>
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-12 lg:gap-6 lg:min-h-[520px]">
              <div
                className="relative hidden h-full lg:col-span-3 lg:block"
                onMouseLeave={scheduleDesktopMenuClose}
              >
                <div className="relative z-30 flex h-full flex-col justify-between border border-browin-dark/10 bg-white py-2 shadow-sm">
                  <div className="flex flex-1 flex-col">
                    {categories.map((category) => {
                      const Icon = category.icon;
                      const isActive =
                        desktopMenuOpen && activeDesktopCategory === category.id;

                      return (
                        <button
                          className={`flex items-center justify-between px-5 py-3 text-left font-bold transition-colors ${
                            isActive
                              ? "border-y border-l border-browin-dark/10 bg-white text-browin-red"
                              : "border border-transparent text-browin-dark hover:bg-browin-dark/5"
                          }`}
                          key={category.id}
                          onFocus={() => showDesktopCategory(category.id)}
                          onMouseEnter={() => showDesktopCategory(category.id)}
                          type="button"
                        >
                          <span className="flex items-center gap-3">
                            <Icon className="text-browin-red" size={22} />
                            <span className="text-sm tracking-wide">
                              {category.label}
                            </span>
                          </span>
                          <CaretRight
                            className={isActive ? "opacity-0" : "opacity-40"}
                            size={14}
                          />
                        </button>
                      );
                    })}
                  </div>

                  <div className="border-t border-browin-dark/10 px-5 pt-4 pb-2">
                    <button
                      className="flex items-center gap-3 font-extrabold tracking-wide text-browin-red transition-colors hover:text-browin-dark"
                      onClick={() => scrollToSection("produkty")}
                      type="button"
                    >
                      <Gift size={22} weight="fill" />
                      <span className="text-sm">Outlet / Promocje</span>
                    </button>
                  </div>
                </div>

                <div
                  className={`absolute top-0 left-[calc(100%-1px)] z-20 h-full w-[calc(300%+4rem)] overflow-hidden border border-l-0 border-browin-dark/10 bg-white shadow-panel transition-opacity duration-150 ${
                    desktopMenuOpen
                      ? "pointer-events-auto opacity-100"
                      : "pointer-events-none opacity-0"
                  }`}
                  onMouseEnter={cancelDesktopMenuClose}
                  onMouseLeave={scheduleDesktopMenuClose}
                >
                  <div className="flex h-full">
                    <div className="flex w-[65%] gap-8 p-8 xl:p-10">
                      {activeDesktopData.menuSections.map((section) => (
                        <div className="min-w-0 flex-1" key={section.title}>
                          <h3 className="mb-5 border-b border-browin-dark/10 pb-3 text-[13px] font-extrabold uppercase tracking-[0.16em]">
                            {section.title}
                          </h3>
                          <ul className="space-y-4 text-sm font-semibold text-browin-dark/80">
                            {section.links.map((link) => (
                              <li key={link}>
                                <button
                                  className="group flex items-center transition-all hover:pl-1 hover:text-browin-red"
                                  onClick={() => selectCategory(activeDesktopData.id)}
                                  type="button"
                                >
                                  <span className="mr-3 h-1.5 w-1.5 bg-browin-dark/20 transition-colors group-hover:bg-browin-red" />
                                  {link}
                                </button>
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>

                    <div className="flex w-[35%] flex-col justify-center border-l border-browin-dark/10 bg-browin-gray p-8 xl:p-10">
                      {activeDesktopData.promo.eyebrow ? (
                        <span className="mb-5 w-max bg-browin-red px-3 py-1.5 text-[10px] font-bold uppercase text-white shadow-sharp">
                          {activeDesktopData.promo.eyebrow}
                        </span>
                      ) : null}
                      <h4 className="text-2xl font-extrabold leading-tight">
                        {activeDesktopData.promo.title}
                      </h4>
                      <p className="mt-3 text-sm leading-relaxed text-browin-dark/70">
                        {activeDesktopData.promo.description}
                      </p>
                      <div className="relative mt-8 aspect-square max-h-[220px] overflow-hidden border border-browin-dark/10 bg-white p-4">
                        {activeDesktopData.promo.image ? (
                          <Image
                            alt={activeDesktopData.promo.title}
                            className="object-contain"
                            fill
                            sizes="(min-width: 1280px) 280px, 220px"
                            src={activeDesktopData.promo.image}
                          />
                        ) : activeDesktopData.promo.icon ? (
                          <div className="flex h-full items-center justify-center text-browin-red/25">
                            <activeDesktopData.promo.icon size={120} weight="fill" />
                          </div>
                        ) : null}
                      </div>
                      <button
                        className="mt-8 inline-flex w-full items-center justify-center bg-browin-dark px-5 py-3.5 text-sm font-bold uppercase tracking-[0.16em] text-white transition-colors hover:bg-browin-red"
                        onClick={() =>
                          activeDesktopData.promo.productId
                            ? addToCart(activeDesktopData.promo.productId)
                            : selectCategory(activeDesktopData.id)
                        }
                        type="button"
                      >
                        {activeDesktopData.promo.cta}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="lg:col-span-9 flex min-w-0 flex-col gap-4 md:gap-6">
                <div className="hidden h-14 items-center justify-between border border-browin-dark/10 bg-white px-6 shadow-sm lg:flex">
                  <div className="flex flex-wrap items-center gap-6 overflow-hidden">
                    {utilityLinks.map((link) => {
                      const Icon = link.icon;

                      return (
                        <button
                          className="flex items-center gap-2 whitespace-nowrap text-[11px] font-bold uppercase tracking-[0.16em] transition-colors hover:text-browin-red xl:text-xs"
                          key={link.id}
                          onClick={() => scrollToSection("produkty")}
                          type="button"
                        >
                          <Icon className="text-browin-red" size={18} />
                          <span>{link.label}</span>
                        </button>
                      );
                    })}
                  </div>

                  <button
                    className="-mr-6 flex h-full items-center gap-2 bg-browin-red px-8 text-[11px] font-extrabold uppercase tracking-[0.16em] text-white transition-colors hover:bg-browin-dark xl:text-xs"
                    onClick={() => scrollToSection("produkty")}
                    type="button"
                  >
                    <RecipebookIcon size={20} weight="fill" />
                    <span>Przepiśnik</span>
                  </button>
                </div>

                <div className="grid min-h-0 grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:gap-6">
                  <div className="group relative h-[320px] overflow-hidden border shadow-sm sm:h-auto lg:col-span-2">
                    <div
                      className="flex h-full transition-transform duration-500 ease-in-out"
                      onTouchEnd={(event) =>
                        handleSwipeEnd(event.changedTouches[0].screenX)
                      }
                      onTouchStart={(event) =>
                        handleSwipeStart(event.changedTouches[0].screenX)
                      }
                      style={{ transform: `translateX(-${currentSlide * 100}%)` }}
                    >
                      {heroSlides.map((slide, index) => (
                        <article
                          className="relative h-full w-full shrink-0 bg-browin-dark"
                          key={slide.id}
                        >
                          <Image
                            alt={slide.title}
                            className="object-cover opacity-65 transition-transform duration-1000 group-hover:scale-105"
                            fill
                            priority={index === 0}
                            sizes="(max-width: 1023px) 100vw, 66vw"
                            src={slide.image}
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-browin-dark/90 via-browin-dark/30 to-transparent" />
                          <div
                            className={`absolute inset-0 flex flex-col justify-end p-6 md:p-8 xl:p-10 ${
                              slide.align === "right"
                                ? "items-end text-right"
                                : "items-start text-left"
                            }`}
                          >
                            <span className="mb-4 inline-flex w-max items-center gap-2 border border-white/20 bg-white/10 px-4 py-1.5 text-[11px] font-bold tracking-wide text-white backdrop-blur-sm">
                              {slide.eyebrow}
                            </span>
                            <h1 className="max-w-[16ch] text-3xl font-extrabold leading-tight text-white md:text-4xl xl:text-5xl">
                              {slide.title}
                            </h1>
                            <p className="mt-4 max-w-xl text-sm leading-relaxed text-white/80 md:text-base">
                              {slide.description}
                            </p>
                            <button
                              className={`mt-6 inline-flex items-center gap-3 px-6 py-3.5 text-xs font-extrabold uppercase tracking-[0.16em] shadow-sharp transition-colors md:text-sm ${
                                slide.emphasis === "light"
                                  ? "bg-white text-browin-dark hover:bg-browin-red hover:text-white"
                                  : "bg-browin-red text-white hover:bg-white hover:text-browin-dark"
                              }`}
                              onClick={() => selectCategory(slide.categoryId)}
                              type="button"
                            >
                              {slide.cta}
                              <ArrowRight size={18} />
                            </button>
                          </div>
                        </article>
                      ))}
                    </div>

                    <button
                      className="absolute top-1/2 left-6 hidden h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-browin-dark/5 bg-white/90 text-browin-dark shadow-[0_8px_30px_rgba(0,0,0,0.12)] opacity-0 transition-all hover:bg-browin-red hover:text-white group-hover:translate-x-0 group-hover:opacity-100 md:flex"
                      onClick={handlePreviousSlide}
                      type="button"
                    >
                      <CaretLeft size={20} />
                    </button>
                    <button
                      className="absolute top-1/2 right-6 hidden h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-browin-dark/5 bg-white/90 text-browin-dark shadow-[0_8px_30px_rgba(0,0,0,0.12)] opacity-0 transition-all hover:bg-browin-red hover:text-white group-hover:translate-x-0 group-hover:opacity-100 md:flex"
                      onClick={handleNextSlide}
                      type="button"
                    >
                      <CaretRight size={20} />
                    </button>

                    <div className="absolute bottom-5 left-1/2 flex -translate-x-1/2 gap-2">
                      {heroSlides.map((slide, index) => (
                        <button
                          className={`h-2 transition-all ${
                            index === currentSlide
                              ? "w-4 bg-browin-red"
                              : "w-2 bg-white/50 hover:bg-white"
                          }`}
                          key={slide.id}
                          onClick={() => setCurrentSlide(index)}
                          type="button"
                        />
                      ))}
                    </div>
                  </div>

                  <div className="grid h-[420px] grid-cols-1 gap-4 sm:h-auto sm:grid-cols-2 lg:grid-cols-1 lg:grid-rows-2 lg:gap-6">
                    <article className="group relative flex h-full cursor-pointer flex-col justify-between overflow-hidden border border-browin-dark/10 bg-white p-5 shadow-sm transition-colors hover:border-browin-red xl:p-6">
                      <div>
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-[0.16em] text-browin-red">
                          <Fire size={16} weight="fill" />
                          Hit tygodnia
                        </span>
                        <h3 className="mt-2 max-w-[18ch] text-lg font-bold leading-tight transition-colors group-hover:text-browin-red">
                          Zestaw startowy Szynkowar
                        </h3>
                      </div>

                      <div className="relative mt-6 flex items-end justify-between gap-4">
                        <div>
                          <p className="text-xs font-bold text-browin-dark/50 line-through">
                            {formatCurrency(149.99)}
                          </p>
                          <p className="text-3xl font-extrabold leading-none">
                            {formatCurrency(119.99)}
                          </p>
                        </div>
                        <button
                          className="flex h-12 w-12 items-center justify-center bg-browin-dark/5 text-browin-dark transition-colors hover:bg-browin-red hover:text-white"
                          onClick={() => addToCart("zestaw-startowy-szynkowar")}
                          type="button"
                        >
                          <ShoppingCart size={22} />
                        </button>
                      </div>

                      <ShoppingCart
                        className="pointer-events-none absolute top-8 right-0 text-browin-dark/5 transition-transform group-hover:-rotate-12"
                        size={120}
                        weight="fill"
                      />
                    </article>

                    <article className="group relative flex h-full flex-col justify-between overflow-hidden border border-browin-dark/10 bg-white p-5 shadow-sm transition-colors hover:border-browin-red xl:p-6">
                      <div>
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-[0.16em] text-browin-red">
                          <Gift size={16} weight="fill" />
                          Oferta dnia
                        </span>
                        <h3 className="mt-2 text-lg font-bold leading-tight">
                          Balon winiarski 15 L
                        </h3>
                        <span className="mt-2 inline-block bg-browin-red px-2 py-0.5 text-[10px] font-bold uppercase text-white">
                          + Drożdże gratis
                        </span>
                      </div>

                      <div className="mt-6">
                        <div className="mb-3 flex items-end gap-2">
                          <span className="text-3xl font-extrabold leading-none text-browin-red">
                            {formatCurrency(89.99)}
                          </span>
                        </div>
                        <div className="h-1.5 bg-browin-dark/10">
                          <div className="h-1.5 w-[85%] bg-browin-red" />
                        </div>
                        <div className="mt-1.5 flex items-center justify-between text-[10px] font-bold uppercase text-browin-dark/60">
                          <span>Sprzedano 85%</span>
                          <span className="text-browin-red">Zostało 15 szt.</span>
                        </div>
                      </div>
                    </article>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section
          className="relative z-20 border-y border-browin-dark/10 bg-white"
          id="wartosci"
        >
          <div className={`${siteContainer} py-8`}>
            <div className="grid grid-cols-2 gap-4 text-center md:grid-cols-4 md:divide-x md:divide-browin-dark/10">
              {valuePoints.map((point) => {
                const Icon = point.icon;

                return (
                  <article className="px-2" key={point.title}>
                    <Icon className="mx-auto mb-2 text-browin-red" size={32} />
                    <h2 className="text-sm font-bold uppercase tracking-wide">
                      {point.title}
                    </h2>
                    <p className="mt-1 text-xs text-browin-dark/60">
                      {point.description}
                    </p>
                  </article>
                );
              })}
            </div>
          </div>
        </section>

        <section
          className="relative z-20 border-b border-browin-dark/10 bg-browin-gray py-12 md:py-16"
          id="produkty"
        >
          <div className={siteContainer}>
            <div className="flex flex-col gap-4 border-b border-browin-dark/10 pb-4 md:flex-row md:items-end md:justify-between">
              <div>
                <p className="text-sm font-bold uppercase tracking-[0.16em] text-browin-red">
                  Draft sklepu Next.js
                </p>
                <h2 className="mt-2 text-2xl font-extrabold uppercase tracking-tight md:text-3xl">
                  Polecane nowości
                </h2>
              </div>

              <div className="flex flex-wrap items-center gap-3 text-sm font-semibold text-browin-dark/70">
                <span>
                  Widok: <strong className="text-browin-dark">{selectedCategoryLabel}</strong>
                </span>
                {searchQuery ? (
                  <span>
                    Szukasz: <strong className="text-browin-dark">{searchQuery}</strong>
                  </span>
                ) : null}
                {(searchQuery || selectedCategory !== "all") && (
                  <button
                    className="text-browin-red transition-colors hover:text-browin-dark"
                    onClick={resetFilters}
                    type="button"
                  >
                    Wyczyść filtry
                  </button>
                )}
              </div>
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              <button
                className={`border px-4 py-2 text-xs font-bold uppercase tracking-[0.16em] transition-colors ${
                  selectedCategory === "all"
                    ? "border-browin-red bg-browin-red text-white"
                    : "border-browin-dark/10 bg-white text-browin-dark hover:border-browin-red hover:text-browin-red"
                }`}
                onClick={() => setSelectedCategory("all")}
                type="button"
              >
                Wszystkie
              </button>
              {categories.map((category) => (
                <button
                  className={`border px-4 py-2 text-xs font-bold uppercase tracking-[0.16em] transition-colors ${
                    selectedCategory === category.id
                      ? "border-browin-red bg-browin-red text-white"
                      : "border-browin-dark/10 bg-white text-browin-dark hover:border-browin-red hover:text-browin-red"
                  }`}
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  type="button"
                >
                  {category.label}
                </button>
              ))}
            </div>

            {filteredProducts.length ? (
              <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-4">
                {filteredProducts.map((product) => (
                  <article
                    className="group flex h-full min-h-[320px] flex-col border border-browin-dark/10 bg-white p-4 shadow-sm transition-colors hover:border-browin-red"
                    key={product.id}
                  >
                    <div className="relative mb-4 flex aspect-square w-full items-center justify-center overflow-hidden bg-browin-dark/5 p-3">
                      <Image
                        alt={product.title}
                        className="object-contain transition-transform duration-500 group-hover:scale-105"
                        fill
                        sizes="(max-width: 767px) 50vw, (max-width: 1279px) 33vw, 25vw"
                        src={product.image}
                      />
                      {product.badge ? (
                        <span
                          className={`absolute top-2 left-2 px-2 py-1 text-[9px] font-bold uppercase text-white shadow-sharp ${
                            product.badge === "Bestseller"
                              ? "bg-browin-dark"
                              : "bg-browin-red"
                          }`}
                        >
                          {product.badge}
                        </span>
                      ) : null}
                    </div>

                    <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-browin-red">
                      {
                        categories.find((category) => category.id === product.category)
                          ?.label
                      }
                    </p>
                    <h3 className="mt-2 line-clamp-2 text-sm font-bold leading-tight transition-colors group-hover:text-browin-red md:text-base">
                      {product.title}
                    </h3>
                    <p className="mt-2 text-sm leading-relaxed text-browin-dark/65">
                      {product.description}
                    </p>

                    <div className="mt-auto flex items-end justify-between gap-3 pt-4">
                      <div>
                        {product.compareAtPrice ? (
                          <p className="text-xs font-bold text-browin-dark/45 line-through">
                            {formatCurrency(product.compareAtPrice)}
                          </p>
                        ) : null}
                        <p className="text-lg font-extrabold md:text-xl">
                          {formatCurrency(product.price)}
                        </p>
                      </div>

                      <button
                        aria-label={`Dodaj ${product.title} do koszyka`}
                        className="flex h-10 w-10 items-center justify-center bg-browin-dark/5 text-browin-dark transition-colors hover:bg-browin-red hover:text-white md:h-11 md:w-11"
                        onClick={() => addToCart(product.id)}
                        type="button"
                      >
                        <ShoppingCart size={18} />
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <div className="mt-8 border border-dashed border-browin-dark/15 bg-white p-8 text-center shadow-sm">
                <p className="text-lg font-bold">
                  Brak produktów dla wybranych filtrów.
                </p>
                <p className="mt-2 text-sm text-browin-dark/65">
                  Ten draft korzysta z przykładowych danych produktowych dopasowanych
                  do stylu sklepu. Możemy łatwo podpiąć realny katalog.
                </p>
                <button
                  className="mt-5 inline-flex items-center gap-2 bg-browin-red px-5 py-3 text-sm font-bold uppercase tracking-[0.16em] text-white transition-colors hover:bg-browin-dark"
                  onClick={resetFilters}
                  type="button"
                >
                  Wyczyść filtry
                  <ArrowRight size={18} />
                </button>
              </div>
            )}
          </div>
        </section>
      </main>

      <footer
        className="border-t border-browin-dark/10 bg-browin-dark text-white"
        id="kontakt"
      >
        <div className={`${siteContainer} grid gap-10 py-12 lg:grid-cols-[1.3fr_repeat(3,1fr)]`}>
          <div>
            <Image
              alt="BROWIN"
              className="h-[2.1rem] w-auto max-w-[140px]"
              height={36}
              src="/assets/logo_BROWIN.svg"
              width={140}
            />
            <p className="mt-4 max-w-md text-sm leading-relaxed text-white/70">
              Publiczny draft sklepu przygotowany w Next.js na podstawie
              dostarczonego `index.html`, z zachowaniem oryginalnej estetyki,
              layoutu i charakteru marki.
            </p>
            <div className="mt-6 space-y-2 text-sm text-white/80">
              <p>{supportSummary.phone}</p>
              <p>{supportSummary.email}</p>
              <p>{supportSummary.hours}</p>
            </div>
          </div>

          {footerColumns.map((column) => (
            <div key={column.title}>
              <h2 className="text-sm font-extrabold uppercase tracking-[0.16em]">
                {column.title}
              </h2>
              <ul className="mt-5 space-y-3 text-sm text-white/70">
                {column.links.map((link) => (
                  <li key={link}>
                    <button
                      className="transition-colors hover:text-white"
                      onClick={() => scrollToSection("produkty")}
                      type="button"
                    >
                      {link}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </footer>

      <div
        className={`fixed inset-0 z-[70] bg-browin-dark/50 transition-opacity duration-300 ${
          cartOpen ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        onClick={() => setCartOpen(false)}
      />
      <aside
        className={`fixed top-0 right-0 z-[80] flex h-full w-full max-w-[400px] flex-col bg-white shadow-panel transition-transform duration-300 ${
          cartOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between border-b border-browin-dark/10 p-5">
          <h2 className="text-xl font-extrabold uppercase tracking-wide">
            Twój koszyk ({cartCount})
          </h2>
          <button
            className="bg-browin-dark/5 p-2 text-browin-dark transition-colors hover:text-browin-red"
            onClick={() => setCartOpen(false)}
            type="button"
          >
            <X size={20} />
          </button>
        </div>

        <div className="border-b border-browin-dark/10 bg-browin-gray p-5">
          {shippingRemaining > 0 ? (
            <p className="mb-3 text-[13px] font-bold">
              Brakuje Ci{" "}
              <span className="text-browin-red">
                {formatCurrency(shippingRemaining)}
              </span>{" "}
              do darmowej dostawy.
            </p>
          ) : (
            <p className="mb-3 text-[13px] font-bold text-browin-red">
              Masz już darmową dostawę.
            </p>
          )}

          <div className="h-2 overflow-hidden bg-browin-dark/10">
            <div
              className="h-full bg-browin-red transition-[width] duration-300"
              style={{ width: `${shippingProgress}%` }}
            />
          </div>
        </div>

        <div className="no-scrollbar flex-1 space-y-6 overflow-y-auto p-5">
          {cartLines.length ? (
            cartLines.map(({ product, quantity }) => (
              <article className="flex gap-4" key={product.id}>
                <div className="relative h-20 w-20 shrink-0 border border-browin-dark/10 bg-white p-1">
                  <Image
                    alt={product.title}
                    className="object-contain"
                    fill
                    sizes="80px"
                    src={product.image}
                  />
                </div>

                <div className="flex flex-1 flex-col justify-between">
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="text-[13px] font-bold leading-tight">
                      {product.title}
                    </h3>
                    <button
                      className="text-browin-dark/30 transition-colors hover:text-browin-red"
                      onClick={() => updateCartQuantity(product.id, 0)}
                      type="button"
                    >
                      <Trash size={18} />
                    </button>
                  </div>

                  <div className="mt-2 flex items-end justify-between gap-3">
                    <div className="flex items-center border border-browin-dark/10 bg-browin-gray">
                      <button
                        className="flex h-7 w-7 items-center justify-center text-browin-dark transition-colors hover:bg-browin-dark hover:text-white"
                        onClick={() =>
                          updateCartQuantity(product.id, quantity - 1)
                        }
                        type="button"
                      >
                        -
                      </button>
                      <span className="w-8 text-center text-[13px] font-bold">
                        {quantity}
                      </span>
                      <button
                        className="flex h-7 w-7 items-center justify-center text-browin-dark transition-colors hover:bg-browin-dark hover:text-white"
                        onClick={() =>
                          updateCartQuantity(product.id, quantity + 1)
                        }
                        type="button"
                      >
                        +
                      </button>
                    </div>
                    <span className="text-[15px] font-extrabold">
                      {formatCurrency(product.price * quantity)}
                    </span>
                  </div>
                </div>
              </article>
            ))
          ) : (
            <div className="border border-dashed border-browin-dark/15 bg-browin-gray p-6 text-center">
              <p className="font-bold">Koszyk jest pusty.</p>
              <p className="mt-2 text-sm text-browin-dark/65">
                Dodaj kilka produktów, żeby zobaczyć pełny przepływ zakupowy.
              </p>
            </div>
          )}
        </div>

        <div className="border-t border-browin-dark/10 bg-browin-gray p-5">
          <div className="mb-4 flex items-center justify-between">
            <span className="text-[13px] font-bold uppercase tracking-[0.16em] text-browin-dark/70">
              Suma
            </span>
            <span className="text-2xl font-extrabold tracking-tight">
              {formatCurrency(subtotal)}
            </span>
          </div>
          <button
            className="inline-flex w-full items-center justify-center gap-2 bg-browin-red py-4 text-sm font-extrabold uppercase tracking-[0.16em] text-white shadow-sharp transition-colors hover:bg-browin-dark"
            type="button"
          >
            Przejdź do kasy
            <ArrowRight size={18} />
          </button>
        </div>
      </aside>

      <div
        className={`fixed inset-0 z-[60] flex flex-col bg-browin-gray transition-transform duration-300 md:hidden ${
          mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between border-b border-browin-dark/10 bg-white px-4 py-3 shadow-sm">
          <Image
            alt="BROWIN"
            className="h-[1.35rem] w-auto max-w-[102px]"
            height={24}
            src="/assets/logo_BROWIN.svg"
            width={102}
          />

          <div className="flex items-center gap-2">
            <div className="relative">
              <button
                className="flex items-center gap-1 border border-transparent bg-browin-dark/5 px-3 py-1.5 text-[11px] font-bold text-browin-dark transition-colors hover:border-browin-dark/10 hover:bg-browin-dark/10"
                onClick={() => setMobileLangOpen((current) => !current)}
                type="button"
              >
                <Globe size={14} />
                <span>PL</span>
                <CaretDown size={12} />
              </button>

              <div
                className={`absolute top-full right-0 mt-2 w-40 overflow-hidden border border-browin-dark/10 bg-white shadow-sharp ${
                  mobileLangOpen ? "block" : "hidden"
                }`}
              >
                <button
                  className="flex w-full items-center justify-between bg-browin-red/5 px-4 py-2.5 text-sm font-bold text-browin-red"
                  type="button"
                >
                  <span>Polski</span>
                  <Check size={16} />
                </button>
                <button
                  className="block w-full px-4 py-2.5 text-left text-sm text-browin-dark/70"
                  type="button"
                >
                  English
                </button>
                <button
                  className="block w-full px-4 py-2.5 text-left text-sm text-browin-dark/70"
                  type="button"
                >
                  Deutsch
                </button>
              </div>
            </div>

            <button
              className="flex h-8 w-8 items-center justify-center bg-browin-dark/5 text-browin-dark"
              onClick={() => setMobileMenuOpen(false)}
              type="button"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        <div className="no-scrollbar flex-1 overflow-y-auto bg-white pb-8">
          <form className="relative m-4 mb-2" onSubmit={handleSearchSubmit}>
            <MagnifyingGlass
              className="absolute top-1/2 left-3.5 -translate-y-1/2 text-browin-dark/40"
              size={20}
            />
            <input
              className="w-full border border-browin-dark/10 bg-browin-dark/5 py-3.5 pl-11 pr-10 text-sm font-semibold outline-none transition-colors placeholder:text-browin-dark/45 focus:border-browin-red focus:bg-white"
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Czego szukasz?"
              value={searchQuery}
            />
            <button
              className="absolute top-1/2 right-3 -translate-y-1/2 text-browin-dark/40"
              type="button"
            >
              <Camera size={20} />
            </button>
          </form>

          <button
            className="mb-2 flex w-full items-center justify-between border-y border-browin-dark/5 bg-browin-dark/5 px-4 py-3 text-left"
            onClick={() => {
              setMobileMenuOpen(false);
              scrollToSection("produkty");
            }}
            type="button"
          >
            <span className="flex items-center gap-3 text-[15px] font-bold tracking-wide text-browin-red">
              <Gift size={20} />
              Promocje Outlet do -30%
            </span>
            <ArrowRight className="text-browin-dark/40" size={16} />
          </button>

          <div className="divide-y divide-browin-dark/5 px-4">
            {categories.map((category) => {
              const Icon = category.icon;
              const isOpen = activeAccordion === category.id;

              return (
                <div key={category.id}>
                  <button
                    className="flex w-full items-center justify-between py-4 text-left"
                    onClick={() =>
                      setActiveAccordion((current) =>
                        current === category.id ? null : category.id,
                      )
                    }
                    type="button"
                  >
                    <span className="flex items-center gap-4">
                      <Icon size={24} />
                      <span className="text-[15px] font-bold tracking-wide">
                        {category.label}
                      </span>
                    </span>
                    <CaretDown
                      className={`transition-transform duration-300 ${
                        isOpen ? "rotate-180" : ""
                      }`}
                      size={16}
                    />
                  </button>

                  {isOpen ? (
                    <div className="mb-2 divide-y divide-browin-dark/5 bg-browin-dark/5">
                      {category.menuSections.flatMap((section) => section.links).map((link) => (
                        <button
                          className="block w-full px-6 py-3 text-left text-[13px] font-bold text-browin-dark transition-colors hover:text-browin-red"
                          key={link}
                          onClick={() => selectCategory(category.id)}
                          type="button"
                        >
                          {link}
                        </button>
                      ))}
                    </div>
                  ) : null}
                </div>
              );
            })}
          </div>

          <div className="my-4 h-2 border-y border-browin-dark/5 bg-browin-gray" />

          <div className="px-4">
            <h2 className="ml-1 mb-4 text-[10px] font-bold uppercase tracking-[0.16em] text-browin-dark/50">
              Narzędzia i wsparcie
            </h2>
            <div className="grid grid-cols-6 gap-3">
              <button
                className="col-span-2 aspect-square border border-browin-dark/10 bg-browin-dark/5 p-3 text-center"
                onClick={() => scrollToSection("produkty")}
                type="button"
              >
                <Calculator className="mx-auto mb-2" size={24} />
                <span className="text-[10px] font-bold">Kalkulatory</span>
              </button>
              <button
                className="col-span-2 aspect-square border border-browin-red bg-browin-red p-3 text-center text-white shadow-sharp"
                onClick={() => scrollToSection("produkty")}
                type="button"
              >
                <RecipebookIcon className="mx-auto mb-2" size={24} weight="fill" />
                <span className="text-[10px] font-extrabold">Przepiśnik</span>
              </button>
              <button
                className="col-span-2 aspect-square border border-browin-dark/10 bg-browin-dark/5 p-3 text-center"
                onClick={() => scrollToSection("produkty")}
                type="button"
              >
                <Sliders className="mx-auto mb-2" size={24} />
                <span className="text-[10px] font-bold">Konfigurator</span>
              </button>
              <button
                className="col-span-3 aspect-[3/2] border border-browin-dark/10 bg-browin-dark/5 p-3 text-center"
                onClick={() => scrollToSection("produkty")}
                type="button"
              >
                <Gift className="mx-auto mb-2" size={24} />
                <span className="text-[11px] font-bold uppercase tracking-wide">
                  Karty podarunkowe
                </span>
              </button>
              <button
                className="col-span-3 aspect-[3/2] border border-browin-dark/10 bg-browin-dark/5 p-3 text-center"
                onClick={() => scrollToSection("kontakt")}
                type="button"
              >
                <User className="mx-auto mb-2" size={24} />
                <span className="text-[11px] font-bold uppercase tracking-wide">
                  Nasze usługi
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="pb-safe fixed inset-x-0 bottom-0 z-50 flex items-center justify-between border-t border-browin-dark/10 bg-white px-8 py-2 text-browin-dark/60 shadow-[0_-10px_20px_-10px_rgba(0,0,0,0.1)] md:hidden">
        <button
          className="flex w-16 flex-col items-center text-browin-red"
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          type="button"
        >
          <House size={26} weight="fill" />
          <span className="text-[9px] font-bold uppercase">Główna</span>
        </button>
        <button
          className="flex w-16 flex-col items-center transition-colors hover:text-browin-red"
          onClick={() => setMobileMenuOpen(true)}
          type="button"
        >
          <List size={26} />
          <span className="text-[9px] font-bold uppercase">Kategorie</span>
        </button>
        <button
          className="flex w-16 flex-col items-center transition-colors hover:text-browin-red"
          onClick={() => scrollToSection("produkty")}
          type="button"
        >
          <RecipebookIcon size={26} />
          <span className="text-[9px] font-bold uppercase">Przepisy</span>
        </button>
        <button
          className="relative flex w-16 flex-col items-center"
          onClick={() => setCartOpen(true)}
          type="button"
        >
          <ShoppingCart className="text-browin-dark" size={26} />
          <span className="text-[9px] font-bold uppercase text-browin-dark">
            Koszyk
          </span>
          <span className="absolute -top-1 right-2 inline-flex h-4 w-4 items-center justify-center rounded-full bg-browin-red text-[9px] font-bold text-white">
            {cartCount}
          </span>
        </button>
      </div>
    </div>
  );
}
