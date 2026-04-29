"use client";

import {
  ArrowRight,
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
import type { FocusEvent, MouseEvent as ReactMouseEvent, ReactNode } from "react";
import { useCallback, useEffect, useRef, useState } from "react";

import { ProductCard } from "@/components/store/product-card";
import { RecipebookIcon } from "@/components/store/recipebook-icon";
import { StoreIcon } from "@/components/store/icon-map";
import { useCart } from "@/components/store/cart-provider";
import type { Product } from "@/data/products";
import type { CategoryId, StoreCategory } from "@/data/store";
import { formatCurrency, getPrimaryVariant } from "@/lib/catalog";

type HeroSlide = {
  id: string;
  image: string;
  eyebrow: string;
  progressLabel: string;
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
    progressLabel: "Wędliny",
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
    progressLabel: "Wino",
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
    progressLabel: "Sery",
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

const HERO_AUTOPLAY_INTERVAL_MS = 3500;
const HERO_TOUCH_RESUME_DELAY_MS = 500;

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
  const [heroProgress, setHeroProgress] = useState(0);
  const [isHeroPaused, setIsHeroPaused] = useState(false);
  const [isHeroInView, setIsHeroInView] = useState(true);
  const [isPageVisible, setIsPageVisible] = useState(true);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [heroDragOffset, setHeroDragOffset] = useState(0);
  const [isHeroMouseDragging, setIsHeroMouseDragging] = useState(false);
  const openDesktopMenuTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const closeDesktopMenuTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const heroSliderRef = useRef<HTMLDivElement | null>(null);
  const touchStartX = useRef(0);
  const heroMouseStartX = useRef(0);
  const isHeroMouseDraggingRef = useRef(false);
  const suppressHeroClickRef = useRef(false);
  const touchResumeTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const heroProgressRef = useRef(0);
  const heroAnimationFrame = useRef<number | null>(null);
  const isHeroAutoplayPaused =
    isHeroPaused || !isHeroInView || !isPageVisible || prefersReducedMotion;

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

  const setSyncedHeroProgress = useCallback((nextProgress: number) => {
    const clampedProgress = Math.min(1, Math.max(0, nextProgress));

    heroProgressRef.current = clampedProgress;
    setHeroProgress(clampedProgress);
  }, []);

  const resetHeroProgress = useCallback(() => {
    setSyncedHeroProgress(0);
  }, [setSyncedHeroProgress]);

  useEffect(() => {
    return () => {
      if (openDesktopMenuTimeout.current) {
        clearTimeout(openDesktopMenuTimeout.current);
      }

      if (closeDesktopMenuTimeout.current) {
        clearTimeout(closeDesktopMenuTimeout.current);
      }

      if (touchResumeTimeout.current) {
        clearTimeout(touchResumeTimeout.current);
      }

      if (heroAnimationFrame.current) {
        window.cancelAnimationFrame(heroAnimationFrame.current);
      }
    };
  }, []);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const syncReducedMotionPreference = () => {
      setPrefersReducedMotion(mediaQuery.matches);
    };

    syncReducedMotionPreference();
    mediaQuery.addEventListener("change", syncReducedMotionPreference);

    return () => {
      mediaQuery.removeEventListener("change", syncReducedMotionPreference);
    };
  }, []);

  useEffect(() => {
    const heroSlider = heroSliderRef.current;

    if (!heroSlider || !("IntersectionObserver" in window)) {
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsHeroInView(entry.isIntersecting && entry.intersectionRatio >= 0.35);
      },
      { threshold: [0, 0.35, 0.65] },
    );

    observer.observe(heroSlider);

    return () => {
      observer.disconnect();
    };
  }, []);

  useEffect(() => {
    const syncPageVisibility = () => {
      setIsPageVisible(document.visibilityState === "visible");
    };

    syncPageVisibility();
    document.addEventListener("visibilitychange", syncPageVisibility);

    return () => {
      document.removeEventListener("visibilitychange", syncPageVisibility);
    };
  }, []);

  useEffect(() => {
    if (isHeroAutoplayPaused) {
      return;
    }

    let previousTimestamp: number | null = null;

    const tickHeroProgress = (timestamp: number) => {
      if (previousTimestamp === null) {
        previousTimestamp = timestamp;
      }

      const elapsed = timestamp - previousTimestamp;
      previousTimestamp = timestamp;
      const nextProgress =
        heroProgressRef.current + elapsed / HERO_AUTOPLAY_INTERVAL_MS;

      if (nextProgress >= 1) {
        resetHeroProgress();
        setCurrentSlide((previous) => (previous + 1) % heroSlides.length);
        heroAnimationFrame.current = null;
        return;
      }

      setSyncedHeroProgress(nextProgress);
      heroAnimationFrame.current = window.requestAnimationFrame(tickHeroProgress);
    };

    heroAnimationFrame.current = window.requestAnimationFrame(tickHeroProgress);

    return () => {
      if (heroAnimationFrame.current) {
        window.cancelAnimationFrame(heroAnimationFrame.current);
        heroAnimationFrame.current = null;
      }
    };
  }, [currentSlide, isHeroAutoplayPaused, resetHeroProgress, setSyncedHeroProgress]);

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

  const pauseHeroAutoplay = useCallback(() => {
    if (touchResumeTimeout.current) {
      clearTimeout(touchResumeTimeout.current);
      touchResumeTimeout.current = null;
    }

    setIsHeroPaused(true);
  }, []);

  const resumeHeroAutoplay = useCallback(() => {
    if (touchResumeTimeout.current) {
      clearTimeout(touchResumeTimeout.current);
      touchResumeTimeout.current = null;
    }

    setIsHeroPaused(false);
  }, []);

  const scheduleHeroTouchResume = useCallback(() => {
    if (touchResumeTimeout.current) {
      clearTimeout(touchResumeTimeout.current);
    }

    touchResumeTimeout.current = setTimeout(() => {
      setIsHeroPaused(false);
      touchResumeTimeout.current = null;
    }, HERO_TOUCH_RESUME_DELAY_MS);
  }, []);

  const goToSlide = useCallback((index: number) => {
    setCurrentSlide(index);
    resetHeroProgress();
  }, [resetHeroProgress]);

  const nextSlide = useCallback(() => {
    setCurrentSlide((previous) => (previous + 1) % heroSlides.length);
    resetHeroProgress();
  }, [resetHeroProgress]);

  const prevSlide = useCallback(() => {
    setCurrentSlide((previous) => (previous - 1 + heroSlides.length) % heroSlides.length);
    resetHeroProgress();
  }, [resetHeroProgress]);

  const moveHeroFromDrag = useCallback((startX: number, endX: number) => {
    const threshold = 50;
    const dragDistance = endX - startX;

    if (dragDistance < -threshold) {
      nextSlide();
      return true;
    }

    if (dragDistance > threshold) {
      prevSlide();
      return true;
    }

    return false;
  }, [nextSlide, prevSlide]);

  const handleSwipeEnd = useCallback((clientX: number) => {
    moveHeroFromDrag(touchStartX.current, clientX);
  }, [moveHeroFromDrag]);

  const updateHeroMouseDrag = useCallback((clientX: number) => {
    if (!isHeroMouseDraggingRef.current || !heroSliderRef.current) {
      return;
    }

    const rawOffset = clientX - heroMouseStartX.current;
    const maxOffset = heroSliderRef.current.clientWidth * 0.28;
    setHeroDragOffset(Math.max(-maxOffset, Math.min(maxOffset, rawOffset)));
  }, []);

  const finishHeroMouseDrag = useCallback((clientX: number) => {
    if (!isHeroMouseDraggingRef.current) {
      return;
    }

    const movedDistance = Math.abs(clientX - heroMouseStartX.current);
    isHeroMouseDraggingRef.current = false;
    setIsHeroMouseDragging(false);
    setHeroDragOffset(0);
    moveHeroFromDrag(heroMouseStartX.current, clientX);

    if (movedDistance > 8) {
      suppressHeroClickRef.current = true;
      window.setTimeout(() => {
        suppressHeroClickRef.current = false;
      }, 0);
    }
  }, [moveHeroFromDrag]);

  useEffect(() => {
    const handleWindowMouseMove = (event: MouseEvent) => {
      updateHeroMouseDrag(event.clientX);
    };

    const handleWindowMouseUp = (event: MouseEvent) => {
      finishHeroMouseDrag(event.clientX);
    };

    window.addEventListener("mousemove", handleWindowMouseMove);
    window.addEventListener("mouseup", handleWindowMouseUp);

    return () => {
      window.removeEventListener("mousemove", handleWindowMouseMove);
      window.removeEventListener("mouseup", handleWindowMouseUp);
    };
  }, [finishHeroMouseDrag, updateHeroMouseDrag]);

  const handleHeroMouseDown = (event: ReactMouseEvent<HTMLDivElement>) => {
    if (event.button !== 0) {
      return;
    }

    pauseHeroAutoplay();
    heroMouseStartX.current = event.clientX;
    isHeroMouseDraggingRef.current = true;
    setIsHeroMouseDragging(true);
    setHeroDragOffset(0);
  };

  const handleHeroClickCapture = (event: ReactMouseEvent<HTMLDivElement>) => {
    if (!suppressHeroClickRef.current) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();
    suppressHeroClickRef.current = false;
  };

  const handleHeroBlur = (event: FocusEvent<HTMLDivElement>) => {
    if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
      resumeHeroAutoplay();
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
                        className={`desktop-cat-tab group relative flex flex-1 items-center justify-between rounded-none border px-5 py-2 font-semibold transition-colors duration-150 ${
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
                    className="group flex items-center font-semibold text-browin-red transition-colors hover:text-browin-dark"
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
                        <h3 className="mb-5 border-b border-browin-dark/10 pb-3 text-[13px] font-semibold uppercase tracking-wider text-browin-dark">
                          {section.title}
                        </h3>
                        <ul className="space-y-4 text-[14px] font-semibold text-browin-dark/80">
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
                          <span className="mb-5 w-max rounded-none bg-browin-red px-3 py-1.5 text-[10px] font-semibold uppercase text-browin-white shadow-sharp">
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

                        <h4 className="mb-4 text-[26px] font-bold leading-tight text-browin-dark">
                          {activePromo.title}
                        </h4>
                        <p className="mb-10 text-sm leading-relaxed text-browin-dark/70">
                          {activePromo.description}
                        </p>
                        <Link
                          className="w-full border-2 border-browin-red px-8 py-3.5 text-center text-sm font-semibold uppercase tracking-wide !text-browin-red transition-colors hover:bg-transparent hover:!text-browin-red"
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
                        <span className="mb-5 w-max rounded-none bg-browin-red px-3 py-1.5 text-[10px] font-semibold uppercase text-browin-white shadow-sharp">
                          {activePromo.eyebrow}
                        </span>
                      ) : null}

                      <h4 className="mb-3 text-[22px] font-bold leading-tight text-browin-dark xl:text-[26px]">
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
                    className="group flex items-center space-x-2 whitespace-nowrap text-[11px] font-semibold uppercase tracking-wider text-browin-dark transition-colors hover:text-browin-red xl:text-[12px]"
                    href="/produkty?search=prezent"
                  >
                    <Gift className="text-browin-red transition-transform group-hover:scale-110" size={18} />
                    <span>Karty podarunkowe</span>
                  </Link>
                  <Link
                    className="group flex items-center space-x-2 whitespace-nowrap text-[11px] font-semibold uppercase tracking-wider text-browin-dark transition-colors hover:text-browin-red xl:text-[12px]"
                    href="/produkty?search=starter"
                  >
                    <Sliders className="text-browin-red transition-transform group-hover:rotate-90" size={18} />
                    <span>Konfigurator</span>
                  </Link>
                  <Link
                    className="group flex items-center space-x-2 whitespace-nowrap text-[11px] font-semibold uppercase tracking-wider text-browin-dark transition-colors hover:text-browin-red xl:text-[12px]"
                    href="/kalkulatory"
                  >
                    <Calculator className="text-browin-red transition-transform group-hover:scale-110" size={18} />
                    <span>Kalkulatory</span>
                  </Link>
                  <Link
                    className="group flex items-center space-x-2 whitespace-nowrap text-[11px] font-semibold uppercase tracking-wider text-browin-dark transition-colors hover:text-browin-red xl:text-[12px]"
                    href="/checkout"
                  >
                    <Handshake className="text-browin-red transition-transform group-hover:scale-110" size={18} />
                    <span>Usługi</span>
                  </Link>
                </div>

                <Link
                  className="utility-strip-highlight group -mr-6 flex h-full shrink-0 items-center space-x-2 bg-browin-red px-6 text-[11px] font-semibold uppercase tracking-wider text-browin-white transition-colors hover:bg-browin-red/90 xl:px-8 xl:text-[12px]"
                  href="/przepisnik"
                >
                  <RecipebookIcon className="transition-transform group-hover:scale-110" size={20} weight="fill" />
                  <span>Przepiśnik</span>
                </Link>
              </div>

              <div className="hero-banner-grid grid flex-1 min-h-0 grid-cols-1 gap-4 sm:grid-cols-2 md:gap-6 lg:grid-cols-3">
                <div
                  className="hero-slider-card relative flex h-[340px] flex-col overflow-visible rounded-none bg-transparent sm:h-auto lg:col-span-2"
                  onBlur={handleHeroBlur}
                  onFocus={pauseHeroAutoplay}
                  onMouseEnter={pauseHeroAutoplay}
                  onMouseLeave={resumeHeroAutoplay}
                  ref={heroSliderRef}
                >
                  <div
                    className={`hero-slider-viewport relative min-h-0 flex-1 overflow-hidden rounded-none border bg-browin-dark shadow-sm ${
                      isHeroMouseDragging ? "is-dragging" : ""
                    }`}
                    onClickCapture={handleHeroClickCapture}
                    onMouseDown={handleHeroMouseDown}
                  >
                    <div
                      className={`flex h-full w-full ${
                        isHeroMouseDragging ? "transition-none" : "transition-transform duration-500 ease-in-out"
                      }`}
                      id="hero-slider"
                      onTouchCancel={scheduleHeroTouchResume}
                      onTouchEnd={(event) => {
                        handleSwipeEnd(event.changedTouches[0].screenX);
                        scheduleHeroTouchResume();
                      }}
                      onTouchStart={(event) => {
                        pauseHeroAutoplay();
                        touchStartX.current = event.changedTouches[0].screenX;
                      }}
                      style={{ transform: `translateX(calc(-${currentSlide * 100}% + ${heroDragOffset}px))` }}
                    >
                      {heroSlides.map((slide, index) => (
                        <div className="relative h-full w-full shrink-0 cursor-pointer" key={slide.id}>
                          <Image
                            alt={slide.progressLabel}
                            className="absolute inset-0 h-full w-full object-cover opacity-60"
                            draggable={false}
                            fill
                            priority={index === 0}
                            sizes="(max-width: 1023px) 100vw, 66vw"
                            src={slide.image}
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-browin-dark/90 via-browin-dark/20 to-transparent" />

                          <div
                            className={`hero-slider-content absolute inset-0 flex flex-col justify-end p-5 pb-8 sm:p-6 md:p-8 md:pb-10 xl:p-10 xl:pb-12 ${
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
                                <span className="text-[11px] font-semibold tracking-wide text-browin-white">
                                  {slide.eyebrow}
                                </span>
                              </div>
                            ) : (
                              <span
                                className={`mb-4 w-max rounded-none px-3 py-1.5 text-[10px] font-semibold uppercase shadow-sharp ${
                                  slide.emphasis === "light"
                                    ? "bg-browin-red text-browin-white"
                                    : "border border-browin-white/20 bg-browin-dark/50 text-browin-white backdrop-blur-sm"
                                }`}
                              >
                                {slide.eyebrow}
                              </span>
                            )}

                            <h1 className="mb-4 max-w-[16rem] text-[1.95rem] font-bold leading-[1.08] text-browin-white drop-shadow-md sm:max-w-[18rem] sm:text-[2.35rem] md:max-w-[26rem] md:text-4xl xl:max-w-[30rem] xl:text-5xl">
                              {slide.title}
                            </h1>

                            <Link
                              className="hero-primary-cta inline-flex w-max items-center bg-browin-red px-5 py-3 text-[11px] font-bold uppercase tracking-wide text-browin-white shadow-sharp md:px-8 md:py-3.5 md:text-sm"
                              href={slide.href}
                            >
                              {slide.cta}
                              <ArrowRight className="ml-3" size={18} />
                            </Link>
                          </div>
                        </div>
                      ))}
                    </div>

                    <button
                      aria-label="Poprzedni slajd hero"
                      className="hero-slider-arrow hero-slider-arrow--previous absolute bottom-6 left-6 z-20 hidden h-11 w-11 items-center justify-center rounded-full border border-browin-white/20 bg-browin-white/92 text-browin-dark opacity-100 shadow-[0_8px_30px_rgb(0,0,0,0.12)] md:flex"
                      onClick={prevSlide}
                      type="button"
                    >
                      <CaretLeft size={18} />
                    </button>

                    <button
                      aria-label="Następny slajd hero"
                      className="hero-slider-arrow hero-slider-arrow--next absolute bottom-6 right-6 z-20 hidden h-11 w-11 items-center justify-center rounded-full border border-browin-white/20 bg-browin-white/92 text-browin-dark opacity-100 shadow-[0_8px_30px_rgb(0,0,0,0.12)] md:flex"
                      onClick={nextSlide}
                      type="button"
                    >
                      <CaretRight size={18} />
                    </button>
                  </div>

                  <div className="hero-progress-rail" aria-label="Wybór slajdu hero">
                    {heroSlides.map((slide, index) => (
                      <button
                        aria-label={`Pokaż slajd ${index + 1}: ${slide.progressLabel}`}
                        aria-pressed={index === currentSlide}
                        className={`hero-progress-segment ${index === currentSlide ? "is-active" : ""}`}
                        key={slide.id}
                        onClick={() => goToSlide(index)}
                        type="button"
                      >
                        <span
                          aria-hidden="true"
                          className="hero-progress-segment-fill"
                          style={{ transform: `scaleX(${index === currentSlide ? heroProgress : 0})` }}
                        />
                        <span className="sr-only">{slide.progressLabel}</span>
                      </button>
                    ))}
                  </div>
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
                          <span className="flex items-center text-[10px] font-semibold uppercase tracking-wider text-browin-red xl:text-[11px]">
                            <Fire className="mr-1" size={16} weight="fill" />
                            Hit Tygodnia
                          </span>
                          <h3 className="mt-1 max-w-[90%] text-base font-semibold leading-tight text-browin-dark transition-colors group-hover:text-browin-red xl:text-lg">
                            {weeklyHit.title}
                          </h3>
                        </div>
                      </div>

                      <div className="relative z-10 mt-auto flex items-end justify-between pt-2">
                        <div>
                          <p className="mb-0.5 text-xs font-semibold text-browin-dark/50 line-through">
                            {formatCurrency(
                              (getPrimaryVariant(weeklyHit).compareAtPrice ??
                                getPrimaryVariant(weeklyHit).price) + 12,
                            )}
                          </p>
                          <p className="text-2xl font-bold leading-none text-browin-dark xl:text-3xl">
                            {formatCurrency(getPrimaryVariant(weeklyHit).price)}
                          </p>
                        </div>
                        <button
                          className="group/addcart relative z-20 flex h-10 w-10 shrink-0 items-center justify-center border border-browin-red bg-browin-red px-0 text-browin-white transition-colors duration-200 hover:border-browin-dark hover:bg-browin-dark focus-visible:border-browin-dark focus-visible:bg-browin-dark md:w-auto md:min-w-[4.9rem] md:gap-1.5 md:px-2.5 xl:h-12 xl:min-w-[5.5rem] xl:gap-2 xl:px-3"
                          onClick={(event) => {
                            event.preventDefault();
                            event.stopPropagation();
                            addItem(weeklyHit.id, getPrimaryVariant(weeklyHit).id);
                          }}
                          type="button"
                        >
                          <ShoppingCart
                            className="shrink-0 transition-transform duration-200 group-hover/addcart:-rotate-3 group-hover/addcart:translate-x-0.5"
                            size={20}
                          />
                          <span className="hidden whitespace-nowrap text-[10px] font-semibold uppercase tracking-[0.12em] md:inline">
                            Dodaj
                          </span>
                        </button>
                      </div>
                      <CookingPot className="pointer-events-none absolute -right-2 top-8 text-browin-dark/5 transition-transform group-hover:-rotate-12" size={96} weight="fill" />
                    </div>
                  ) : (
                    <div className="flex h-full flex-col justify-between border border-browin-dark/10 bg-browin-white p-5 shadow-sm xl:p-6">
                      <div>
                        <span className="flex items-center text-[10px] font-semibold uppercase tracking-wider text-browin-red xl:text-[11px]">
                          <Fire className="mr-1" size={16} weight="fill" />
                          Feed aktywny
                        </span>
                        <h3 className="mt-1 text-base font-semibold leading-tight text-browin-dark xl:text-lg">
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
                        <span className="flex items-center text-[10px] font-semibold uppercase tracking-wider text-browin-red xl:text-[11px]">
                          <ClockCountdown className="mr-1" size={16} weight="fill" />
                          Oferta Dnia
                        </span>
                        <h3 className="mt-1 text-base font-semibold leading-tight text-browin-dark xl:text-lg">
                          {offerDay.title}
                        </h3>
                        <span className="mt-2 inline-block bg-browin-red px-2 py-0.5 text-[9px] font-semibold text-browin-white">
                          Sprawdź teraz
                        </span>
                      </div>

                      <Wine className="pointer-events-none absolute -right-4 top-8 text-browin-dark/5 transition-transform duration-500 group-hover:-rotate-12" size={96} weight="fill" />

                      <div className="relative z-10 mt-4">
                        <div className="mb-3 flex items-end gap-2">
                          <span className="text-2xl font-bold leading-none tracking-tight text-browin-red xl:text-3xl">
                            {formatCurrency(getPrimaryVariant(offerDay).price)}
                          </span>
                        </div>
                        <div className="mb-1.5 h-1.5 w-full rounded-none bg-browin-dark/10">
                          <div className="h-1.5 w-[85%] rounded-none bg-browin-red" />
                        </div>
                        <div className="flex items-center justify-between text-[9px] font-semibold uppercase text-browin-dark/60">
                          <span>Oferta specjalna</span>
                          <span className="text-browin-red">Zobacz produkt</span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="flex h-full flex-col justify-between border border-browin-dark/10 bg-browin-white p-5 shadow-sm xl:p-6">
                      <div>
                        <span className="flex items-center text-[10px] font-semibold uppercase tracking-wider text-browin-red xl:text-[11px]">
                          <ClockCountdown className="mr-1" size={16} weight="fill" />
                          Dane live
                        </span>
                        <h3 className="mt-1 text-base font-semibold leading-tight text-browin-dark xl:text-lg">
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
