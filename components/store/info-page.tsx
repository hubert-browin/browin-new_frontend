"use client";

import {
  CaretRight,
  CheckCircle,
  EnvelopeSimple,
  PaperPlaneTilt,
  Phone,
  WarningCircle,
} from "@phosphor-icons/react";
import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";

import { FaqPageContent } from "@/components/store/faq-page";
import { MissionVisionPageContent } from "@/components/store/mission-vision-page";
import { OurBrowinPageContent } from "@/components/store/our-browin-page";
import { faqCategories } from "@/data/faq";
import type { InfoFormType, InfoPage, InfoTocItem } from "@/data/info-pages";
import { supportInfo } from "@/data/store";

type InfoPageViewProps = {
  page: InfoPage;
};

type InfoRequestFormProps = {
  type: InfoFormType;
};

const formatUpdatedAt = (iso: string) => {
  const [year, month, day] = iso.split("-");
  return `${day}.${month}.${year}`;
};

const normalizeTelHref = (phone: string) => `tel:${phone.replace(/[^\d+]/g, "")}`;

const inputClass =
  "w-full border border-browin-dark/12 bg-browin-white px-3 py-3 text-sm font-semibold text-browin-dark outline-none transition-colors placeholder:text-browin-dark/42 focus:border-browin-red";

function FieldLabel({
  children,
  htmlFor,
  required = false,
}: {
  children: React.ReactNode;
  htmlFor: string;
  required?: boolean;
}) {
  return (
    <label
      className="mb-2 block text-[10px] font-bold uppercase tracking-[0.15em] text-browin-dark/55"
      htmlFor={htmlFor}
    >
      {children}
      {required ? <span className="text-browin-red"> *</span> : null}
    </label>
  );
}

function FormShell({
  children,
  description,
  onSubmit,
  title,
}: {
  children: React.ReactNode;
  description: string;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
  title: string;
}) {
  return (
    <section
      aria-labelledby="formularz-heading"
      className="scroll-mt-48 border border-browin-dark/10 bg-browin-white p-5 shadow-[0_24px_80px_-62px_rgba(51,51,51,0.58)] sm:p-6 lg:p-10"
      id="formularz"
    >
      <div aria-hidden className="mb-6 h-1 w-20 bg-browin-red" />
      <div className="max-w-3xl">
        <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-browin-red">
          Formularz
        </p>
        <h2
          className="mt-2 text-2xl font-bold tracking-tight text-browin-dark"
          id="formularz-heading"
        >
          {title}
        </h2>
        <p className="mt-3 text-sm leading-relaxed text-browin-dark/66">
          {description}
        </p>
      </div>

      <form className="mt-6 grid gap-5" onSubmit={onSubmit}>
        {children}
      </form>
    </section>
  );
}

function ComplaintForm() {
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const email = String(formData.get("emailodbioru") ?? "").trim();
    const phone = String(formData.get("telefonodbioru") ?? "").trim();

    if (!email && !phone) {
      setSubmitted(false);
      setError("Podaj adres e-mail lub numer telefonu do kontaktu.");
      return;
    }

    setError("");
    setSubmitted(true);
    event.currentTarget.reset();
  };

  return (
    <FormShell
      description="Formularz odtwarza zakres pól ze starego serwisu, ale na tym etapie nie wysyła danych do systemu reklamacyjnego."
      onSubmit={handleSubmit}
      title="Dane zgłoszenia reklamacyjnego"
    >
      {submitted ? (
        <div className="flex items-start gap-3 border border-emerald-500/25 bg-emerald-50 px-4 py-3 text-sm font-semibold leading-relaxed text-emerald-900">
          <CheckCircle className="mt-0.5 shrink-0" size={20} weight="fill" />
          Twoja reklamacja została przygotowana w widoku nowego sklepu. Po podpięciu backendu ten formularz będzie można wysyłać do systemu BROWIN.
        </div>
      ) : null}
      {error ? (
        <div className="flex items-start gap-3 border border-browin-red/25 bg-browin-red/5 px-4 py-3 text-sm font-semibold leading-relaxed text-browin-red">
          <WarningCircle className="mt-0.5 shrink-0" size={20} weight="fill" />
          {error}
        </div>
      ) : null}

      <fieldset className="grid gap-3">
        <legend className="text-[10px] font-bold uppercase tracking-[0.16em] text-browin-dark">
          Miejsce zakupu
        </legend>
        <div className="grid gap-2 sm:grid-cols-2">
          {[
            ["WWW-B2C", "Sklep internetowy Browin"],
            ["SALON", "Salon firmowy Browin"],
            ["ALLEGRO", "Allegro: Browin_pl lub outlet_browin_pl"],
            ["OTHER", "Inny sklep poza Browin"],
          ].map(([value, label]) => (
            <label
              className="flex min-h-12 cursor-pointer items-center gap-3 border border-browin-dark/10 bg-browin-gray px-3 py-2 text-sm font-semibold text-browin-dark/72 transition-colors hover:border-browin-red hover:bg-browin-white"
              key={value}
            >
              <input
                className="h-4 w-4 accent-browin-red"
                defaultChecked={value === "WWW-B2C"}
                name="kanalsprzedazybrowin"
                type="radio"
                value={value}
              />
              {label}
            </label>
          ))}
        </div>
      </fieldset>

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <FieldLabel htmlFor="produktbezid" required>
            Nazwa reklamowanego produktu
          </FieldLabel>
          <input
            className={inputClass}
            id="produktbezid"
            minLength={3}
            name="produktbezid"
            placeholder="np. termometr, balon, szynkowar"
            required
            type="text"
          />
        </div>
        <div>
          <FieldLabel htmlFor="ilosczgloszona" required>
            Ilość reklamowanych sztuk
          </FieldLabel>
          <input
            className={inputClass}
            defaultValue={1}
            id="ilosczgloszona"
            min={1}
            name="ilosczgloszona"
            required
            type="number"
          />
        </div>
        <div>
          <FieldLabel htmlFor="datazakupu" required>
            Data zakupu produktu
          </FieldLabel>
          <input className={inputClass} id="datazakupu" name="datazakupu" required type="date" />
        </div>
        <div>
          <FieldLabel htmlFor="zadanieklienta" required>
            Oczekiwane rozwiązanie
          </FieldLabel>
          <select className={inputClass} id="zadanieklienta" name="zadanieklienta" required>
            <option value="NAP">Naprawa</option>
            <option value="WYM">Wymiana na nowy produkt</option>
            <option value="ZW">Zwrot pieniędzy</option>
          </select>
        </div>
      </div>

      <div>
        <FieldLabel htmlFor="opsiszgloszenia" required>
          Opis problemu
        </FieldLabel>
        <textarea
          className={inputClass}
          id="opsiszgloszenia"
          minLength={20}
          name="opiszgloszenia"
          placeholder="Opisz wadę, okoliczności jej wykrycia i najważniejsze informacje pomocne w rozpatrzeniu zgłoszenia."
          required
          rows={6}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <FieldLabel htmlFor="reklamujacy" required>
            Osoba reklamująca
          </FieldLabel>
          <input className={inputClass} id="reklamujacy" name="reklamujacy" required type="text" />
        </div>
        <div>
          <FieldLabel htmlFor="nazwaodbioru" required>
            Osoba lub firma do odbioru produktu
          </FieldLabel>
          <input className={inputClass} id="nazwaodbioru" name="nazwaodbioru" required type="text" />
        </div>
        <div className="md:col-span-2">
          <FieldLabel htmlFor="adresodbioru" required>
            Adres
          </FieldLabel>
          <input className={inputClass} id="adresodbioru" name="adresodbioru" required type="text" />
        </div>
        <div>
          <FieldLabel htmlFor="kodpocztowyodbioru" required>
            Kod pocztowy
          </FieldLabel>
          <input
            className={inputClass}
            id="kodpocztowyodbioru"
            name="kodpocztowyodbioru"
            required
            type="text"
          />
        </div>
        <div>
          <FieldLabel htmlFor="miastoodbioru" required>
            Miasto
          </FieldLabel>
          <input className={inputClass} id="miastoodbioru" name="miastoodbioru" required type="text" />
        </div>
        <div>
          <FieldLabel htmlFor="emailodbioru">E-mail</FieldLabel>
          <input className={inputClass} id="emailodbioru" name="emailodbioru" type="email" />
        </div>
        <div>
          <FieldLabel htmlFor="telefonodbioru">Telefon</FieldLabel>
          <input className={inputClass} id="telefonodbioru" name="telefonodbioru" type="tel" />
        </div>
      </div>

      <div className="grid gap-3 border border-dashed border-browin-dark/12 bg-browin-gray p-4">
        <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.16em] text-browin-dark/55">
          <PaperPlaneTilt className="text-browin-red" size={16} weight="fill" />
          Załączniki opcjonalne
        </div>
        <div className="grid gap-3 md:grid-cols-2">
          <input
            accept="image/jpeg,image/png,application/pdf"
            className={inputClass}
            name="dowodzakupu"
            type="file"
          />
          <input
            accept="image/jpeg,image/png,application/pdf"
            className={inputClass}
            multiple
            name="zdjeciaproduktu"
            type="file"
          />
        </div>
      </div>

      <button
        className="inline-flex w-full items-center justify-center gap-2 bg-browin-red px-5 py-3 text-sm font-bold uppercase tracking-[0.15em] text-browin-white transition-colors hover:bg-browin-dark sm:w-auto"
        type="submit"
      >
        Przygotuj zgłoszenie
        <CaretRight size={16} weight="bold" />
      </button>
    </FormShell>
  );
}

function BugReportForm() {
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitted(true);
    event.currentTarget.reset();
  };

  return (
    <FormShell
      description="Zakres pól odpowiada formularzowi ze starego serwisu. Formularz nie wysyła jeszcze danych do backendu."
      onSubmit={handleSubmit}
      title="Opisz błąd na stronie"
    >
      {submitted ? (
        <div className="flex items-start gap-3 border border-emerald-500/25 bg-emerald-50 px-4 py-3 text-sm font-semibold leading-relaxed text-emerald-900">
          <CheckCircle className="mt-0.5 shrink-0" size={20} weight="fill" />
          Dziękujemy, zgłoszenie zostało przygotowane w prototypie nowego sklepu.
        </div>
      ) : null}
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <FieldLabel htmlFor="name" required>
            Imię i nazwisko
          </FieldLabel>
          <input className={inputClass} id="name" minLength={5} name="name" required type="text" />
        </div>
        <div>
          <FieldLabel htmlFor="email" required>
            E-mail
          </FieldLabel>
          <input className={inputClass} id="email" name="email" required type="email" />
        </div>
      </div>
      <div>
        <FieldLabel htmlFor="description" required>
          Opis błędu
        </FieldLabel>
        <textarea
          className={inputClass}
          id="description"
          minLength={20}
          name="description"
          placeholder="Opisz, co nie działa, na jakiej stronie występuje problem i jak można go odtworzyć."
          required
          rows={7}
        />
      </div>
      <button
        className="inline-flex w-full items-center justify-center gap-2 bg-browin-red px-5 py-3 text-sm font-bold uppercase tracking-[0.15em] text-browin-white transition-colors hover:bg-browin-dark sm:w-auto"
        type="submit"
      >
        Wyślij zgłoszenie
        <CaretRight size={16} weight="bold" />
      </button>
    </FormShell>
  );
}

function InfoRequestForm({ type }: InfoRequestFormProps) {
  if (type === "complaint") {
    return <ComplaintForm />;
  }

  return <BugReportForm />;
}

export function InfoPageView({ page }: InfoPageViewProps) {
  const isFaqPage = page.slug === "porady-i-faq";
  const isMissionVisionPage = page.slug === "misja-wizja-wartosci";
  const isOurBrowinPage = page.slug === "nasz-browin";
  const tocItems = useMemo<InfoTocItem[]>(() => {
    if (isFaqPage || isMissionVisionPage || isOurBrowinPage) {
      return [];
    }

    const contentItems = page.toc.length ? page.toc : [];
    const formItems = page.form ? [{ id: "formularz", label: "Formularz" }] : [];

    return [...contentItems, ...formItems];
  }, [isFaqPage, isMissionVisionPage, isOurBrowinPage, page.form, page.toc]);
  const showPageNavigation = tocItems.length > 1;
  const heroFrameClass = isMissionVisionPage
    ? "relative mx-auto mt-8 aspect-[3/2] w-full max-w-3xl overflow-hidden border border-browin-dark/10 bg-browin-white shadow-[0_24px_80px_-64px_rgba(51,51,51,0.6)] lg:mt-9"
    : isOurBrowinPage
      ? "relative mx-auto mt-6 aspect-[16/7] w-full max-w-4xl overflow-hidden border border-browin-dark/10 bg-browin-gray shadow-[0_22px_74px_-62px_rgba(51,51,51,0.58)] lg:mt-7"
    : "relative mx-auto mt-8 aspect-[4/3] max-w-6xl overflow-hidden border border-browin-dark/10 bg-browin-gray shadow-[0_28px_90px_-70px_rgba(51,51,51,0.65)] sm:aspect-[16/7] lg:mt-10 lg:aspect-[16/5]";
  const heroImageClass = isMissionVisionPage ? "object-contain" : "object-cover";
  const heroSizes = isMissionVisionPage || isOurBrowinPage
    ? "(min-width: 1024px) 48rem, 100vw"
    : "(min-width: 1280px) 72rem, 100vw";
  const headerContainerClass = isOurBrowinPage
    ? "container mx-auto px-4 py-7 lg:py-9"
    : "container mx-auto px-4 py-10 lg:py-16";
  const headerTitleClass = isOurBrowinPage
    ? "mx-auto mt-3 max-w-4xl text-[2rem] font-bold leading-[1.05] tracking-tight text-browin-dark lg:text-[2.55rem]"
    : "mx-auto mt-4 max-w-4xl text-[2.15rem] font-bold leading-[1.05] tracking-tight text-browin-dark lg:text-[3rem]";
  const headerLeadClass = isOurBrowinPage
    ? "mx-auto mt-3 max-w-2xl text-sm leading-relaxed text-browin-dark/66 lg:text-base"
    : "mx-auto mt-4 max-w-3xl text-base leading-relaxed text-browin-dark/68 lg:text-lg";

  return (
    <div className="info-page bg-browin-gray">
      <nav
        aria-label="Ścieżka nawigacji"
        className="border-b border-browin-dark/10 bg-browin-white"
      >
        <ol className="container mx-auto flex flex-wrap items-center gap-x-2 gap-y-1 px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-browin-dark/55">
          <li>
            <Link className="transition-colors hover:text-browin-red" href="/">
              Strona główna
            </Link>
          </li>
          <li aria-hidden className="text-browin-dark/30">
            <CaretRight size={12} />
          </li>
          <li>
            <span className="text-browin-dark/45">{page.eyebrow}</span>
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
        <div className={headerContainerClass}>
          <div className="mx-auto max-w-4xl text-center">
            <div className="flex flex-wrap items-center justify-center gap-3">
              <span className="inline-block bg-browin-red px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-browin-white">
                {page.eyebrow}
              </span>
              <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-browin-dark/55">
                Aktualizacja: {formatUpdatedAt(page.updatedAt)}
              </span>
            </div>
            <h1 className={headerTitleClass}>{page.title}</h1>
            <p className={headerLeadClass}>{page.lead}</p>
          </div>

          {page.heroImage ? (
            <div className={heroFrameClass}>
              <Image
                alt=""
                className={heroImageClass}
                fill
                priority
                sizes={heroSizes}
                src={page.heroImage}
              />
            </div>
          ) : null}
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 lg:py-12">
        <div
          className={
            showPageNavigation
              ? "mx-auto grid max-w-7xl gap-8 xl:grid-cols-[minmax(15rem,17rem)_minmax(0,1fr)] xl:gap-10"
              : "mx-auto grid max-w-7xl gap-8"
          }
        >
          {showPageNavigation ? (
            <aside className="xl:sticky xl:top-36 xl:z-10 xl:max-h-[calc(100dvh-10rem)] xl:self-start xl:overflow-y-auto">
              <details
                className="group border border-browin-dark/10 bg-browin-white shadow-[0_18px_58px_-50px_rgba(51,51,51,0.48)] xl:open:border-browin-dark/10"
                open
              >
                <summary className="flex cursor-pointer list-none items-center justify-between gap-2 border-b border-transparent px-4 py-4 text-[10px] font-semibold uppercase tracking-[0.16em] text-browin-dark/55 xl:cursor-default xl:border-browin-dark/10">
                  Na tej stronie
                  <CaretRight
                    className="transition-transform duration-200 group-open:rotate-90 xl:hidden"
                    size={14}
                  />
                </summary>
                <nav aria-label="Spis treści">
                  <ol className="divide-y divide-browin-dark/5">
                    {tocItems.map((item, index) => (
                      <li key={item.id}>
                        <a
                          className="flex items-start gap-3 px-4 py-3.5 text-sm font-semibold text-browin-dark transition-colors hover:bg-browin-gray hover:text-browin-red"
                          href={`#${item.id}`}
                        >
                          <span className="min-w-[1.75rem] text-[11px] font-semibold uppercase tracking-[0.14em] text-browin-dark/35">
                            {String(index + 1).padStart(2, "0")}
                          </span>
                          <span className="leading-snug">{item.label}</span>
                        </a>
                      </li>
                    ))}
                  </ol>
                </nav>
              </details>
            </aside>
          ) : null}

          <article className={showPageNavigation ? "min-w-0" : "mx-auto w-full max-w-7xl min-w-0"}>
            <div className="grid gap-6 lg:gap-8">
              {isFaqPage ? <FaqPageContent categories={faqCategories} /> : null}
              {isMissionVisionPage ? <MissionVisionPageContent /> : null}
              {isOurBrowinPage ? <OurBrowinPageContent /> : null}

              {!isFaqPage && !isMissionVisionPage && !isOurBrowinPage && page.contentHtml ? (
                <section
                  className="info-rich-content scroll-mt-48 border border-browin-dark/10 bg-browin-white p-5 shadow-[0_24px_90px_-66px_rgba(51,51,51,0.62)] sm:p-6 lg:p-10 xl:p-12"
                  dangerouslySetInnerHTML={{ __html: page.contentHtml }}
                  id="tresc"
                />
              ) : null}

              {page.form ? <InfoRequestForm type={page.form} /> : null}
            </div>

            <aside className="mt-8 grid gap-4 border border-browin-dark/10 bg-browin-white p-6 shadow-[0_20px_72px_-60px_rgba(51,51,51,0.55)] sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center lg:p-8">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-browin-red">
                  Masz pytania?
                </p>
                <h3 className="mt-2 text-xl font-bold tracking-tight text-browin-dark">
                  Napisz lub zadzwoń do zespołu obsługi
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-browin-dark/68">
                  {supportInfo.hours}. Chętnie pomożemy znaleźć właściwą informację.
                </p>
                <div className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm font-semibold text-browin-dark">
                  <a
                    className="inline-flex items-center gap-2 transition-colors hover:text-browin-red"
                    href={normalizeTelHref(supportInfo.phone)}
                  >
                    <Phone size={18} weight="fill" />
                    {supportInfo.phone}
                  </a>
                  <a
                    className="inline-flex items-center gap-2 transition-colors hover:text-browin-red"
                    href={`mailto:${supportInfo.email}`}
                  >
                    <EnvelopeSimple size={18} weight="fill" />
                    {supportInfo.email}
                  </a>
                </div>
              </div>
              <Link
                className="inline-flex items-center justify-center gap-2 border border-browin-red bg-browin-red px-5 py-3 text-[12px] font-bold uppercase tracking-[0.16em] text-browin-white transition-colors hover:border-browin-dark hover:bg-browin-dark"
                href="/produkty"
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
