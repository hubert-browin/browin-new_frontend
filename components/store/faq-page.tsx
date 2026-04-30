"use client";

import {
  CaretDown,
  MagnifyingGlass,
  Question,
  SquaresFour,
} from "@phosphor-icons/react";
import { useMemo, useState } from "react";

import type { FaqCategory, FaqQuestion } from "@/data/faq";

type FaqPageContentProps = {
  categories: FaqCategory[];
};

type VisibleFaqCategory = FaqCategory & {
  questions: FaqQuestion[];
};

const normalizeText = (value: string) =>
  value
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "");

const countQuestions = (categories: FaqCategory[]) =>
  categories.reduce((total, category) => total + category.questions.length, 0);

export function FaqPageContent({ categories }: FaqPageContentProps) {
  const [activeCategoryId, setActiveCategoryId] = useState("all");
  const [query, setQuery] = useState("");
  const normalizedQuery = normalizeText(query.trim());
  const totalQuestions = countQuestions(categories);

  const visibleCategories = useMemo<VisibleFaqCategory[]>(() => {
    const scopedCategories =
      activeCategoryId === "all"
        ? categories
        : categories.filter((category) => category.id === activeCategoryId);

    return scopedCategories
      .map((category) => {
        const questions = normalizedQuery
          ? category.questions.filter((item) =>
              normalizeText(`${item.question} ${item.answerText}`).includes(normalizedQuery),
            )
          : category.questions;

        return {
          ...category,
          questions,
        };
      })
      .filter((category) => category.questions.length > 0);
  }, [activeCategoryId, categories, normalizedQuery]);

  const visibleQuestionCount = countQuestions(visibleCategories);

  return (
    <section className="grid gap-6">
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_18rem]">
        <div className="border border-browin-dark/10 bg-browin-white p-5 lg:p-6">
          <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.16em] text-browin-red">
            <Question size={17} weight="fill" />
            Centrum odpowiedzi
          </div>
          <h2 className="mt-3 text-2xl font-bold tracking-tight text-browin-dark lg:text-3xl">
            Najczęściej zadawane pytania
          </h2>
          <p className="mt-3 max-w-3xl text-sm leading-relaxed text-browin-dark/66">
            Odpowiedzi zostały uporządkowane w tematyczne działy, dzięki czemu łatwiej
            znaleźć konkretną poradę bez przewijania długiego dokumentu.
          </p>

          <label
            className="mt-5 grid min-h-12 grid-cols-[auto_minmax(0,1fr)] items-center gap-3 border border-browin-dark/12 bg-browin-gray px-4 transition-colors focus-within:border-browin-red focus-within:bg-browin-white"
            htmlFor="faq-search"
          >
            <MagnifyingGlass className="text-browin-red" size={20} weight="bold" />
            <input
              className="h-12 min-w-0 bg-transparent text-sm font-semibold text-browin-dark outline-none placeholder:text-browin-dark/42"
              id="faq-search"
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Szukaj pytania lub odpowiedzi"
              type="search"
              value={query}
            />
          </label>
        </div>

        <div className="grid border border-browin-dark/10 bg-browin-dark p-5 text-browin-white">
          <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.16em] text-browin-white/62">
            <SquaresFour size={17} weight="fill" />
            FAQ
          </div>
          <div className="mt-5 grid grid-cols-2 gap-4 lg:grid-cols-1">
            <div>
              <p className="text-4xl font-bold leading-none">{totalQuestions}</p>
              <p className="mt-1 text-[10px] font-bold uppercase tracking-[0.14em] text-browin-white/58">
                pytań
              </p>
            </div>
            <div>
              <p className="text-4xl font-bold leading-none">{categories.length}</p>
              <p className="mt-1 text-[10px] font-bold uppercase tracking-[0.14em] text-browin-white/58">
                działy
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          className={`border px-4 py-2 text-xs font-bold uppercase tracking-[0.12em] transition-colors ${
            activeCategoryId === "all"
              ? "border-browin-red bg-browin-red text-browin-white"
              : "border-browin-dark/10 bg-browin-white text-browin-dark/62 hover:border-browin-red hover:text-browin-red"
          }`}
          onClick={() => setActiveCategoryId("all")}
          type="button"
        >
          Wszystkie ({totalQuestions})
        </button>
        {categories.map((category) => (
          <button
            className={`border px-4 py-2 text-xs font-bold uppercase tracking-[0.12em] transition-colors ${
              activeCategoryId === category.id
                ? "border-browin-red bg-browin-red text-browin-white"
                : "border-browin-dark/10 bg-browin-white text-browin-dark/62 hover:border-browin-red hover:text-browin-red"
            }`}
            key={category.id}
            onClick={() => setActiveCategoryId(category.id)}
            type="button"
          >
            {category.title} ({category.questions.length})
          </button>
        ))}
      </div>

      <div className="grid gap-5">
        <p className="text-xs font-bold uppercase tracking-[0.14em] text-browin-dark/45">
          Wyniki: {visibleQuestionCount}
        </p>

        {visibleCategories.length ? (
          visibleCategories.map((category) => (
            <section
              aria-labelledby={`${category.id}-heading`}
              className="border border-browin-dark/10 bg-browin-white"
              id={category.id}
              key={category.id}
            >
              <div className="border-b border-browin-dark/10 px-5 py-4 lg:px-6">
                <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-browin-red">
                  {category.questions.length} odpowiedzi
                </p>
                <h3
                  className="mt-1 text-xl font-bold tracking-tight text-browin-dark"
                  id={`${category.id}-heading`}
                >
                  {category.title}
                </h3>
              </div>

              <div className="divide-y divide-browin-dark/10">
                {category.questions.map((item, questionIndex) => (
                  <details
                    className="group"
                    key={item.id}
                    open={!normalizedQuery && questionIndex === 0}
                  >
                    <summary className="grid cursor-pointer list-none grid-cols-[minmax(0,1fr)_auto] items-center gap-4 px-5 py-4 text-left transition-colors hover:bg-browin-gray lg:px-6">
                      <span className="text-base font-bold leading-snug text-browin-dark">
                        {item.question}
                      </span>
                      <span className="flex h-8 w-8 items-center justify-center border border-browin-dark/10 text-browin-red transition-transform group-open:rotate-180">
                        <CaretDown size={16} weight="bold" />
                      </span>
                    </summary>
                    <div
                      className="faq-answer border-t border-browin-dark/5 px-5 pb-5 pt-1 text-sm leading-relaxed text-browin-dark/72 lg:px-6 lg:pb-6"
                      dangerouslySetInnerHTML={{ __html: item.answerHtml }}
                    />
                  </details>
                ))}
              </div>
            </section>
          ))
        ) : (
          <div className="border border-dashed border-browin-dark/16 bg-browin-white px-5 py-10 text-center">
            <p className="text-lg font-bold text-browin-dark">Brak wyników</p>
            <p className="mt-2 text-sm font-semibold leading-relaxed text-browin-dark/58">
              Zmień frazę lub wybierz inną kategorię.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
