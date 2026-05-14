"use client";

import {
  ArrowRight,
  Check,
  EnvelopeSimple,
  GoogleLogo,
  Heart,
  LockKey,
  MapPinLine,
  Package,
  ShieldCheck,
  SignOut,
  User,
  UserPlus,
  X,
} from "@phosphor-icons/react";
import type { Icon } from "@phosphor-icons/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { FormEvent, InputHTMLAttributes, ReactNode } from "react";
import { useEffect, useMemo, useState, useSyncExternalStore } from "react";

import {
  clearCustomerSession,
  getCustomerSessionServerSnapshot,
  getCustomerSessionSnapshot,
  parseCustomerSessionSnapshot,
  readCustomerSession,
  subscribeCustomerSession,
  writeCustomerSession,
  type CustomerSession,
} from "@/lib/customer-session";

type AuthMode = "login" | "register";

type CustomerFieldProps = InputHTMLAttributes<HTMLInputElement> & {
  icon: Icon;
  label: string;
};

type CustomerAuthFormProps = {
  layout?: "modal" | "page";
  onSuccess?: () => void;
  titleId?: string;
};

type AccountSummaryItem = {
  icon: Icon;
  label: string;
  value: string;
};

const classNames = (...classes: Array<string | false | null | undefined>) =>
  classes.filter(Boolean).join(" ");

const inputClass =
  "h-12 w-full border border-browin-dark/12 bg-browin-white py-3 pl-11 pr-3 text-sm font-bold text-browin-dark outline-none transition-colors placeholder:text-browin-dark/38 focus:border-browin-red focus:ring-2 focus:ring-browin-red/12";

const getNameFromEmail = (email: string) => {
  const [localPart] = email.split("@");
  const cleanName = localPart
    ?.replace(/[._-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  return cleanName ? cleanName : "Klient BROWIN";
};

const formatSessionDate = (isoDate: string) => {
  try {
    return new Intl.DateTimeFormat("pl-PL", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }).format(new Date(isoDate));
  } catch {
    return "dzisiaj";
  }
};

function CustomerField({ icon: IconComponent, label, ...props }: CustomerFieldProps) {
  return (
    <div>
      <label
        className="mb-2 block text-[10px] font-bold uppercase tracking-[0.14em] text-browin-dark/55"
        htmlFor={props.id}
      >
        {label}
      </label>
      <div className="relative">
        <IconComponent
          className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-browin-dark/38"
          size={18}
        />
        <input className={inputClass} {...props} />
      </div>
    </div>
  );
}

function SectionShell({
  children,
  eyebrow,
  titleId,
  title,
}: {
  children: ReactNode;
  eyebrow: string;
  titleId?: string;
  title: string;
}) {
  return (
    <section className="border border-browin-dark/10 bg-browin-white p-4 shadow-[0_24px_80px_-64px_rgba(51,51,51,0.56)] sm:p-6 lg:p-8">
      <div aria-hidden className="mb-5 h-1 w-16 bg-browin-red" />
      <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-browin-red">
        {eyebrow}
      </p>
      <h1 className="mt-2 text-2xl font-bold tracking-tight text-browin-dark sm:text-3xl">
        <span id={titleId}>{title}</span>
      </h1>
      {children}
    </section>
  );
}

function ModeButton({
  active,
  children,
  onClick,
}: {
  active: boolean;
  children: ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      aria-pressed={active}
      className={classNames(
        "min-h-12 w-full px-3 text-xs font-bold uppercase tracking-[0.13em] transition-colors",
        active
          ? "bg-browin-red text-browin-white"
          : "bg-browin-dark/8 text-browin-dark/68 hover:bg-browin-dark/12 hover:text-browin-red",
      )}
      onClick={onClick}
      type="button"
    >
      {children}
    </button>
  );
}

function CustomerAuthForm({
  layout = "page",
  onSuccess,
  titleId,
}: CustomerAuthFormProps) {
  const router = useRouter();
  const [mode, setMode] = useState<AuthMode>("login");
  const isModalLayout = layout === "modal";

  useEffect(() => {
    if (!isModalLayout && readCustomerSession()) {
      router.replace("/konto");
    }
  }, [isModalLayout, router]);

  const createSession = (session: CustomerSession) => {
    writeCustomerSession(session);
    onSuccess?.();
    router.push("/konto");
  };

  const handleLoginSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const email = String(formData.get("email") ?? "").trim();

    createSession({
      createdAt: new Date().toISOString(),
      email,
      name: getNameFromEmail(email),
      provider: "form",
    });
  };

  const handleRegisterSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const email = String(formData.get("email") ?? "").trim();
    const name = String(formData.get("name") ?? "").trim() || getNameFromEmail(email);

    createSession({
      createdAt: new Date().toISOString(),
      email,
      name,
      provider: "form",
    });
  };

  const handleGoogleLogin = () => {
    createSession({
      createdAt: new Date().toISOString(),
      email: "klient@browin.pl",
      name: "Klient BROWIN",
      provider: "google",
    });
  };

  return (
    <SectionShell
      eyebrow="Panel klienta"
      title={mode === "login" ? "Zaloguj się do konta" : "Załóż konto"}
      titleId={titleId}
    >
      <p className="mt-3 max-w-2xl text-sm leading-relaxed text-browin-dark/66">
        Korzystaj z jednego konta do zakupów, danych dostawy i obsługi zamówień.
      </p>

      <div className="mt-6 grid grid-cols-2 gap-2">
        <ModeButton active={mode === "login"} onClick={() => setMode("login")}>
          Logowanie
        </ModeButton>
        <ModeButton active={mode === "register"} onClick={() => setMode("register")}>
          Rejestracja
        </ModeButton>
      </div>

      {mode === "login" ? (
        <form className="mt-6 grid gap-4" onSubmit={handleLoginSubmit}>
          <CustomerField
            autoComplete="email"
            autoCapitalize="none"
            icon={EnvelopeSimple}
            id={`${layout}-customer-login-email`}
            inputMode="email"
            label="E-mail"
            name="email"
            placeholder="adres@email.pl"
            required
            spellCheck={false}
            type="email"
          />
          <CustomerField
            autoComplete="current-password"
            icon={LockKey}
            id={`${layout}-customer-login-password`}
            label="Hasło"
            minLength={6}
            name="password"
            placeholder="Minimum 6 znaków"
            required
            type="password"
          />
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <Link
              className="text-xs font-bold uppercase tracking-[0.14em] text-browin-red transition-colors hover:text-browin-dark"
              href="/rejestracja-logowanie#przypomnij-haslo"
            >
              Nie pamiętam hasła?
            </Link>
            <button
              className="inline-flex min-h-12 w-full items-center justify-center gap-2 bg-browin-red px-5 text-sm font-bold uppercase tracking-[0.14em] text-browin-white shadow-sharp transition-colors hover:bg-browin-dark sm:w-auto"
              type="submit"
            >
              Zaloguj
              <ArrowRight size={16} weight="bold" />
            </button>
          </div>
        </form>
      ) : (
        <form className="mt-6 grid gap-4" onSubmit={handleRegisterSubmit}>
          <div className="grid gap-4 sm:grid-cols-2">
            <CustomerField
              autoComplete="given-name"
              icon={User}
              id={`${layout}-customer-register-name`}
              label="Imię"
              name="name"
              placeholder="Imię"
              required
              type="text"
            />
            <CustomerField
              autoComplete="email"
              autoCapitalize="none"
              icon={EnvelopeSimple}
              id={`${layout}-customer-register-email`}
              inputMode="email"
              label="E-mail"
              name="email"
              placeholder="adres@email.pl"
              required
              spellCheck={false}
              type="email"
            />
          </div>
          <CustomerField
            autoComplete="new-password"
            icon={LockKey}
            id={`${layout}-customer-register-password`}
            label="Hasło"
            minLength={6}
            name="password"
            placeholder="Minimum 6 znaków"
            required
            type="password"
          />

          <div className="grid gap-1.5">
            <label
              className="grid min-h-12 cursor-pointer grid-cols-[1.75rem_minmax(0,1fr)] items-center gap-2 border border-browin-dark/10 bg-browin-white p-3 text-[12px] font-semibold leading-snug transition-colors hover:border-browin-red/35"
              htmlFor={`${layout}-customer-register-terms`}
            >
              <input
                className="peer sr-only"
                id={`${layout}-customer-register-terms`}
                name="terms"
                required
                type="checkbox"
              />
              <span
                aria-hidden="true"
                className="flex h-5 w-5 cursor-pointer items-center justify-center border border-browin-dark/28 bg-browin-white text-browin-white transition-colors peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-browin-red peer-checked:border-browin-red peer-checked:bg-browin-red"
              >
                <Check size={14} weight="bold" />
              </span>
              <span>Akceptuję regulamin oraz politykę prywatności sklepu.</span>
            </label>
            <div className="flex flex-wrap gap-x-4 gap-y-1 px-1 text-[11px] font-bold">
              <Link
                className="text-browin-red underline underline-offset-2 transition-colors hover:text-browin-red/80"
                href="/regulamin"
              >
                Zobacz regulamin
              </Link>
              <Link
                className="text-browin-red underline underline-offset-2 transition-colors hover:text-browin-red/80"
                href="/polityka-prywatnosci"
              >
                Zobacz politykę prywatności
              </Link>
            </div>
          </div>

          <button
            className="inline-flex min-h-12 w-full items-center justify-center gap-2 bg-browin-red px-5 text-sm font-bold uppercase tracking-[0.14em] text-browin-white shadow-sharp transition-colors hover:bg-browin-dark"
            type="submit"
          >
            Załóż konto
            <UserPlus size={17} weight="bold" />
          </button>
        </form>
      )}

      <div className="my-6 flex items-center gap-3">
        <span className="h-px flex-1 bg-browin-dark/10" />
        <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-browin-dark/42">
          albo
        </span>
        <span className="h-px flex-1 bg-browin-dark/10" />
      </div>

      <button
        className="inline-flex min-h-12 w-full items-center justify-center gap-2 border border-browin-dark/12 bg-browin-white px-5 text-sm font-bold uppercase tracking-[0.12em] text-browin-dark transition-colors hover:border-browin-red hover:text-browin-red"
        onClick={handleGoogleLogin}
        type="button"
      >
        <GoogleLogo size={19} weight="bold" />
        Kontynuuj z Google
      </button>
    </SectionShell>
  );
}

export function CustomerAuthPage() {
  return (
    <main className="bg-browin-gray py-6 md:py-10 lg:py-12">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-3xl">
          <CustomerAuthForm layout="page" />
        </div>
      </div>
    </main>
  );
}

export function CustomerAuthModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };
    const previousOverflow = document.body.style.overflow;

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) {
    return null;
  }

  return (
    <div
      aria-labelledby="customer-auth-modal-title"
      aria-modal="true"
      className="fixed inset-0 z-[120] flex items-end justify-center bg-browin-dark/45 px-3 py-3 md:items-center md:px-6"
      role="dialog"
    >
      <button
        aria-label="Zamknij logowanie"
        className="absolute inset-0 h-full w-full cursor-default"
        onClick={onClose}
        type="button"
      />
      <div className="relative max-h-[calc(100dvh-1.5rem)] w-full max-w-3xl overflow-y-auto border border-browin-dark/10 bg-browin-white shadow-panel">
        <button
          aria-label="Zamknij"
          className="absolute right-3 top-3 z-10 flex h-10 w-10 items-center justify-center border border-browin-dark/10 bg-browin-white text-browin-dark transition-colors hover:border-browin-red hover:text-browin-red"
          onClick={onClose}
          type="button"
        >
          <X size={20} />
        </button>
        <CustomerAuthForm
          layout="modal"
          onSuccess={onClose}
          titleId="customer-auth-modal-title"
        />
      </div>
    </div>
  );
}

function AccountSummary({ session }: { session: CustomerSession }) {
  const summaryItems = useMemo<AccountSummaryItem[]>(
    () => [
      {
        icon: User,
        label: "Klient",
        value: session.name,
      },
      {
        icon: EnvelopeSimple,
        label: "E-mail",
        value: session.email,
      },
      {
        icon: ShieldCheck,
        label: "Aktywne od",
        value: formatSessionDate(session.createdAt),
      },
    ],
    [session],
  );

  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {summaryItems.map((item) => {
        const IconComponent = item.icon;

        return (
          <div className="border border-browin-dark/10 bg-browin-white p-4" key={item.label}>
            <IconComponent className="text-browin-red" size={22} weight="bold" />
            <p className="mt-3 text-[10px] font-bold uppercase tracking-[0.14em] text-browin-dark/48">
              {item.label}
            </p>
            <p className="mt-1 break-words text-sm font-bold text-browin-dark">
              {item.value}
            </p>
          </div>
        );
      })}
    </div>
  );
}

function DashboardBlock({
  children,
  icon: IconComponent,
  title,
}: {
  children: ReactNode;
  icon: Icon;
  title: string;
}) {
  return (
    <section className="border border-browin-dark/10 bg-browin-white p-4 sm:p-5">
      <div className="flex items-center gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center bg-browin-red text-browin-white">
          <IconComponent size={20} weight="bold" />
        </span>
        <h2 className="text-lg font-bold tracking-tight text-browin-dark">{title}</h2>
      </div>
      <div className="mt-4">{children}</div>
    </section>
  );
}

export function CustomerDashboardPage() {
  const router = useRouter();
  const sessionSnapshot = useSyncExternalStore(
    subscribeCustomerSession,
    getCustomerSessionSnapshot,
    getCustomerSessionServerSnapshot,
  );
  const session = useMemo(
    () => parseCustomerSessionSnapshot(sessionSnapshot),
    [sessionSnapshot],
  );
  const [hasHydrated, setHasHydrated] = useState(false);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => setHasHydrated(true));

    return () => window.cancelAnimationFrame(frame);
  }, []);

  const handleLogout = () => {
    clearCustomerSession();
    router.push("/rejestracja-logowanie");
  };

  if (!hasHydrated) {
    return (
      <main className="bg-browin-gray py-8 md:py-12">
        <div className="container mx-auto px-4">
          <div className="min-h-64 border border-browin-dark/10 bg-browin-white" />
        </div>
      </main>
    );
  }

  if (!session) {
    return (
      <main className="bg-browin-gray py-8 md:py-12">
        <div className="container mx-auto px-4">
          <section className="border border-browin-dark/10 bg-browin-white p-6 text-center shadow-[0_24px_80px_-64px_rgba(51,51,51,0.56)] md:p-10">
            <div aria-hidden className="mx-auto mb-5 h-1 w-16 bg-browin-red" />
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-browin-red">
              Panel klienta
            </p>
            <h1 className="mt-2 text-2xl font-bold tracking-tight text-browin-dark">
              Zaloguj się, aby przejść do konta
            </h1>
            <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-browin-dark/66">
              Konto klienta pozwala wrócić do danych zamówienia, adresów i zapisanych
              produktów.
            </p>
            <Link
              className="mt-6 inline-flex min-h-12 items-center justify-center gap-2 bg-browin-red px-5 text-sm font-bold uppercase tracking-[0.14em] text-browin-white shadow-sharp transition-colors hover:bg-browin-dark"
              href="/rejestracja-logowanie"
            >
              Przejdź do logowania
              <ArrowRight size={16} weight="bold" />
            </Link>
          </section>
        </div>
      </main>
    );
  }

  return (
    <main className="bg-browin-gray py-6 md:py-10 lg:py-12">
      <div className="container mx-auto px-4">
        <div className="flex flex-col gap-4 border border-browin-dark/10 bg-browin-white p-4 shadow-[0_24px_80px_-64px_rgba(51,51,51,0.56)] sm:p-6 md:flex-row md:items-center md:justify-between lg:p-8">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-browin-red">
              Panel klienta
            </p>
            <h1 className="mt-2 text-2xl font-bold tracking-tight text-browin-dark sm:text-3xl">
              Dzień dobry, {session.name}
            </h1>
            <p className="mt-2 text-sm leading-relaxed text-browin-dark/62">
              Twoje zakupy, dane i ulubione produkty w jednym miejscu.
            </p>
          </div>
          <button
            className="inline-flex min-h-11 items-center justify-center gap-2 border border-browin-dark/12 bg-browin-white px-4 text-xs font-bold uppercase tracking-[0.14em] text-browin-dark transition-colors hover:border-browin-red hover:text-browin-red"
            onClick={handleLogout}
            type="button"
          >
            <SignOut size={17} weight="bold" />
            Wyloguj
          </button>
        </div>

        <div className="mt-5">
          <AccountSummary session={session} />
        </div>

        <div className="mt-5 grid gap-5 lg:grid-cols-2">
          <DashboardBlock icon={Package} title="Ostatnie zamówienia">
            <div className="divide-y divide-browin-dark/10 text-sm font-semibold text-browin-dark/72">
              {[
                ["BW/2026/0512", "W realizacji", "249,80 zł"],
                ["BW/2026/0418", "Dostarczone", "89,90 zł"],
              ].map(([number, status, total]) => (
                <div
                  className="grid grid-cols-[minmax(0,1fr)_auto] gap-3 py-3 first:pt-0 last:pb-0"
                  key={number}
                >
                  <div>
                    <p className="font-bold text-browin-dark">{number}</p>
                    <p className="mt-1 text-xs uppercase tracking-[0.12em] text-browin-dark/45">
                      {status}
                    </p>
                  </div>
                  <p className="font-bold text-browin-red">{total}</p>
                </div>
              ))}
            </div>
          </DashboardBlock>

          <DashboardBlock icon={MapPinLine} title="Adresy">
            <div className="border border-dashed border-browin-dark/16 bg-browin-gray p-4 text-sm font-semibold leading-relaxed text-browin-dark/66">
              Domyślny adres dostawy pojawi się tutaj po pierwszym zamówieniu.
            </div>
          </DashboardBlock>

          <DashboardBlock icon={Heart} title="Ulubione">
            <div className="border border-dashed border-browin-dark/16 bg-browin-gray p-4 text-sm font-semibold leading-relaxed text-browin-dark/66">
              Zapisane produkty będą widoczne w tym miejscu.
            </div>
          </DashboardBlock>
        </div>
      </div>
    </main>
  );
}
