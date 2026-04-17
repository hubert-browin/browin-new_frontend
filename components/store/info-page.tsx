"use client";

import { CaretRight, EnvelopeSimple, Phone } from "@phosphor-icons/react";
import Link from "next/link";

import type { InfoPage } from "@/data/info-pages";
import { supportInfo } from "@/data/store";

type InfoPageViewProps = {
  page: InfoPage;
};

const formatUpdatedAt = (iso: string) => {
  const [year, month, day] = iso.split("-");
  return `${day}.${month}.${year}`;
};

export function InfoPageView({ page }: InfoPageViewProps) {
  return (
    <div className="info-page bg-browin-gray">
      <nav
        aria-label="Ścieżka nawigacji"
        className="border-b border-browin-dark/10 bg-browin-white"
      >
        <ol className="container mx-auto flex flex-wrap items-center gap-x-2 gap-y-1 px-4 py-3 text-[11px] font-bold uppercase tracking-[0.14em] text-browin-dark/55">
          <li>
            <Link className="transition-colors hover:text-browin-red" href="/">
              Strona główna
            </Link>
          </li>
          <li aria-hidden className="text-browin-dark/30">
            <CaretRight size={12} />
          </li>
          <li>
            <span className="text-browin-dark/45">Informacje</span>
          </li>
          <li aria-hidden className="text-browin-dark/30">
            <CaretRight size={12} />
          </li>
          <li>
            <span className="text-browin-red">{page.title}</span>
          </li>
        </ol>
      </nav>

      <header className="border-b border-browin-dark/10 bg-browin-white">
        <div className="container mx-auto px-4 py-10 lg:py-14">
          <div className="flex flex-wrap items-center gap-3">
            <span className="inline-block bg-browin-red px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-browin-white">
              {page.eyebrow}
            </span>
            <span className="text-[11px] font-bold uppercase tracking-[0.16em] text-browin-dark/55">
              Aktualizacja: {formatUpdatedAt(page.updatedAt)}
            </span>
          </div>
          <h1 className="mt-4 max-w-3xl text-[2rem] font-extrabold leading-[1.08] tracking-tight text-browin-dark lg:text-[2.6rem]">
            {page.title}
          </h1>
          <p className="mt-4 max-w-3xl text-base leading-relaxed text-browin-dark/68 lg:text-lg">
            {page.lead}
          </p>
        </div>
      </header>

      <div className="container mx-auto px-4 py-10 lg:py-14">
        <div className="grid gap-10 xl:grid-cols-[260px_minmax(0,1fr)] xl:gap-12">
          <aside className="xl:sticky xl:top-24 xl:self-start">
            <details
              className="group border border-browin-dark/10 bg-browin-white xl:open:border-browin-dark/10"
              open
            >
              <summary className="flex cursor-pointer list-none items-center justify-between gap-2 border-b border-transparent px-4 py-3 text-[10px] font-bold uppercase tracking-[0.16em] text-browin-dark/55 xl:cursor-default xl:border-browin-dark/10">
                Spis treści
                <CaretRight
                  className="transition-transform duration-200 group-open:rotate-90 xl:hidden"
                  size={14}
                />
              </summary>
              <nav aria-label="Spis treści">
                <ol className="divide-y divide-browin-dark/5">
                  {page.sections.map((section, index) => (
                    <li key={section.id}>
                      <a
                        className="flex items-start gap-3 px-4 py-3 text-sm font-semibold text-browin-dark transition-colors hover:bg-browin-gray hover:text-browin-red"
                        href={`#${section.id}`}
                      >
                        <span className="min-w-[1.75rem] text-[11px] font-bold uppercase tracking-[0.14em] text-browin-dark/35">
                          {String(index + 1).padStart(2, "0")}
                        </span>
                        <span className="leading-snug">{section.heading}</span>
                      </a>
                    </li>
                  ))}
                </ol>
              </nav>
            </details>
          </aside>

          <article className="max-w-3xl">
            <div className="divide-y divide-browin-dark/10 border border-browin-dark/10 bg-browin-white">
              {page.sections.map((section) => (
                <section
                  aria-labelledby={`${section.id}-heading`}
                  className="scroll-mt-24 px-5 py-7 lg:px-8 lg:py-9"
                  id={section.id}
                  key={section.id}
                >
                  <h2
                    className="text-[1.35rem] font-extrabold tracking-tight text-browin-dark lg:text-[1.5rem]"
                    id={`${section.id}-heading`}
                  >
                    {section.heading}
                  </h2>
                  {section.paragraphs?.map((paragraph, index) => (
                    <p
                      className="mt-4 text-[15px] leading-relaxed text-browin-dark/78"
                      key={`${section.id}-p-${index}`}
                    >
                      {paragraph}
                    </p>
                  ))}
                  {section.list ? (
                    <ul className="mt-4 space-y-2">
                      {section.list.map((item, index) => (
                        <li
                          className="grid grid-cols-[auto_minmax(0,1fr)] items-start gap-3 text-[15px] leading-relaxed text-browin-dark/78"
                          key={`${section.id}-li-${index}`}
                        >
                          <span
                            aria-hidden
                            className="mt-2 inline-block h-1.5 w-1.5 shrink-0 bg-browin-red"
                          />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  ) : null}
                </section>
              ))}
            </div>

            <aside className="mt-8 grid gap-4 border border-browin-dark/10 bg-browin-white p-6 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center lg:p-8">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-browin-red">
                  Masz pytania?
                </p>
                <h3 className="mt-2 text-xl font-extrabold tracking-tight text-browin-dark">
                  Napisz lub zadzwoń do zespołu obsługi
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-browin-dark/68">
                  {supportInfo.hours}. Chętnie wyjaśnimy każdy punkt tego dokumentu.
                </p>
                <div className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm font-bold text-browin-dark">
                  <a className="inline-flex items-center gap-2 transition-colors hover:text-browin-red" href={`tel:${supportInfo.phone.replace(/\s+/g, "")}`}>
                    <Phone size={18} weight="fill" />
                    {supportInfo.phone}
                  </a>
                  <a className="inline-flex items-center gap-2 transition-colors hover:text-browin-red" href={`mailto:${supportInfo.email}`}>
                    <EnvelopeSimple size={18} weight="fill" />
                    {supportInfo.email}
                  </a>
                </div>
              </div>
              <Link
                className="inline-flex items-center justify-center gap-2 border border-browin-red bg-browin-red px-5 py-3 text-[12px] font-bold uppercase tracking-[0.16em] text-browin-white transition-colors hover:bg-browin-dark hover:border-browin-dark"
                href="/koszyk"
              >
                Wróć do zakupów
                <CaretRight size={14} weight="bold" />
              </Link>
            </aside>
          </article>
        </div>
      </div>
    </div>
  );
}
