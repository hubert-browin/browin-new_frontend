"use client";

import { ArrowSquareOut, CheckCircle, Compass, Heart } from "@phosphor-icons/react";
import Image from "next/image";
import type { ReactNode } from "react";

const valueItems = [
  {
    title: "Pasja",
    image: "https://browin.pl/static/base_images/wartosci_ikony/pasja.jpg",
    alt: "Pasja",
    text: "Wspieramy realizację marzeń i budowanie poczucia szczęścia, zarówno dzieląc się z innymi tym, co dobre i zdrowe, jak i zachęcając innych, by czynili podobnie. Chcemy, by nasza wspólna pasja, jaką jest tworzenie własnych, domowych wyrobów i dbanie o ogród, napawała Cię dumą i przynosiła satysfakcję, a entuzjazm do zmieniania rzeczywistości pozwalał Ci spełniać kolejne marzenia.",
  },
  {
    title: "Jakość",
    image: "https://browin.pl/static/base_images/wartosci_ikony/jakosc.jpg",
    alt: "Jakość",
    text: "Wyznacznik naszych działań, znajdujący odzwierciedlenie we wszystkich naszych firmowych działaniach. To nieustanne dążenie do tworzenia coraz doskonalszych i innowacyjnych produktów, do coraz lepszego zarządzania procesami i projektami, do wyznaczania wzorcowych standardów: w budowaniu oferty, w funkcjonowaniu organizacji, we współpracy z naszymi Klientami, Partnerami, Dostawcami.",
  },
  {
    title: "Partnerstwo",
    image: "https://browin.pl/static/base_images/wartosci_ikony/partnerstwo.jpg",
    alt: "Partnerstwo",
    text: "W centrum naszej uwagi zawsze stoi pojedynczy, konkretny człowiek, z całym bogactwem swojej osobowości, jakie wnosi do naszej organizacji. Na tym fundamencie budujemy nasze relacje zarówno wewnątrz organizacji, jak i w kontaktach z Klientami, Kontrahentami oraz otoczeniem. Okazujemy sobie wzajemnie szacunek, słuchamy siebie nawzajem, kierujemy się uczciwością i kulturą budowania długotrwałej, wzajemnie korzystnej współpracy.",
  },
  {
    title: "Rozwój",
    image: "https://browin.pl/static/base_images/wartosci_ikony/rozwoj.jpg",
    alt: "Rozwój",
    text: "Fundament, wokół którego koncentrują się nasze codzienne działania. Chcemy zdobywać wiedzę i doskonalić umiejętności, zwłaszcza poprzez wzajemne słuchanie się i uczenie od innych. Jesteśmy proaktywni, gotowi pokonywać własne ograniczenia i realizować nawet najbardziej odważne marzenia.",
  },
  {
    title: "Bezpieczeństwo",
    image: "https://browin.pl/static/base_images/wartosci_ikony/bezpieczenstwo.jpg",
    alt: "Bezpieczeństwo",
    text: "Ważne jest dla nas to, by każda Osoba w firmie mogła cieszyć się zdrowiem i by wykonując swoją pracę, miała zapewnione bezpieczeństwo. Ważna jest świadomość, że nasze działania dobrze służą środowisku naturalnemu i społeczności. Z troski o bezpieczeństwo wynika też dbałość o dobrą kondycję ekonomiczną.",
  },
  {
    title: "Zdrowie",
    image: "https://browin.pl/static/base_images/wartosci_ikony/zdrowie.jpg",
    alt: "Zdrowie",
    text: "Jest dla nas wyznacznikiem całościowego dobrostanu zarówno każdego człowieka i jego otoczenia, jak też środowiska naturalnego. Naszą dbałość o jak najlepsze zdrowie i kondycję wyrażamy poprzez rozwijanie rozwiązań stawiających na ekologię, recycling i produkty bio.",
  },
];

function SectionLabel({ children }: { children: ReactNode }) {
  return (
    <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-browin-red">
      {children}
    </p>
  );
}

export function MissionVisionPageContent() {
  return (
    <section className="grid gap-8">
      <div className="grid gap-5 lg:grid-cols-2">
        <section
          aria-labelledby="nasza-misja-heading"
          className="scroll-mt-36 border border-browin-dark/10 bg-browin-white p-6 shadow-[0_22px_76px_-62px_rgba(51,51,51,0.58)] lg:p-8"
          id="nasza-misja"
        >
          <div className="flex h-12 w-12 items-center justify-center bg-browin-red text-browin-white">
            <Heart size={24} weight="fill" />
          </div>
          <SectionLabel>Nasza misja</SectionLabel>
          <h2
            className="mt-3 text-2xl font-bold tracking-tight text-browin-dark lg:text-3xl"
            id="nasza-misja-heading"
          >
            Dzielimy się tym, co domowe i dobre
          </h2>
          <p className="mt-5 text-xl font-bold leading-snug text-browin-dark lg:text-2xl">
            Dzielimy się z Każdym naszą pasją, wiedzą i tradycją domowego przetwórstwa,
            aby żyć szczęśliwie i zdrowo.
          </p>
        </section>

        <section
          aria-labelledby="nasza-wizja-heading"
          className="scroll-mt-36 border border-browin-dark/10 bg-browin-dark p-6 text-browin-white shadow-[0_22px_76px_-62px_rgba(51,51,51,0.7)] lg:p-8"
          id="nasza-wizja"
        >
          <div className="flex h-12 w-12 items-center justify-center bg-browin-white text-browin-red">
            <Compass size={24} weight="fill" />
          </div>
          <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-browin-white/62">
            Nasza wizja
          </p>
          <h2
            className="mt-3 text-2xl font-bold tracking-tight text-browin-white lg:text-3xl"
            id="nasza-wizja-heading"
          >
            Innowacyjne rozwiązania dla domu i ogrodu
          </h2>
          <p className="mt-5 text-sm leading-relaxed text-browin-white/76 lg:text-[15px]">
            Z dumą tworzymy ekscytujące, innowacyjne i przemyślane rozwiązania, które
            każdemu ułatwiają zdrowe życie w zgodzie z naturą, przede wszystkim poprzez
            wspieranie pasji, jaką jest wyrób domowych specjałów.
          </p>
          <div className="mt-6 grid gap-2 text-sm font-semibold text-browin-white/88">
            {[
              "Słuchamy Klientów, Kontrahentów, Współpracowników i Ekspertów.",
              "Aktywnie reagujemy na zmieniające się trendy.",
              "Rozwijamy kompetencje R&D i możliwości produkcyjne.",
              "Zwiększamy efektywność i optymalizujemy procesy.",
            ].map((item) => (
              <div className="grid grid-cols-[auto_minmax(0,1fr)] gap-2" key={item}>
                <CheckCircle className="mt-0.5 text-browin-red" size={18} weight="fill" />
                <span>{item}</span>
              </div>
            ))}
          </div>
        </section>
      </div>

      <section
        aria-labelledby="nasze-wartosci-heading"
        className="scroll-mt-36"
        id="nasze-wartosci"
      >
        <div className="max-w-4xl border-l-4 border-browin-red bg-browin-white px-5 py-6 shadow-[0_20px_72px_-60px_rgba(51,51,51,0.55)] sm:px-6 lg:px-8">
          <SectionLabel>Nasze wartości</SectionLabel>
          <h2
            className="mt-3 text-2xl font-bold tracking-tight text-browin-dark lg:text-3xl"
            id="nasze-wartosci-heading"
          >
            Z rodzinnej tradycji do codziennego działania
          </h2>
          <p className="mt-4 text-sm leading-relaxed text-browin-dark/68 lg:text-base">
            Oto wartości wywodzące się z rodzinnych tradycji, które łączą wszystkich
            Pracowników w Zespół zdolny skutecznie osiągać cele organizacji, zapewniają
            wewnętrzną motywację do realizowania misji firmy oraz tworzą kapitał zaufania
            ze strony Klientów i Partnerów biznesowych.
          </p>
        </div>

        <div className="mt-7 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {valueItems.map((item, index) => (
            <article
              className="group min-h-full border border-browin-dark/10 bg-browin-white p-5 shadow-[0_18px_62px_-56px_rgba(51,51,51,0.42)] transition-colors hover:border-browin-red/45"
              key={item.title}
            >
              <div className="grid grid-cols-[4.5rem_minmax(0,1fr)] items-center gap-4">
                <div className="relative h-[4.5rem] w-[4.5rem] overflow-hidden border border-browin-dark/10 bg-browin-gray">
                  <Image
                    alt={item.alt}
                    className="object-contain p-2 mix-blend-multiply transition-transform duration-300 group-hover:scale-105"
                    fill
                    sizes="4.5rem"
                    src={item.image}
                  />
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-browin-dark/36">
                    {String(index + 1).padStart(2, "0")}
                  </p>
                  <h3 className="mt-1 text-xl font-bold tracking-tight text-browin-dark">
                    {item.title}
                  </h3>
                </div>
              </div>
              <p className="mt-4 text-sm leading-relaxed text-browin-dark/70">
                {item.text}
              </p>
            </article>
          ))}
        </div>
      </section>

      <div className="grid gap-4 border border-browin-dark/10 bg-browin-white p-6 shadow-[0_20px_72px_-60px_rgba(51,51,51,0.55)] md:grid-cols-[minmax(0,1fr)_auto] md:items-center lg:p-8">
        <div>
          <SectionLabel>Środowisko</SectionLabel>
          <h2 className="mt-2 text-xl font-bold tracking-tight text-browin-dark">
            Odpowiedzialność wpisana w rozwój
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-browin-dark/68">
            Dbałość o zdrowie i naturę wspieramy konkretnymi zasadami opisanymi w polityce
            środowiskowej BROWIN.
          </p>
        </div>
        <a
          className="inline-flex items-center justify-center gap-2 border border-browin-red bg-browin-red px-5 py-3 text-[12px] font-bold uppercase tracking-[0.16em] text-browin-white transition-colors hover:border-browin-dark hover:bg-browin-dark"
          href="https://browin.pl/static/download/polityka_srodowiskowa.pdf"
        >
          Polityka środowiskowa
          <ArrowSquareOut size={16} weight="bold" />
        </a>
      </div>

      <div className="border border-browin-red/20 bg-browin-red px-6 py-7 text-center text-browin-white shadow-[0_22px_76px_-62px_rgba(51,51,51,0.7)]">
        <p className="text-2xl font-bold tracking-tight lg:text-3xl">
          ...bo domowe jest lepsze!
        </p>
      </div>
    </section>
  );
}
