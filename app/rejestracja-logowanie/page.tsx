import type { Metadata } from "next";

import { CustomerAuthPage } from "@/components/store/customer-account";

export const metadata: Metadata = {
  title: "Logowanie i rejestracja klienta",
  description: "Logowanie i rejestracja do panelu klienta BROWIN.",
  alternates: { canonical: "/rejestracja-logowanie" },
};

export default function Page() {
  return <CustomerAuthPage />;
}
