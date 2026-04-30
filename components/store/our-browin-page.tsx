"use client";

import {
  CheckCircle,
  Flask,
  Gift,
  Handshake,
  House,
  Sparkle,
  Users,
} from "@phosphor-icons/react";
import type { Icon } from "@phosphor-icons/react";
import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";

const salonHighlights = [
  "Eksponujemy nasz asortyment i doradzamy Klientom przy zakupie produktów.",
  "Prezentujemy nowości i hity naszych marek.",
  "Organizujemy kameralne pokazy i warsztaty prowadzone przez ekspertów.",
  "Tworzymy przestrzeń wzajemnych inspiracji, wymiany wiedzy i doświadczeń.",
];

const salonServices = [
  "Znajdziesz akcesoria niezbędne w domowej kuchni, w domu, ogrodzie czy na działce.",
  "Pomożemy Ci wybrać atrakcyjny prezent.",
  "Wypożyczysz sprzęt niezbędny do wyrobu domowych trunków lub większej ilości przetworów.",
];

const peopleQuotes = [
  {
    author: "Aleksandra",
    role: "Product Manager",
    quote:
      "Możliwość rozwoju zawodowego, samorealizacji i swobody wyrażania swoich opinii i pomysłów. W BROWINie nie pracujemy sztywnymi schematami - liczy się zaangażowanie i kreatywność.",
  },
  {
    author: "Agata",
    role: "Asystent ds. Zaopatrzenia",
    quote:
      "Firma stawia na młodych pracowników, daje im szanse na rozwój i zdobycie doświadczenia. Wspiera ich zarówno na początku, jak i na każdym kolejnym etapie.",
  },
  {
    author: "Mateusz",
    role: "Junior Key Account Manager",
    quote:
      "Dla mnie istotna była możliwość połączenia pracy ze studiami, weryfikowania teorii w praktyce i zgłębienia specyfiki współpracy z sieciami handlowymi.",
  },
  {
    author: "Bożena",
    role: "Kierownik ds. Marketingu",
    quote:
      "Praca w firmie BROWIN stanowi pole do nieustającego rozwoju i samodoskonalenia. Poprzeczka stawiana jest wysoko, a pracownikom zostawia się dużą samodzielność.",
  },
  {
    author: "Grzegorz",
    role: "Administrator Sieci Komputerowych",
    quote: "Atmosfera, która powoduje, że czujesz się, jakbyś nie wychodził z domu. Polecam.",
  },
];

const peopleSignals: { icon: Icon; label: string }[] = [
  { icon: Sparkle, label: "kreatywność" },
  { icon: Handshake, label: "współpraca" },
  { icon: Flask, label: "rozwój R&D" },
];

function SectionLabel({ children }: { children: ReactNode }) {
  return (
    <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-browin-red">
      {children}
    </p>
  );
}

function CheckList({ items }: { items: string[] }) {
  return (
    <ul className="mt-5 grid gap-3">
      {items.map((item) => (
        <li className="grid grid-cols-[auto_minmax(0,1fr)] gap-3 text-sm leading-relaxed text-browin-dark/72" key={item}>
          <CheckCircle className="mt-0.5 text-browin-red" size={18} weight="fill" />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

export function OurBrowinPageContent() {
  return (
    <section className="grid gap-8">
      <section className="grid gap-5 lg:grid-cols-[minmax(0,1.1fr)_minmax(18rem,0.7fr)]">
        <div className="border border-browin-dark/10 bg-browin-white p-6 shadow-[0_22px_76px_-62px_rgba(51,51,51,0.58)] lg:p-8">
          <SectionLabel>Kim jesteśmy</SectionLabel>
          <h2 className="mt-3 text-2xl font-bold tracking-tight text-browin-dark lg:text-3xl">
            Rodzinna firma z tradycją domowego przetwórstwa
          </h2>
          <div className="mt-5 grid gap-4 text-sm leading-relaxed text-browin-dark/72 lg:text-[15px]">
            <p>
              Firmy BROWIN nie trzeba przedstawiać nikomu, kto pasjonuje się domowym
              przetwórstwem, przygotowywaniem własnych win, wędlin, serów czy innych
              smakowitości, kto zajmuje się ogrodem, korzysta z termometrów lub stacji
              pogody.
            </p>
            <p>
              Od ponad 40 lat nasze produkty służą przede wszystkim miłośnikom pyszności
              z domowej kuchni, działkowcom i ogrodnikom, zdobywając uznanie coraz
              liczniejszej rzeszy odbiorców w Polsce i na rynkach europejskich.
            </p>
          </div>
        </div>

        <div className="grid border border-browin-dark/10 bg-browin-dark p-6 text-browin-white shadow-[0_22px_76px_-62px_rgba(51,51,51,0.7)] lg:p-8">
          <div className="grid gap-5">
            {[
              ["1979", "początek jako BIOWIN"],
              ["40+", "lat doświadczenia"],
              ["EU", "rozpoznawalność na rynkach europejskich"],
            ].map(([value, label]) => (
              <div className="border-t border-browin-white/14 pt-4" key={value}>
                <p className="text-4xl font-bold leading-none">{value}</p>
                <p className="mt-1 text-[10px] font-bold uppercase tracking-[0.14em] text-browin-white/58">
                  {label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border border-browin-dark/10 bg-browin-white p-6 shadow-[0_22px_76px_-62px_rgba(51,51,51,0.58)] lg:p-8">
        <div className="grid gap-6 lg:grid-cols-[minmax(0,0.86fr)_minmax(0,1.14fr)] lg:items-center">
          <div className="relative mx-auto flex min-h-[17rem] w-full max-w-xs items-center justify-center px-4 py-4">
            <Image
              alt="Szyszkokłos - symbol BROWINu"
              className="h-auto w-full max-w-[11.5rem] object-contain drop-shadow-[0_24px_34px_rgba(51,51,51,0.16)]"
              height={592}
              sizes="11.5rem"
              src="https://browin.pl/static/dist/img/szyszka_czerwona.png"
              width={436}
            />
          </div>

          <div>
            <SectionLabel>Symbol BROWINu</SectionLabel>
            <h2 className="mt-3 text-2xl font-bold tracking-tight text-browin-dark lg:text-3xl">
              Szyszkokłos Życia
            </h2>
            <p className="mt-4 text-lg font-bold leading-snug text-browin-dark">
              Symbol idei, która nas łączy, wyróżnia i inspiruje.
            </p>
            <p className="mt-4 text-sm leading-relaxed text-browin-dark/70 lg:text-[15px]">
              Jedyny w swoim rodzaju symbol połączenia siły i bogactwa natury z energią,
              rozwojem i kreatywnością ludzi. Symbol ziarna, które trzeba zasiać, by
              zebrać plony, pracy przynoszącej owoce, życia, któremu sami nadajemy
              ulubiony smak.
            </p>
          </div>
        </div>
      </section>

      <section className="grid gap-5 lg:grid-cols-2">
        <div className="border border-browin-dark/10 bg-browin-white p-6 shadow-[0_20px_72px_-60px_rgba(51,51,51,0.55)] lg:p-8">
          <div className="mb-5 flex h-12 w-12 items-center justify-center bg-browin-red text-browin-white">
            <House size={24} weight="fill" />
          </div>
          <SectionLabel>Salon firmowy</SectionLabel>
          <h2 className="mt-3 text-2xl font-bold tracking-tight text-browin-dark">
            Łódź, ul. Pryncypalna 129/141
          </h2>
          <CheckList items={salonHighlights} />
        </div>

        <div className="border border-browin-dark/10 bg-browin-white p-6 shadow-[0_20px_72px_-60px_rgba(51,51,51,0.55)] lg:p-8">
          <div className="mb-5 flex h-12 w-12 items-center justify-center bg-browin-red text-browin-white">
            <Gift size={24} weight="fill" />
          </div>
          <SectionLabel>Dla odwiedzających</SectionLabel>
          <h2 className="mt-3 text-2xl font-bold tracking-tight text-browin-dark">
            Przestrzeń dobrego smaku
          </h2>
          <CheckList items={salonServices} />
          <p className="mt-5 text-sm leading-relaxed text-browin-dark/70">
            Salon jest otwarty dla wszystkich miłośników dobrego smaku - zapraszamy
            zarówno stałych Bywalców, jak i nowych Gości.
          </p>
        </div>
      </section>

      <section className="border border-browin-dark/10 bg-browin-white p-6 shadow-[0_24px_90px_-66px_rgba(51,51,51,0.62)] lg:p-8">
        <div className="max-w-4xl">
          <div className="mb-5 flex h-12 w-12 items-center justify-center bg-browin-red text-browin-white">
            <Users size={24} weight="fill" />
          </div>
          <SectionLabel>Firma to przede wszystkim ludzie</SectionLabel>
          <h2 className="mt-3 text-2xl font-bold tracking-tight text-browin-dark lg:text-3xl">
            Energia, pomysły i wzajemna wymiana wiedzy
          </h2>
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-3">
          {peopleSignals.map(({ icon: Icon, label }) => (
            <div
              className="flex items-center gap-3 border border-browin-dark/10 bg-browin-gray px-4 py-3 text-sm font-bold text-browin-dark"
              key={label}
            >
              <Icon className="text-browin-red" size={20} weight="fill" />
              <span>{label}</span>
            </div>
          ))}
        </div>

        <p className="mt-6 text-sm leading-relaxed text-browin-dark/70 lg:text-[15px]">
          Jako BROWIN chcemy być postrzegani zarówno jako atrakcyjny partner biznesowy,
          jak też jako poszukiwany i ceniony pracodawca, z którym warto wiązać swoje
          zawodowe plany. Stawiamy na rozwój kompetencji, kreatywność i pracę w
          atmosferze wzajemnej wymiany wiedzy.
        </p>

        <div className="mt-7 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {peopleQuotes.map((item) => (
            <figure className="border-l-4 border-browin-red bg-browin-gray p-5" key={item.author}>
              <blockquote className="text-sm font-semibold leading-relaxed text-browin-dark/78">
                &ldquo;{item.quote}&rdquo;
              </blockquote>
              <figcaption className="mt-3 text-right text-xs font-bold uppercase tracking-[0.12em] text-browin-dark/48">
                {item.author}, {item.role}
              </figcaption>
            </figure>
          ))}
        </div>
      </section>

      <section className="grid gap-4 border border-browin-red/18 bg-[var(--browin-red)] p-6 text-browin-white shadow-[0_22px_76px_-62px_rgba(51,51,51,0.72)] md:grid-cols-[minmax(0,1fr)_auto] md:items-center lg:p-8">
        <div>
          <p className="text-2xl font-bold tracking-tight lg:text-3xl">
            BROWIN to dobre miejsce dla ludzi z energią i pomysłami.
          </p>
          <p className="mt-3 text-sm font-semibold leading-relaxed text-browin-white/76">
            Szczególnie dla osób, które chcą rozwijać sprzedaż, logistykę, technologię
            i nowe produkty w zespole R&D.
          </p>
        </div>
        <Link
          className="inline-flex items-center justify-center border border-browin-white bg-browin-white px-5 py-3 text-[12px] font-bold uppercase tracking-[0.16em] !text-browin-red transition-colors hover:border-browin-dark hover:bg-browin-dark hover:!text-browin-white"
          href="/praca"
        >
          Praca w BROWIN
        </Link>
      </section>
    </section>
  );
}
