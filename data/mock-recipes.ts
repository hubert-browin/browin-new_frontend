import type { BrowinJsonRecipe } from "./recipes";

export const mockBrowinRecipes: BrowinJsonRecipe[] = [
  {
    asortymenty: ["313016", "313015", "312024", "310002"],
    autor: "BROWIN",
    datapublikacji: "2024-12-01",
    datazakonczenia: null,
    id: "mock-udziec-z-indyka",
    innezdjecia: [
      "https://browin.pl/static/images/600/udziec-z-indyka-z-pistacjami-szynkowar-indyk_pistacje_szynkowar2.webp",
      "https://browin.pl/static/images/600/udziec-z-indyka-z-pistacjami-szynkowar-wedliniarski-4.webp",
    ],
    kategoria: {
      slug: "mieso-i-wedliny",
      nazwa: "Mięso i wędliny",
    },
    metadescription:
      "Przepis na udziec z indyka z szynkowaru z pistacjami i mieszanką przypraw.",
    nadkategoria: "przepis",
    podkategoria: null,
    skladniki:
      '<ul><li>1,15 kg mięsa z udźca indyka</li><li>200 g pistacji</li><li>15 g soli</li><li>17 g <a href="https://browin.pl/sklep/produkt/310002/receptura-babci-leokadii-do-peklowania-35-g" target="blank">Receptury Babci Leokadii do peklowania</a></li></ul>',
    slug: "udziec-z-indyka-z-pistacjami-szynkowar",
    stopka: "Smacznego! ...bo domowe jest lepsze!",
    tagi: "przepis z szynkowaru, indyk w szynkowarze, domowe wędliny",
    tresc:
      "<h2>Przepis na udziec z indyka</h2><h3>Przygotowanie:</h3><p>Mięso oczyść, część zmiel, a część pokrój w drobną kostkę. Dodaj sól, pistacje i przyprawy, a następnie dokładnie wyrób farsz.</p><p>Farsz przełóż do woreczka w szynkowarze, zamknij i parz w wodzie o temperaturze 80°C do osiągnięcia 72°C wewnątrz wsadu.</p><p>Po parzeniu ostudź, schłodź przez noc i podawaj w cienkich plastrach.</p>",
    tytul: "Udziec z indyka z pistacjami - szynkowar",
    wstep:
      "<p>Masz szynkowar i chcesz przygotować efektowną, domową wędlinę? Ten przepis łączy delikatnego indyka z pistacjami i aromatyczną przyprawą do peklowania.</p>",
    zdjecie:
      "https://browin.pl/static/images/900/udziec-z-indyka-z-pistacjami-szynkowar-indyk_pistacje_szynkowar1.webp",
  },
  {
    asortymenty: ["132903", "362014", "139055", "139044"],
    autor: "BROWIN",
    datapublikacji: "2024-05-13",
    datazakonczenia: null,
    id: "mock-kiszony-kalafior",
    innezdjecia: [],
    kategoria: {
      slug: "przetwory",
      nazwa: "Przetwory",
    },
    metadescription:
      "Kiszony kalafior z pestkami granatu, gorczycą i aromatycznymi dodatkami.",
    nadkategoria: "przepis",
    podkategoria: null,
    skladniki:
      "<p>na 4 słoiki 900 ml:</p><ul><li>1 większa główka kalafiora</li><li>2 granaty</li><li>2 łyżeczki gorczycy</li><li>20 ziaren pieprzu</li><li>4 łyżeczki suszonego kopru</li><li>8 ząbków czosnku</li></ul>",
    slug: "kiszony-kalafior-z-granatem",
    stopka: "Smacznego! ...bo domowe jest lepsze!",
    tagi: "kiszony kalafior, kiszonki, domowe przetwory",
    tresc:
      "<h2>Przepis na kiszonego kalafiora z granatem</h2><h3>Przygotowanie:</h3><p>Kalafior podziel na różyczki i rozłóż do słoików razem z pestkami granatu oraz przyprawami.</p><p>Przygotuj zalewę z soli i przegotowanej wody, ostudź do około 40°C, zalej warzywa i zabezpiecz dociskiem do przetworów.</p>",
    tytul: "Kiszony kalafior z granatem",
    wstep:
      "<p>Kiszony kalafior z granatem to chrupiąca, lekko kwaśna i efektowna alternatywa dla klasycznych kiszonek.</p>",
    zdjecie: "https://browin.pl/static/images/900/kiszony-kalafior-z-granatem-ib0a9762a.webp",
  },
  {
    asortymenty: ["411215", "411200", "411240", "411302"],
    autor: "BROWIN",
    datapublikacji: "2026-02-02",
    datazakonczenia: null,
    id: "mock-jogurt-skyr",
    innezdjecia: [],
    kategoria: {
      slug: "nabial",
      nazwa: "Nabiał",
    },
    metadescription:
      "Domowy jogurt skyr z kulturami bakterii i podpuszczką do serów.",
    nadkategoria: "przepis",
    podkategoria: null,
    skladniki:
      '<ul><li>4 L mleka niskopasteryzowanego 2%</li><li>0,2 g <a href="https://browin.pl/sklep/produkt/411200/podpuszczka-do-serow-5x1-g" target="_blank">podpuszczki</a></li><li>0,4 g <a href="https://browin.pl/sklep/produkt/411240/kultury-bakterii-do-jogurtu" target="_blank">kultur bakterii</a></li></ul>',
    slug: "jogurt-skyr",
    stopka: "Smacznego! ...bo domowe jest lepsze!",
    tagi: "skyr, jogurt domowy, kultury bakterii, nabiał",
    tresc:
      "<h2>Przepis na jogurt skyr</h2><h3>Przygotowanie:</h3><p>Mleko podgrzej, zaszczep kulturami bakterii i dodaj podpuszczkę zgodnie z instrukcją.</p><p>Po inkubacji odcedź masę na gęstym sicie, aż uzyskasz kremową, zwartą konsystencję skyru.</p>",
    tytul: "Jogurt skyr",
    wstep:
      "<p>Skyr to gęsty, wysokobiałkowy jogurt, który możesz przygotować w domu z pomocą odpowiednich kultur bakterii.</p>",
    zdjecie: "https://browin.pl/static/images/900/jogurt-skyr.webp",
  },
];
