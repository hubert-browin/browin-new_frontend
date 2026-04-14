import Link from "next/link";

export default function NotFound() {
  return (
    <section className="bg-browin-gray py-12 md:py-16">
      <div className="container mx-auto px-4">
        <div className="border border-browin-dark/10 bg-browin-white px-6 py-12 text-center shadow-sm md:px-10">
          <p className="text-sm font-bold uppercase tracking-[0.16em] text-browin-red">404</p>
          <h1 className="mt-3 text-3xl font-extrabold uppercase tracking-tight text-browin-dark md:text-4xl">
            Nie znaleziono strony
          </h1>
          <p className="mt-4 text-sm leading-relaxed text-browin-dark/68 md:text-base">
            Wygląda na to, że link nie istnieje albo produkt został usunięty z mock katalogu.
          </p>
          <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
            <Link
              className="bg-browin-dark px-5 py-3 text-sm font-bold uppercase tracking-[0.16em] text-browin-white transition-colors hover:bg-browin-red"
              href="/"
            >
              Wróć na stronę główną
            </Link>
            <Link
              className="border border-browin-dark/10 px-5 py-3 text-sm font-bold uppercase tracking-[0.16em] text-browin-dark transition-colors hover:border-browin-red hover:text-browin-red"
              href="/produkty"
            >
              Otwórz katalog
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
