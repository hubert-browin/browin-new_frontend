"use client";

import {
  ArrowRight,
  BookOpen,
  Calculator,
  CaretLeft,
  CaretRight,
  ClockCountdown,
  CookingPot,
  Fire,
  Gift,
  Handshake,
  ShoppingCart,
  Sliders,
  Wine,
} from "@phosphor-icons/react";
import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { useEffect, useRef, useState } from "react";

import { ProductCard } from "@/components/store/product-card";
import { StoreIcon } from "@/components/store/icon-map";
import { useCart } from "@/components/store/cart-provider";
import type { Product } from "@/data/products";
import type { CategoryId, StoreCategory } from "@/data/store";
import { formatCurrency, getPrimaryVariant } from "@/lib/catalog";

type HeroSlide = {
  id: string;
  image: string;
  eyebrow: string;
  title: ReactNode;
  cta: string;
  href: string;
  emphasis: "primary" | "light";
  align: "left" | "right";
  withAvatars?: boolean;
};

const heroSlides: HeroSlide[] = [
  {
    id: "wedliniarstwo",
    image: "/assets/szynka.webp",
    eyebrow: "+50,000 pasjonatów craftu",
    title: (
      <>
        Prawdziwe arcydzieło.
        <br />
        <span>Z Twojej kuchni.</span>
      </>
    ),
    cta: "Zobacz Bestsellery",
    href: "/kategoria/wedliniarstwo",
    emphasis: "primary" as const,
    withAvatars: true,
    align: "left" as const,
  },
  {
    id: "winiarstwo",
    image: "/assets/baner-27.02-wielkanoc5.webp",
    eyebrow: "Sezon na wino",
    title: (
      <>
        Stwórz własny
        <br />
        <span>niepowtarzalny rocznik.</span>
      </>
    ),
    cta: "Odkryj winiarstwo",
    href: "/kategoria/winiarstwo",
    emphasis: "light" as const,
    align: "left" as const,
  },
  {
    id: "serowarstwo",
    image: "/assets/zestaw.webp",
    eyebrow: "Warsztaty domowe",
    title: (
      <>
        Domowa serowarnia.
        <br />
        <span>To prostsze niż myślisz.</span>
      </>
    ),
    cta: "Sprzęt do serów",
    href: "/kategoria/serowarstwo",
    emphasis: "primary" as const,
    align: "right" as const,
  },
] as const;

const buildCategoryHref = (slug: string, query?: string) =>
  query ? `/kategoria/${slug}?search=${encodeURIComponent(query)}` : `/kategoria/${slug}`;

type HomePageProps = {
  featuredProducts: Product[];
  weeklyHit: Product | null;
  offerDay: Product | null;
  storeCategories: StoreCategory[];
};

export function HomePage({
  featuredProducts,
  offerDay,
  storeCategories,
  weeklyHit,
}: HomePageProps) {
  const { addItem } = useCart();
  const [desktopMenuOpen, setDesktopMenuOpen] = useState(false);
  const [activeDesktopCategory, setActiveDesktopCategory] = useState<CategoryId>(
    storeCategories[0]?.id ?? "wedliniarstwo",
  );
  const [currentSlide, setCurrentSlide] = useState(0);
  const openDesktopMenuTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const closeDesktopMenuTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const touchStartX = useRef(0);

  const activeDesktopData =
    storeCategories.find((category) => category.id === activeDesktopCategory) ??
    storeCategories[0];
  const activePromo = activeDesktopData.promo;
  const isEditorialDesktopPromo = activePromo.type === "editorial";
  const activePromoHref =
    activePromo.href ??
    (activePromo.productSlug
      ? `/produkt/${activePromo.productSlug}`
      : buildCategoryHref(activeDesktopData.slug));

  useEffect(() => {
    return () => {
      if (openDesktopMenuTimeout.current) {
        clearTimeout(openDesktopMenuTimeout.current);
      }

      if (closeDesktopMenuTimeout.current) {
        clearTimeout(closeDesktopMenuTimeout.current);
      }
    };
  }, []);

  const clearDesktopMenuIntent = () => {
    if (openDesktopMenuTimeout.current) {
      clearTimeout(openDesktopMenuTimeout.current);
      openDesktopMenuTimeout.current = null;
    }
  };

  const openDesktopCategory = (categoryId: CategoryId) => {
    clearDesktopMenuIntent();

    if (closeDesktopMenuTimeout.current) {
      clearTimeout(closeDesktopMenuTimeout.current);
      closeDesktopMenuTimeout.current = null;
    }

    setActiveDesktopCategory(categoryId);
    setDesktopMenuOpen(true);
  };

  const scheduleDesktopCategoryOpen = (categoryId: CategoryId) => {
    if (desktopMenuOpen && activeDesktopCategory === categoryId) {
      clearDesktopMenuIntent();

      if (closeDesktopMenuTimeout.current) {
        clearTimeout(closeDesktopMenuTimeout.current);
        closeDesktopMenuTimeout.current = null;
      }

      return;
    }

    clearDesktopMenuIntent();

    if (closeDesktopMenuTimeout.current) {
      clearTimeout(closeDesktopMenuTimeout.current);
      closeDesktopMenuTimeout.current = null;
    }

    openDesktopMenuTimeout.current = setTimeout(() => {
      setActiveDesktopCategory(categoryId);
      setDesktopMenuOpen(true);
      openDesktopMenuTimeout.current = null;
    }, 100);
  };

  const scheduleDesktopMenuClose = () => {
    clearDesktopMenuIntent();

    if (closeDesktopMenuTimeout.current) {
      clearTimeout(closeDesktopMenuTimeout.current);
    }

    closeDesktopMenuTimeout.current = setTimeout(() => {
      setDesktopMenuOpen(false);
      closeDesktopMenuTimeout.current = null;
    }, 160);
  };

  const cancelDesktopMenuClose = () => {
    if (closeDesktopMenuTimeout.current) {
      clearTimeout(closeDesktopMenuTimeout.current);
      closeDesktopMenuTimeout.current = null;
    }
  };

  const nextSlide = () => {
    setCurrentSlide((previous) => (previous + 1) % heroSlides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((previous) => (previous - 1 + heroSlides.length) % heroSlides.length);
  };

  const handleSwipeEnd = (clientX: number) => {
    const threshold = 50;
    if (clientX < touchStartX.current - threshold) {
      nextSlide();
    }

    if (clientX > touchStartX.current + threshold) {
      prevSlide();
    }
  };

  return (
    <>
      <section className="desktop-hero-frame relative z-30 bg-browin-gray py-4 md:py-6">
        <div className="container relative mx-auto px-4">
          <div className="hero-shell grid grid-cols-1 gap-4 md:gap-6 lg:grid-cols-12 lg:h-[500px] xl:h-[540px]">
            <div
              className="desktop-categories relative z-30 hidden h-full lg:col-span-3 lg:block"
              id="desktop-menu-wrapper"
              onMouseLeave={scheduleDesktopMenuClose}
            >
              <div
                className={`relative z-30 flex h-full flex-col justify-between border border-browin-dark/10 bg-browin-white py-2 ${
                  desktopMenuOpen ? "shadow-none" : "shadow-sm"
                }`}
                id="desktop-menu-container"
              >
                <div className="flex flex-1 flex-col w-full">
                  {storeCategories.map((category) => {
                    const isActive = desktopMenuOpen && activeDesktopCategory === category.id;

                    return (
                      <Link
                        className={`desktop-cat-tab group relative flex flex-1 items-center justify-between rounded-none border px-5 py-2 font-bold transition-colors duration-150 ${
                          isActive
                            ? "z-40 -mr-[1px] w-[calc(100%+2px)] border-y border-l border-r-transparent border-browin-dark/10 bg-browin-white text-browin-red"
                            : "w-full border-transparent text-browin-dark hover:bg-browin-dark/5"
                        }`}
                        href={`/kategoria/${category.slug}`}
                        id={`tab-${category.id}`}
                        key={category.id}
                        onClick={() => setDesktopMenuOpen(false)}
                        onFocus={() => openDesktopCategory(category.id)}
                        onMouseEnter={() => scheduleDesktopCategoryOpen(category.id)}
                        onMouseLeave={clearDesktopMenuIntent}
                      >
                        <div className="flex items-center space-x-3">
                          <StoreIcon className="text-browin-red" icon={category.icon} size={22} />
                          <span className="text-[14px] tracking-wide">{category.label}</span>
                        </div>
                        <CaretRight
                          className={`tab-arrow text-xs transition-all duration-150 group-hover:translate-x-1 ${
                            isActive ? "opacity-0 text-browin-red" : "opacity-40"
                          }`}
                          size={14}
                        />
                      </Link>
                    );
                  })}
                </div>

                <div className="mt-auto shrink-0 border-t border-browin-dark/10 px-5 pt-4 pb-2">
                  <Link
                    className="group flex items-center font-bold text-browin-red transition-colors hover:text-browin-dark"
                    href="/produkty?deal=true"
                  >
                    <Gift className="mr-3 transition-transform group-hover:rotate-12" size={22} weight="fill" />
                    <span className="text-[13px] tracking-wide">Outlet / Promocje</span>
                  </Link>
                </div>
              </div>

              <div
                className={`absolute left-[calc(100%-1px)] top-0 z-20 h-full w-[calc(300%+5rem)] overflow-hidden border border-l-0 border-browin-dark/10 bg-browin-white shadow-panel transition-opacity duration-150 ${
                  desktopMenuOpen ? "flex opacity-100" : "hidden opacity-0"
                }`}
                id="desktop-mega-panel"
                onMouseEnter={cancelDesktopMenuClose}
                onMouseLeave={scheduleDesktopMenuClose}
              >
                <div className="desktop-submenu flex h-full w-full">
                  <div className="flex w-[65%] gap-8 p-8 xl:p-12">
                    {activeDesktopData.menuSections.map((section) => (
                      <div className="flex-1" key={section.title}>
                        <h3 className="mb-5 border-b border-browin-dark/10 pb-3 text-[13px] font-extrabold uppercase tracking-wider text-browin-dark">
                          {section.title}
                        </h3>
                        <ul className="space-y-4 text-[14px] font-medium text-browin-dark/80">
                          {section.topics.map((topic) => (
                            <li key={topic.label}>
                              <Link
                                className="group flex items-center transition-all hover:pl-1 hover:text-browin-red"
                                href={buildCategoryHref(activeDesktopData.slug, topic.query)}
                                onClick={() => setDesktopMenuOpen(false)}
                              >
                                <span className="mr-3 h-1.5 w-1.5 bg-browin-dark/20 transition-colors group-hover:bg-browin-red" />
                                {topic.label}
                              </Link>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>

                  {isEditorialDesktopPromo ? (
                    <div className="group/promo relative flex w-[35%] flex-col items-center justify-center overflow-hidden border-l border-browin-dark/10 bg-browin-gray p-8 text-center xl:p-12">
                      <div className="relative z-10 flex w-full max-w-[18rem] flex-col items-center">
                        {activePromo.eyebrow ? (
                          <span className="mb-5 w-max rounded-none bg-browin-red px-3 py-1.5 text-[10px] font-bold uppercase text-browin-white shadow-sharp">
                            {activePromo.eyebrow}
                          </span>
                        ) : null}

                        {activePromo.icon ? (
                          <StoreIcon
                            className="mb-8 text-browin-red/20 transition-transform duration-500 group-hover/promo:scale-110"
                            icon={activePromo.icon}
                            size={120}
                            weight="fill"
                          />
                        ) : null}

                        <h4 className="mb-4 text-[26px] font-extrabold leading-tight text-browin-dark">
                          {activePromo.title}
                        </h4>
                        <p className="mb-10 text-sm leading-relaxed text-browin-dark/70">
                          {activePromo.description}
                        </p>
                        <Link
                          className="w-full border-2 border-browin-red px-8 py-3.5 text-center text-sm font-bold uppercase tracking-wide !text-browin-red transition-colors hover:bg-transparent hover:!text-browin-red"
                          href={activePromoHref}
                          onClick={() => setDesktopMenuOpen(false)}
                        >
                          {activePromo.cta}
                        </Link>
                      </div>
                    </div>
                  ) : (
                    <div className="group/promo relative flex w-[35%] flex-col justify-center border-l border-browin-dark/10 bg-browin-gray p-8 xl:p-12">
                      {activePromo.eyebrow ? (
                        <span className="mb-5 w-max rounded-none bg-browin-red px-3 py-1.5 text-[10px] font-bold uppercase text-browin-white shadow-sharp">
                          {activePromo.eyebrow}
                        </span>
                      ) : null}

                      <h4 className="mb-3 text-[22px] font-extrabold leading-tight text-browin-dark xl:text-[26px]">
                        {activePromo.title}
                      </h4>
                      <p className="mb-8 text-sm leading-relaxed text-browin-dark/70">
                        {activePromo.description}
                      </p>
                      {activePromo.image ? (
                        <div className="relative mx-auto mb-8 flex aspect-square w-full max-h-[220px] items-center justify-center overflow-hidden border border-browin-dark/10 bg-browin-white p-4">
                          <Image
                            alt={activePromo.title}
                            className="h-full w-full object-contain transition-transform duration-500 group-hover/promo:scale-105"
                            fill
                            sizes="280px"
                            src={activePromo.image}
                          />
                        </div>
                      ) : null}
                      <Link
                        className="w-full bg-browin-red py-3.5 text-center text-sm font-bold uppercase tracking-wide text-browin-white transition-colors hover:bg-browin-dark hover:text-browin-white"
                        href={activePromoHref}
                        onClick={() => setDesktopMenuOpen(false)}
                      >
                        {activePromo.cta}
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="hero-main-content relative z-10 flex h-full flex-col gap-4 md:gap-6 lg:col-span-9">
              <div className="utility-strip hidden h-14 w-full shrink-0 items-center justify-between border border-browin-dark/10 bg-browin-white px-6 shadow-none lg:flex">
                <div className="utility-strip-links flex items-center gap-6 overflow-hidden xl:gap-8">
                  <Link
                    className="group flex items-center space-x-2 whitespace-nowrap text-[11px] font-bold uppercase tracking-wider text-browin-dark transition-colors hover:text-browin-red xl:text-[12px]"
                    href="/produkty?search=prezent"
                  >
                    <Gift className="text-browin-red transition-transform group-hover:scale-110" size={18} />
                    <span>Karty podarunkowe</span>
                  </Link>
                  <Link
                    className="group flex items-center space-x-2 whitespace-nowrap text-[11px] font-bold uppercase tracking-wider text-browin-dark transition-colors hover:text-browin-red xl:text-[12px]"
                    href="/produkty?search=starter"
                  >
                    <Sliders className="text-browin-red transition-transform group-hover:rotate-90" size={18} />
                    <span>Konfigurator</span>
                  </Link>
                  <Link
                    className="group flex items-center space-x-2 whitespace-nowrap text-[11px] font-bold uppercase tracking-wider text-browin-dark transition-colors hover:text-browin-red xl:text-[12px]"
                    href="/produkty?search=termometr"
                  >
                    <Calculator className="text-browin-red transition-transform group-hover:scale-110" size={18} />
                    <span>Kalkulatory</span>
                  </Link>
                  <Link
                    className="group flex items-center space-x-2 whitespace-nowrap text-[11px] font-bold uppercase tracking-wider text-browin-dark transition-colors hover:text-browin-red xl:text-[12px]"
                    href="/checkout"
                  >
                    <Handshake className="text-browin-red transition-transform group-hover:scale-110" size={18} />
                    <span>Usługi</span>
                  </Link>
                </div>

                <Link
                  className="utility-strip-highlight group -mr-6 flex h-full shrink-0 items-center space-x-2 bg-browin-red px-6 text-[11px] font-extrabold uppercase tracking-wider text-browin-white transition-colors hover:bg-browin-red/90 xl:px-8 xl:text-[12px]"
                  href="/produkty?search=zestaw"
                >
                  <BookOpen className="transition-transform group-hover:scale-110" size={20} weight="fill" />
                  <span>Przepiśnik</span>
                </Link>
              </div>

              <div className="hero-banner-grid grid flex-1 min-h-0 grid-cols-1 gap-4 sm:grid-cols-2 md:gap-6 lg:grid-cols-3">
                <div className="hero-slider-card group relative h-[340px] overflow-hidden rounded-none border bg-browin-dark shadow-sm sm:h-auto lg:col-span-2">
                  <div
                    className="flex h-full w-full transition-transform duration-500 ease-in-out"
                    id="hero-slider"
                    onTouchEnd={(event) => handleSwipeEnd(event.changedTouches[0].screenX)}
                    onTouchStart={(event) => {
                      touchStartX.current = event.changedTouches[0].screenX;
                    }}
                    style={{ transform: `translateX(-${currentSlide * 100}%)` }}
                  >
                    {heroSlides.map((slide, index) => (
                      <div className="group/slide relative h-full w-full shrink-0 cursor-pointer" key={slide.id}>
                        <Image
                          alt={slide.id}
                          className="absolute inset-0 h-full w-full object-cover opacity-60 transition-transform duration-1000 group-hover/slide:scale-105"
                          fill
                          priority={index === 0}
                          sizes="(max-width: 1023px) 100vw, 66vw"
                          src={slide.image}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-browin-dark/90 via-browin-dark/20 to-transparent" />

                        <div
                          className={`absolute inset-0 flex flex-col justify-end p-5 pb-16 sm:p-6 sm:pb-[4.5rem] md:p-8 md:pb-20 xl:p-10 xl:pb-24 ${
                            slide.align === "right" ? "items-end text-right" : "items-start text-left"
                          }`}
                        >
                          {slide.withAvatars ? (
                            <div className="mb-5 flex w-max items-center space-x-2 rounded-none border border-browin-white/20 bg-browin-white/10 px-4 py-1.5 backdrop-blur-sm">
                              <div className="flex -space-x-2">
                                {["/assets/produkt1.webp", "/assets/produkt2.webp", "/assets/produkt3.webp"].map((image) => (
                                  <Image
                                    alt=""
                                    className="h-6 w-6 rounded-full border border-browin-dark object-cover"
                                    height={24}
                                    key={image}
                                    src={image}
                                    width={24}
                                  />
                                ))}
                              </div>
                              <span className="text-[11px] font-bold tracking-wide text-browin-white">
                                {slide.eyebrow}
                              </span>
                            </div>
                          ) : (
                            <span
                              className={`mb-4 w-max rounded-none px-3 py-1.5 text-[10px] font-bold uppercase shadow-sharp ${
                                slide.emphasis === "light"
                                  ? "bg-browin-red text-browin-white"
                                  : "border border-browin-white/20 bg-browin-dark/50 text-browin-white backdrop-blur-sm"
                              }`}
                            >
                              {slide.eyebrow}
                            </span>
                          )}

                          <h1 className="mb-4 max-w-[16rem] text-[1.95rem] font-extrabold leading-[1.08] text-browin-white drop-shadow-md sm:max-w-[18rem] sm:text-[2.35rem] md:max-w-[26rem] md:text-4xl xl:max-w-[30rem] xl:text-5xl">
                            {slide.title}
                          </h1>

                          <Link
                            className="hero-primary-cta inline-flex w-max items-center bg-browin-red px-5 py-3 text-[11px] font-extrabold uppercase tracking-wide text-browin-white shadow-sharp transition-colors hover:bg-browin-dark hover:text-browin-white md:px-8 md:py-3.5 md:text-sm"
                            href={slide.href}
                          >
                            {slide.cta}
                            <ArrowRight className="ml-3" size={18} />
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="absolute bottom-4 left-1/2 z-20 flex -translate-x-1/2 space-x-2 md:hidden">
                    {heroSlides.map((slide, index) => (
                      <button
                        className={`slider-dot focus:outline-none transition-all duration-300 ${
                          index === currentSlide
                            ? "h-2 w-4 bg-browin-red"
                            : "h-2 w-2 bg-browin-white/50 hover:bg-browin-white"
                        }`}
                        key={slide.id}
                        onClick={() => setCurrentSlide(index)}
                        type="button"
                      />
                    ))}
                  </div>

                  <button
                    className="absolute bottom-6 left-6 z-20 hidden h-11 w-11 items-center justify-center rounded-full border border-browin-white/20 bg-browin-white/92 text-browin-dark opacity-0 shadow-[0_8px_30px_rgb(0,0,0,0.12)] transition-all duration-300 hover:bg-browin-red hover:text-browin-white group-hover:opacity-100 md:flex"
                    onClick={prevSlide}
                    type="button"
                  >
                    <CaretLeft size={18} />
                  </button>

                  <div className="absolute bottom-6 left-1/2 z-20 hidden -translate-x-1/2 items-center justify-center space-x-2 md:flex">
                    {heroSlides.map((slide, index) => (
                      <button
                        className={`slider-dot focus:outline-none transition-all duration-300 ${
                          index === currentSlide
                            ? "h-2 w-4 bg-browin-red"
                            : "h-2 w-2 bg-browin-white/50 hover:bg-browin-white"
                        }`}
                        key={`desktop-${slide.id}`}
                        onClick={() => setCurrentSlide(index)}
                        type="button"
                      />
                    ))}
                  </div>

                  <button
                    className="absolute bottom-6 right-6 z-20 hidden h-11 w-11 items-center justify-center rounded-full border border-browin-white/20 bg-browin-white/92 text-browin-dark opacity-0 shadow-[0_8px_30px_rgb(0,0,0,0.12)] transition-all duration-300 hover:bg-browin-red hover:text-browin-white group-hover:opacity-100 md:flex"
                    onClick={nextSlide}
                    type="button"
                  >
                    <CaretRight size={18} />
                  </button>
                </div>

                <div className="hero-side-panels grid h-[400px] grid-cols-1 grid-rows-2 gap-4 md:gap-6 lg:col-span-1 lg:h-full">
                  {weeklyHit ? (
                    <div className="group relative flex h-full cursor-pointer flex-col justify-between overflow-hidden rounded-none border border-browin-dark/10 bg-browin-white p-5 shadow-sm transition-colors hover:border-browin-red xl:p-6">
                      <Link
                        aria-label={`Przejdź do produktu ${weeklyHit.title}`}
                        className="absolute inset-0 z-10"
                        href={`/produkt/${weeklyHit.slug}`}
                      />

                      <div className="relative z-10 flex items-start justify-between">
                        <div>
                          <span className="flex items-center text-[10px] font-bold uppercase tracking-wider text-browin-red xl:text-[11px]">
                            <Fire className="mr-1" size={16} weight="fill" />
                            Hit Tygodnia
                          </span>
                          <h3 className="mt-1 max-w-[90%] text-base font-bold leading-tight text-browin-dark transition-colors group-hover:text-browin-red xl:text-lg">
                            {weeklyHit.title}
                          </h3>
                        </div>
                      </div>

                      <div className="relative z-10 mt-auto flex items-end justify-between pt-2">
                        <div>
                          <p className="mb-0.5 text-xs font-bold text-browin-dark/50 line-through">
                            {formatCurrency(
                              (getPrimaryVariant(weeklyHit).compareAtPrice ??
                                getPrimaryVariant(weeklyHit).price) + 12,
                            )}
                          </p>
                          <p className="text-2xl font-extrabold leading-none text-browin-dark xl:text-3xl">
                            {formatCurrency(getPrimaryVariant(weeklyHit).price)}
                          </p>
                        </div>
                        <button
                          className="relative z-20 flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden border border-browin-dark/10 bg-browin-white text-browin-dark transition-[width,padding,justify-content,gap,background-color,border-color,color] duration-200 hover:border-browin-red hover:bg-browin-red hover:text-browin-white focus-visible:border-browin-red focus-visible:bg-browin-red focus-visible:text-browin-white xl:h-12 xl:w-12 xl:group-hover:w-[7.4rem] xl:group-hover:justify-start xl:group-hover:gap-2 xl:group-hover:border-browin-red xl:group-hover:bg-browin-red xl:group-hover:px-3 xl:group-hover:text-browin-white xl:hover:w-[7.4rem] xl:hover:justify-start xl:hover:gap-2 xl:hover:px-3 xl:focus-visible:w-[7.4rem] xl:focus-visible:justify-start xl:focus-visible:gap-2 xl:focus-visible:px-3"
                          onClick={(event) => {
                            event.preventDefault();
                            event.stopPropagation();
                            addItem(weeklyHit.id, getPrimaryVariant(weeklyHit).id);
                          }}
                          type="button"
                        >
                          <ShoppingCart className="shrink-0" size={20} />
                          <span className="hidden max-w-0 -translate-x-1 overflow-hidden whitespace-nowrap text-[10px] font-bold uppercase tracking-[0.14em] opacity-0 transition-[max-width,opacity,transform] duration-200 xl:block xl:group-hover:max-w-[3.8rem] xl:group-hover:translate-x-0 xl:group-hover:opacity-100 xl:hover:max-w-[3.8rem] xl:hover:translate-x-0 xl:hover:opacity-100 xl:focus-visible:max-w-[3.8rem] xl:focus-visible:translate-x-0 xl:focus-visible:opacity-100">
                            Dodaj
                          </span>
                        </button>
                      </div>
                      <CookingPot className="pointer-events-none absolute -right-2 top-8 text-browin-dark/5 transition-transform group-hover:-rotate-12" size={96} weight="fill" />
                    </div>
                  ) : (
                    <div className="flex h-full flex-col justify-between border border-browin-dark/10 bg-browin-white p-5 shadow-sm xl:p-6">
                      <div>
                        <span className="flex items-center text-[10px] font-bold uppercase tracking-wider text-browin-red xl:text-[11px]">
                          <Fire className="mr-1" size={16} weight="fill" />
                          Feed aktywny
                        </span>
                        <h3 className="mt-1 text-base font-bold leading-tight text-browin-dark xl:text-lg">
                          Produkty są wczytywane z publicznego JSON-a BROWIN.
                        </h3>
                      </div>
                    </div>
                  )}

                  {offerDay ? (
                    <div className="group relative flex h-full cursor-pointer flex-col justify-between overflow-hidden rounded-none border border-browin-dark/10 bg-browin-white p-5 shadow-sm transition-colors hover:border-browin-red xl:p-6">
                      <Link
                        aria-label={`Przejdź do produktu ${offerDay.title}`}
                        className="absolute inset-0 z-10"
                        href={`/produkt/${offerDay.slug}`}
                      />

                      <div className="relative z-10">
                        <span className="flex items-center text-[10px] font-bold uppercase tracking-wider text-browin-red xl:text-[11px]">
                          <ClockCountdown className="mr-1" size={16} weight="fill" />
                          Oferta Dnia
                        </span>
                        <h3 className="mt-1 text-base font-bold leading-tight text-browin-dark xl:text-lg">
                          {offerDay.title}
                        </h3>
                        <span className="mt-2 inline-block bg-browin-red px-2 py-0.5 text-[9px] font-bold text-browin-white">
                          Sprawdź teraz
                        </span>
                      </div>

                      <Wine className="pointer-events-none absolute -right-4 top-8 text-browin-dark/5 transition-transform duration-500 group-hover:-rotate-12" size={96} weight="fill" />

                      <div className="relative z-10 mt-4">
                        <div className="mb-3 flex items-end gap-2">
                          <span className="text-2xl font-extrabold leading-none tracking-tight text-browin-red xl:text-3xl">
                            {formatCurrency(getPrimaryVariant(offerDay).price)}
                          </span>
                        </div>
                        <div className="mb-1.5 h-1.5 w-full rounded-none bg-browin-dark/10">
                          <div className="h-1.5 w-[85%] rounded-none bg-browin-red" />
                        </div>
                        <div className="flex items-center justify-between text-[9px] font-bold uppercase text-browin-dark/60">
                          <span>Oferta specjalna</span>
                          <span className="text-browin-red">Zobacz produkt</span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="flex h-full flex-col justify-between border border-browin-dark/10 bg-browin-white p-5 shadow-sm xl:p-6">
                      <div>
                        <span className="flex items-center text-[10px] font-bold uppercase tracking-wider text-browin-red xl:text-[11px]">
                          <ClockCountdown className="mr-1" size={16} weight="fill" />
                          Dane live
                        </span>
                        <h3 className="mt-1 text-base font-bold leading-tight text-browin-dark xl:text-lg">
                          Draft sklepu czeka na pierwsze produkty z feedu.
                        </h3>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="home-featured-section relative z-20 border-t border-b border-browin-dark/5 bg-browin-gray py-8 md:py-12">
        <div className="container mx-auto px-4">
          <div className="product-grid grid grid-cols-2 gap-4 md:grid-cols-3 md:gap-6 xl:grid-cols-4">
            {featuredProducts.map((product, index) => (
              <ProductCard
                key={product.id}
                imageQuality={92}
                priority={index < 4}
                product={product}
                squareImage
              />
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
