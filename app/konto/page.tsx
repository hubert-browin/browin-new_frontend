import type { Metadata } from "next";

import { CustomerDashboardPage } from "@/components/store/customer-account";

export const metadata: Metadata = {
  title: "Panel klienta",
  description: "Panel klienta BROWIN z podsumowaniem konta i zamówień.",
  alternates: { canonical: "/konto" },
};

export default function Page() {
  return <CustomerDashboardPage />;
}
