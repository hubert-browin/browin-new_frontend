export type FooterLink = {
  label: string;
  href: string;
};

export type FooterColumn = {
  title: string;
  links: FooterLink[];
};

export const footerColumns: FooterColumn[] = [
  {
    title: "Informacje",
    links: [
      { label: "Nowości", href: "/sklep/nowosci" },
      { label: "Koniec serii", href: "/sklep/wyprzedaze" },
      { label: "Usługa wędzenia", href: "https://browin.pl/blog/wedzenie-na-godziny" },
      { label: "Praca", href: "/praca" },
      { label: "Współpraca", href: "/wspolpraca" },
      { label: "Zostań naszym partnerem", href: "https://browin.pl/blog/zostan-naszym-partnerem" },
      {
        label: "Katalog produktów Browin (pdf)",
        href: "https://browin.pl/static/download/katalog_browin.pdf",
      },
      { label: "Dane firmy", href: "/dane-firmy" },
    ],
  },
  {
    title: "Nasza firma",
    links: [
      { label: "Misja, wizja, wartości", href: "/misja-wizja-wartosci" },
      { label: "Nasz Browin", href: "/nasz-browin" },
      { label: "Certyfikaty", href: "/certyfikaty" },
      { label: "Od pomysłu do produktu", href: "/od-pomyslu-do-produktu" },
      { label: "Nasze Marki", href: "/nasze-marki" },
      { label: "Usługi parku maszyn", href: "https://browin.pl/blog/uslugi-parku-maszyn" },
      { label: "Projekty unijne", href: "/projekty-unijne" },
      { label: "Zapytania ofertowe", href: "/zapytania-ofertowe" },
    ],
  },
  {
    title: "Zakupy",
    links: [
      { label: "Płatności", href: "https://browin.pl/blog/bezpieczne-formy-platnosci" },
      {
        label: "Płatności odroczone Twisto",
        href: "https://browin.pl/blog/poznajmy-sie-jestem-twisto",
      },
      { label: "Wysyłka i dostawa", href: "/wysylka-i-dostawa" },
      { label: "Regulamin", href: "/regulamin" },
      { label: "Reklamacje i zwroty", href: "/regulamin#reklamacje" },
      { label: "Polityka prywatności", href: "/polityka-prywatnosci" },
      { label: "Porady i FAQ", href: "/porady-i-faq" },
    ],
  },
  {
    title: "Dla klientów",
    links: [
      { label: "Zgłaszanie reklamacji", href: "/reklamacje" },
      { label: "Zgłoś błąd", href: "/zglos-blad" },
      { label: "Odbiór zużytego sprzętu", href: "/odbior-zuzytego-sprzetu" },
      {
        label: "Oznaczenia opakowań",
        href: "/tablica-oznaczen-opakowan",
      },
      { label: "Ogólne bezpieczeństwo produktów (GPSR)", href: "/gpsr" },
      { label: "Mapa dojazdu", href: "/dane-firmy#plan" },
    ],
  },
];
