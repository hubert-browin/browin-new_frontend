"use client";

import { useEffect } from "react";

type ExactStorefrontProps = {
  markup: string;
  styles: string;
};

type LandingWindow = Window &
  typeof globalThis & {
    megaMenuTimeout?: ReturnType<typeof setTimeout>;
    intentTimeout?: ReturnType<typeof setTimeout>;
    currentSlide?: number;
    totalSlides?: number;
    touchStartX?: number;
    touchEndX?: number;
    showDesktopSubmenu?: (catId: string) => void;
    hideDesktopMegaMenu?: () => void;
    cancelHideDesktopMegaMenu?: () => void;
    toggleMobileMenu?: () => void;
    toggleAccordion?: (id: string, btn?: HTMLElement | null) => void;
    toggleMobileLang?: () => void;
    toggleCartDrawer?: (event?: Event) => void;
    updateSlider?: () => void;
    nextSlide?: (event?: Event) => void;
    prevSlide?: (event?: Event) => void;
    goToSlide?: (index: number, event?: Event) => void;
    handleSwipe?: () => void;
  };

export function ExactStorefront({ markup, styles }: ExactStorefrontProps) {
  useEffect(() => {
    const win = window as LandingWindow;

    win.currentSlide = 0;
    win.totalSlides = 3;
    win.touchStartX = 0;
    win.touchEndX = 0;

    const showDesktopSubmenu = (catId: string) => {
      clearTimeout(win.megaMenuTimeout);
      clearTimeout(win.intentTimeout);

      win.intentTimeout = setTimeout(() => {
        const panel = document.getElementById("desktop-mega-panel");
        if (!panel) {
          return;
        }

        panel.classList.remove("hidden");
        panel.classList.add("flex");

        setTimeout(() => {
          panel.classList.remove("opacity-0");
          panel.classList.add("opacity-100");
        }, 10);

        document
          .querySelectorAll<HTMLElement>(".desktop-submenu")
          .forEach((element) => {
            element.classList.add("hidden");
          });

        document
          .querySelectorAll<HTMLElement>(".desktop-cat-tab")
          .forEach((element) => {
            element.classList.remove(
              "bg-browin-white",
              "text-browin-red",
              "z-40",
              "w-[calc(100%+2px)]",
              "border-browin-dark/10",
              "border-r-transparent",
              "-mr-[1px]",
              "border-y",
              "border-l",
            );
            element.classList.add(
              "text-browin-dark",
              "hover:bg-browin-dark/5",
              "w-full",
              "border-transparent",
            );

            const arrow = element.querySelector<HTMLElement>(".tab-arrow");
            if (arrow) {
              arrow.classList.remove("opacity-0");
              arrow.classList.add("opacity-40");
            }
          });

        const content = document.getElementById(`content-${catId}`);
        if (content) {
          content.classList.remove("hidden");
        }

        const tab = document.getElementById(`tab-${catId}`);
        if (tab) {
          tab.classList.remove(
            "text-browin-dark",
            "hover:bg-browin-dark/5",
            "w-full",
            "border-transparent",
          );
          tab.classList.add(
            "bg-browin-white",
            "text-browin-red",
            "z-40",
            "w-[calc(100%+2px)]",
            "-mr-[1px]",
            "border-y",
            "border-l",
            "border-browin-dark/10",
            "border-r-transparent",
          );

          const arrow = tab.querySelector<HTMLElement>(".tab-arrow");
          if (arrow) {
            arrow.classList.remove("opacity-40");
            arrow.classList.add("opacity-0");
          }
        }
      }, 150);
    };

    const hideDesktopMegaMenu = () => {
      clearTimeout(win.intentTimeout);

      win.megaMenuTimeout = setTimeout(() => {
        const panel = document.getElementById("desktop-mega-panel");
        if (!panel) {
          return;
        }

        panel.classList.remove("opacity-100");
        panel.classList.add("opacity-0");

        setTimeout(() => {
          panel.classList.add("hidden");
          panel.classList.remove("flex");
        }, 150);

        document
          .querySelectorAll<HTMLElement>(".desktop-cat-tab")
          .forEach((element) => {
            element.classList.remove(
              "bg-browin-white",
              "text-browin-red",
              "z-40",
              "w-[calc(100%+2px)]",
              "border-browin-dark/10",
              "border-r-transparent",
              "border-y",
              "border-l",
              "-mr-[1px]",
            );
            element.classList.add(
              "text-browin-dark",
              "hover:bg-browin-dark/5",
              "w-full",
              "border-transparent",
            );

            const arrow = element.querySelector<HTMLElement>(".tab-arrow");
            if (arrow) {
              arrow.classList.remove("opacity-0");
              arrow.classList.add("opacity-40");
            }
          });
      }, 150);
    };

    const cancelHideDesktopMegaMenu = () => {
      clearTimeout(win.megaMenuTimeout);
    };

    const toggleMobileMenu = () => {
      const menu = document.getElementById("mobile-mega-menu");
      if (!menu) {
        return;
      }

      if (menu.classList.contains("-translate-x-full")) {
        menu.classList.remove("-translate-x-full");
        document.body.style.overflow = "hidden";
      } else {
        menu.classList.add("-translate-x-full");
        document.body.style.overflow = "";
      }
    };

    const toggleAccordion = (id: string, btn?: HTMLElement | null) => {
      const accordion = document.getElementById(id);
      const chevron = btn?.querySelector<HTMLElement>(".chevron");

      document
        .querySelectorAll<HTMLElement>(".mobile-accordion-content")
        .forEach((element) => {
          if (element.id !== id) {
            element.classList.add("hidden");
            const siblingChevron =
              element.previousElementSibling?.querySelector<HTMLElement>(
                ".chevron",
              );
            siblingChevron?.classList.remove("rotate-180");
          }
        });

      if (!accordion) {
        return;
      }

      if (accordion.classList.contains("hidden")) {
        accordion.classList.remove("hidden");
        chevron?.classList.add("rotate-180");
      } else {
        accordion.classList.add("hidden");
        chevron?.classList.remove("rotate-180");
      }
    };

    const toggleMobileLang = () => {
      const langMenu = document.getElementById("mobile-lang-menu");
      if (!langMenu) {
        return;
      }

      if (langMenu.classList.contains("hidden")) {
        langMenu.classList.remove("hidden");
        langMenu.classList.add("flex");
      } else {
        langMenu.classList.add("hidden");
        langMenu.classList.remove("flex");
      }
    };

    const toggleCartDrawer = (event?: Event) => {
      event?.preventDefault();

      const drawer = document.getElementById("cart-drawer");
      const overlay = document.getElementById("cart-drawer-overlay");
      if (!drawer || !overlay) {
        return;
      }

      if (drawer.classList.contains("translate-x-full")) {
        drawer.classList.remove("translate-x-full");
        overlay.classList.remove("hidden");
        setTimeout(() => {
          overlay.classList.remove("opacity-0");
        }, 10);
        document.body.style.overflow = "hidden";
      } else {
        drawer.classList.add("translate-x-full");
        overlay.classList.add("opacity-0");
        setTimeout(() => {
          overlay.classList.add("hidden");
        }, 300);
        document.body.style.overflow = "";
      }
    };

    const updateSlider = () => {
      const slider = document.getElementById("hero-slider");
      if (!slider) {
        return;
      }

      slider.style.transform = `translateX(-${(win.currentSlide ?? 0) * 100}%)`;

      document
        .querySelectorAll<HTMLElement>(".slider-dot")
        .forEach((dot, index) => {
          if (index === (win.currentSlide ?? 0)) {
            dot.classList.remove("bg-browin-white/50", "w-2");
            dot.classList.add("bg-browin-red", "w-4");
          } else {
            dot.classList.add("bg-browin-white/50", "w-2");
            dot.classList.remove("bg-browin-red", "w-4");
          }
        });
    };

    const nextSlide = (event?: Event) => {
      event?.stopPropagation();
      win.currentSlide = ((win.currentSlide ?? 0) + 1) % (win.totalSlides ?? 3);
      updateSlider();
    };

    const prevSlide = (event?: Event) => {
      event?.stopPropagation();
      win.currentSlide =
        ((win.currentSlide ?? 0) - 1 + (win.totalSlides ?? 3)) %
        (win.totalSlides ?? 3);
      updateSlider();
    };

    const goToSlide = (index: number, event?: Event) => {
      event?.stopPropagation();
      win.currentSlide = index;
      updateSlider();
    };

    const handleSwipe = () => {
      const swipeThreshold = 50;

      if ((win.touchEndX ?? 0) < (win.touchStartX ?? 0) - swipeThreshold) {
        nextSlide();
      }

      if ((win.touchEndX ?? 0) > (win.touchStartX ?? 0) + swipeThreshold) {
        prevSlide();
      }
    };

    win.showDesktopSubmenu = showDesktopSubmenu;
    win.hideDesktopMegaMenu = hideDesktopMegaMenu;
    win.cancelHideDesktopMegaMenu = cancelHideDesktopMegaMenu;
    win.toggleMobileMenu = toggleMobileMenu;
    win.toggleAccordion = toggleAccordion;
    win.toggleMobileLang = toggleMobileLang;
    win.toggleCartDrawer = toggleCartDrawer;
    win.updateSlider = updateSlider;
    win.nextSlide = nextSlide;
    win.prevSlide = prevSlide;
    win.goToSlide = goToSlide;
    win.handleSwipe = handleSwipe;

    updateSlider();

    const sliderContainer = document.getElementById("hero-slider");
    const sliderParent = sliderContainer?.parentElement;

    const onTouchStart = (touchEvent: TouchEvent) => {
      win.touchStartX = touchEvent.changedTouches[0]?.screenX ?? 0;
    };

    const onTouchEnd = (touchEvent: TouchEvent) => {
      win.touchEndX = touchEvent.changedTouches[0]?.screenX ?? 0;
      handleSwipe();
    };

    sliderParent?.addEventListener("touchstart", onTouchStart, {
      passive: true,
    });
    sliderParent?.addEventListener("touchend", onTouchEnd, {
      passive: true,
    });

    return () => {
      clearTimeout(win.megaMenuTimeout);
      clearTimeout(win.intentTimeout);
      sliderParent?.removeEventListener("touchstart", onTouchStart);
      sliderParent?.removeEventListener("touchend", onTouchEnd);
      document.body.style.overflow = "";

      win.showDesktopSubmenu = undefined;
      win.hideDesktopMegaMenu = undefined;
      win.cancelHideDesktopMegaMenu = undefined;
      win.toggleMobileMenu = undefined;
      win.toggleAccordion = undefined;
      win.toggleMobileLang = undefined;
      win.toggleCartDrawer = undefined;
      win.updateSlider = undefined;
      win.nextSlide = undefined;
      win.prevSlide = undefined;
      win.goToSlide = undefined;
      win.handleSwipe = undefined;
    };
  }, [markup]);

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: styles }} />
      <div dangerouslySetInnerHTML={{ __html: markup }} />
    </>
  );
}
