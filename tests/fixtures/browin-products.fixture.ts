import type { BrowinJsonProduct } from "../../lib/product-feed-transformer";

export const browinProductsFixture = [
  {
    id: "344001",
    slug: "destylator-hawkstill-aabratek-60l-60-3-mm-2-1-smart",
    name: "Destylator hawkSTILL Aabratek 60L, 60.3 mm 2.1 SMART",
    price: 1556,
    base_price: 1556,
    brand: "BROWIN",
    status: "NOWOSC",
    categories: [
      {
        kategoria: {
          nazwa: "Destylatory hawkSTILL",
          slug: "destylatory-hawkstill",
        },
        linia: {
          nazwa: "Gorzelnictwo",
          slug: "gorzelnictwo",
        },
        podkategoria: {
          nazwa: "Destylatory hawkSTILL 2.0",
          slug: "destylatory-hawkstill-2-0",
        },
      },
    ],
    description:
      "<p>Poznaj sekret doskonałej destylacji.</p><h2>Dane techniczne</h2><ul><li>stal nierdzewna</li><li>zasilanie elektryczne</li></ul>",
    description_text:
      "Poznaj sekret doskonałej destylacji. Dane techniczne: stal nierdzewna, zasilanie elektryczne.",
    photos: [
      {
        large:
          "https://browin.pl/static/images/1600/destylator-hawkstill-aabratek-60l-60-3-mm-2-1-smart-344001.webp",
        medium:
          "https://browin.pl/static/images/500/destylator-hawkstill-aabratek-60l-60-3-mm-2-1-smart-344001.webp",
      },
    ],
    instrukcja: ["344000_001_002_003_instr_makul_251119.pdf"],
    instrukcja_bezpieczenstwa_pl:
      "pl_instrukcja-ogolnego-bezpieczenstwa-produktow-konsumenckich.pdf",
    dane_zestawu: [
      {
        id: "323009",
        ilosc: 1,
        nazwa: "Pojemnik HawkStill elektr. 60L",
        slug: "pojemnik-hawkstill-elektr-60l-v2-triclamp",
        zdjecie: "343009_ar10.png",
      },
      {
        id: "DEST_GRZALKA4",
        ilosc: 1,
        nazwa: "Grzałka elektryczna do destylatorów 3.5kW",
        slug: "grzalka-elektryczna-do-destylatorow-3-5kw",
        zdjecie: "343009_ar2.png",
      },
    ],
    similar_products: ["220305", "405662"],
    komplementarne: ["405073", "640219"],
    attributes: [
      {
        name: "Materiał",
        value: "stal nierdzewna",
      },
      {
        name: "Elektryczne",
        value: true,
      },
    ],
  },
  {
    id: "403250",
    slug: "drozdze-gorzelnicze-turbo-koji-50-g-bez-zacierania",
    name: "Drożdże gorzelnicze Turbo Koji 50 g",
    price: 18.49,
    base_price: 18.49,
    brand: "BROWIN",
    status: "STANDARD",
    categories: [
      {
        kategoria: {
          nazwa: "Drożdże gorzelnicze",
          slug: "drozdze-gorzelnicze",
        },
        linia: {
          nazwa: "Gorzelnictwo",
          slug: "gorzelnictwo",
        },
      },
    ],
    description: "<p>Aktywne drożdże do szybkiego startu fermentacji.</p>",
    description_text: "Aktywne drożdże do szybkiego startu fermentacji.",
    photos: [
      {
        large:
          "https://browin.pl/static/images/1600/drozdze-gorzelnicze-turbo-koji-50-g.webp",
      },
    ],
    documents: [
      {
        dokument: "angel-leaven-statement.pdf",
        nazwa: "Skład",
      },
    ],
  },
  {
    id: "353030_MAT",
    slug: "wezyk-do-obciagu-wina",
    name: "Wężyk do obciągu wina",
    price: 7.49,
    base_price: 8.99,
    brand: "BROWIN",
    status: "WYPRZEDAZ",
    categories: [
      {
        kategoria: {
          nazwa: "Akcesoria winiarskie",
          slug: "akcesoria-winiarskie",
        },
        linia: {
          nazwa: "Winiarstwo",
          slug: "winiarstwo",
        },
      },
    ],
    description: "<p>Prosty wężyk do pracy z winem i nastawami.</p>",
    description_text: "Prosty wężyk do pracy z winem i nastawami.",
  },
  {
    id: "270109",
    slug: "termometr-elektroniczny-marki-soens-z-sonda-bialy",
    name: "Termometr elektroniczny marki Soens z sondą, biały",
    price: 39.99,
    base_price: 49.99,
    brand: "SOENS",
    status: "STANDARD",
    categories: [
      {
        kategoria: {
          nazwa: "Elektroniczne",
          slug: "elektroniczne",
        },
        linia: {
          nazwa: "Stacje pogody",
          slug: "stacje-pogody",
        },
      },
      {
        kategoria: {
          nazwa: "Temperatura otoczenia",
          slug: "temperatura-otoczenia",
        },
        linia: {
          nazwa: "Termometry",
          slug: "termometry",
        },
        podkategoria: {
          nazwa: "Elektroniczne",
          slug: "elektroniczne",
        },
      },
    ],
    description:
      "<p>Elektroniczny termometr z sondą i czytelnym ekranem.</p><p><strong>Pomiar temperatury</strong> w domu i ogrodzie.</p>",
    description_text: "Elektroniczny termometr z sondą i czytelnym ekranem.",
    photos: [
      {
        large:
          "https://browin.pl/static/images/1600/termometr-elektroniczny-marki-soens-z-sonda-bialy.webp",
      },
    ],
    deklaracjazgodnosci: "270109.pdf",
    kartaproduktu: "270109-karta.pdf",
  },
  {
    id: "411240",
    slug: "kultury-bakterii-do-jogurtu",
    name: "Kultury bakterii do jogurtu",
    price: 12.99,
    base_price: 12.99,
    brand: "BROWIN",
    status: "STANDARD",
    categories: [
      {
        kategoria: {
          nazwa: "Kultury bakterii",
          slug: "kultury-bakterii",
        },
        linia: {
          nazwa: "Wyrób jogurtu",
          slug: "wyrob-jogurtu",
        },
      },
      {
        kategoria: {
          nazwa: "Kultury bakterii",
          slug: "kultury-bakteryjne",
        },
        linia: {
          nazwa: "Wyrób sera",
          slug: "serowarstwo",
        },
      },
    ],
    description: "<p>Kultury starterowe do domowego jogurtu.</p>",
    description_text: "Kultury starterowe do domowego jogurtu.",
    photos: [
      {
        large:
          "https://browin.pl/static/images/1600/kultury-bakterii-do-jogurtu.webp",
      },
    ],
    attributes: [
      {
        name: "Przeznaczenie",
        value: "jogurt",
      },
    ],
  },
] satisfies BrowinJsonProduct[];
