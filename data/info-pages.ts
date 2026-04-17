export type InfoSection = {
  id: string;
  heading: string;
  paragraphs?: string[];
  list?: string[];
};

export type InfoPage = {
  slug: string;
  eyebrow: string;
  title: string;
  footerLabel: string;
  lead: string;
  updatedAt: string;
  sections: InfoSection[];
};

export const infoPages: InfoPage[] = [
  {
    slug: "regulamin",
    eyebrow: "Informacje prawne",
    title: "Regulamin sklepu internetowego BROWIN",
    footerLabel: "Regulamin",
    lead:
      "Niniejszy regulamin określa zasady korzystania ze sklepu internetowego BROWIN, składania zamówień, realizacji dostaw oraz prawa i obowiązki stron umowy sprzedaży.",
    updatedAt: "2026-04-01",
    sections: [
      {
        id: "postanowienia-ogolne",
        heading: "§1. Postanowienia ogólne",
        paragraphs: [
          "Sklep internetowy BROWIN, dostępny pod adresem browin-demo.pl, prowadzony jest przez BROWIN Sp. z o.o. z siedzibą w Łodzi przy ul. Pryncypalnej 129/141, wpisaną do Krajowego Rejestru Sądowego pod numerem KRS 0000000000, NIP 000-00-00-000, REGON 000000000, kapitał zakładowy 1 000 000 zł.",
          "Kontakt ze Sprzedawcą możliwy jest za pośrednictwem poczty elektronicznej (kontakt@browin-demo.pl) oraz telefonicznie w godzinach pracy biura. Aktualne dane kontaktowe znajdują się w stopce strony.",
          "Regulamin skierowany jest zarówno do konsumentów, jak i przedsiębiorców korzystających ze Sklepu i określa zasady korzystania ze Sklepu Internetowego oraz zasady i tryb zawierania Umów Sprzedaży z Klientem na odległość.",
        ],
      },
      {
        id: "definicje",
        heading: "§2. Definicje",
        list: [
          "Konsument – osoba fizyczna zawierająca ze Sprzedawcą umowę w ramach Sklepu, której przedmiot nie jest związany bezpośrednio z jej działalnością gospodarczą lub zawodową.",
          "Klient – każdy podmiot dokonujący zakupów za pośrednictwem Sklepu.",
          "Sprzedawca – BROWIN Sp. z o.o. z siedzibą w Łodzi.",
          "Sklep – sklep internetowy prowadzony przez Sprzedawcę pod adresem browin-demo.pl.",
          "Umowa zawarta na odległość – umowa zawarta z Klientem w ramach zorganizowanego systemu zawierania umów na odległość, bez jednoczesnej fizycznej obecności stron.",
          "Zamówienie – oświadczenie woli Klienta składane za pomocą Formularza Zamówienia i zmierzające bezpośrednio do zawarcia Umowy Sprzedaży Produktu lub Produktów ze Sprzedawcą.",
        ],
      },
      {
        id: "warunki-korzystania",
        heading: "§3. Warunki korzystania ze sklepu",
        paragraphs: [
          "Do korzystania ze Sklepu, w tym przeglądania asortymentu oraz składania zamówień, niezbędne jest urządzenie z dostępem do sieci Internet, aktywne konto poczty elektronicznej oraz przeglądarka internetowa w aktualnej wersji.",
          "Klient zobowiązany jest do korzystania ze Sklepu w sposób zgodny z prawem i dobrymi obyczajami, mając na uwadze poszanowanie dóbr osobistych oraz praw autorskich i własności intelektualnej Sprzedawcy oraz osób trzecich.",
          "Zakazane jest dostarczanie przez Klienta treści o charakterze bezprawnym, w tym w szczególności treści naruszających prawa osób trzecich lub dobre obyczaje.",
        ],
      },
      {
        id: "zawarcie-umowy",
        heading: "§4. Zawarcie umowy sprzedaży",
        paragraphs: [
          "Zamówienia w Sklepie można składać przez całą dobę, siedem dni w tygodniu, z wyłączeniem okresów przerw technicznych.",
          "W celu złożenia zamówienia należy dodać wybrane produkty do koszyka, przejść do formularza zamówienia, wypełnić dane niezbędne do realizacji oraz wybrać sposób dostawy i płatności.",
          "Złożenie zamówienia następuje po kliknięciu przycisku „Zamawiam i płacę” i stanowi oświadczenie woli Klienta zawarcia ze Sprzedawcą umowy sprzedaży. Po złożeniu zamówienia Klient otrzymuje wiadomość e-mail z potwierdzeniem jego przyjęcia do realizacji.",
          "Umowa sprzedaży zawierana jest w języku polskim, zgodnie z prawem polskim oraz zgodnie z niniejszym Regulaminem.",
        ],
      },
      {
        id: "platnosci",
        heading: "§5. Ceny i metody płatności",
        paragraphs: [
          "Ceny produktów prezentowane w Sklepie są cenami brutto, wyrażonymi w złotych polskich i zawierają podatek VAT. Ceny nie obejmują kosztów dostawy, które podawane są odrębnie podczas składania zamówienia.",
          "Klient może wybrać jedną z następujących metod płatności: przelew tradycyjny na rachunek bankowy Sprzedawcy, płatność online poprzez operatora płatności, BLIK, kartą płatniczą lub płatność za pobraniem przy odbiorze.",
          "W przypadku wyboru przelewu tradycyjnego Klient zobowiązany jest do opłacenia zamówienia w terminie 5 dni roboczych od jego złożenia. Brak płatności w tym terminie skutkuje anulowaniem zamówienia.",
        ],
      },
      {
        id: "dostawa",
        heading: "§6. Dostawa",
        paragraphs: [
          "Zamówienia realizowane są na terenie Rzeczypospolitej Polskiej oraz, po wcześniejszym uzgodnieniu, w wybranych krajach Unii Europejskiej. Szczegółowe informacje o kosztach i czasie dostawy dostępne są w trakcie składania zamówienia.",
          "Przewidywany czas realizacji zamówienia wynosi od 1 do 3 dni roboczych, licząc od dnia zaksięgowania płatności lub – w przypadku płatności za pobraniem – od dnia potwierdzenia zamówienia.",
          "Zamówienia o wartości przekraczającej próg darmowej dostawy podany w koszyku są dostarczane bezpłatnie wybraną przez Klienta metodą standardową.",
        ],
      },
      {
        id: "odstapienie",
        heading: "§7. Prawo odstąpienia od umowy",
        paragraphs: [
          "Konsument, który zawarł umowę na odległość, może w terminie 14 dni kalendarzowych odstąpić od niej bez podawania przyczyny i bez ponoszenia kosztów, z wyjątkiem kosztów określonych w przepisach prawa.",
          "Aby skorzystać z prawa odstąpienia, Konsument powinien złożyć oświadczenie o odstąpieniu od umowy, przesyłając je na adres poczty elektronicznej Sprzedawcy lub pocztą tradycyjną na adres siedziby Sprzedawcy.",
          "Sprzedawca zwraca Konsumentowi wszystkie dokonane przez niego płatności, w tym koszty dostawy, niezwłocznie, nie później niż w terminie 14 dni od dnia otrzymania oświadczenia o odstąpieniu od umowy.",
          "Prawo odstąpienia nie przysługuje w odniesieniu do produktów wykonanych według specyfikacji Konsumenta lub służących zaspokojeniu jego zindywidualizowanych potrzeb, a także produktów ulegających szybkiemu zepsuciu lub produktów w zapieczętowanym opakowaniu, których po otwarciu nie można zwrócić ze względu na ochronę zdrowia lub higieny.",
        ],
      },
      {
        id: "reklamacje",
        heading: "§8. Reklamacje i rękojmia",
        paragraphs: [
          "Sprzedawca zobowiązany jest dostarczyć Klientowi produkt wolny od wad. W przypadku stwierdzenia wady fizycznej lub prawnej produktu Klient ma prawo złożyć reklamację na podstawie przepisów o rękojmi zawartych w Kodeksie cywilnym.",
          "Reklamację można złożyć drogą elektroniczną na adres kontakt@browin-demo.pl lub pisemnie na adres siedziby Sprzedawcy, podając dane Klienta, numer zamówienia, opis wady oraz preferowany sposób rozpatrzenia reklamacji.",
          "Sprzedawca ustosunkuje się do reklamacji Konsumenta w terminie 14 dni od dnia jej otrzymania. Brak odpowiedzi w tym terminie uznaje się za uznanie reklamacji.",
        ],
      },
      {
        id: "dane-osobowe",
        heading: "§9. Dane osobowe",
        paragraphs: [
          "Administratorem danych osobowych Klientów jest Sprzedawca. Dane osobowe przetwarzane są w celu realizacji zamówień, obsługi reklamacji oraz – za odrębną zgodą – w celach marketingowych.",
          "Szczegółowe informacje dotyczące przetwarzania danych osobowych, w tym przysługujących praw, znajdują się w Polityce prywatności dostępnej w sekcji informacyjnej Sklepu.",
          "Klient ma prawo dostępu do swoich danych, ich sprostowania, usunięcia, ograniczenia przetwarzania, przenoszenia, a także prawo do wniesienia sprzeciwu oraz skargi do organu nadzorczego.",
        ],
      },
      {
        id: "postanowienia-koncowe",
        heading: "§10. Postanowienia końcowe",
        paragraphs: [
          "W sprawach nieuregulowanych niniejszym Regulaminem zastosowanie mają powszechnie obowiązujące przepisy prawa polskiego, w szczególności Kodeksu cywilnego oraz ustawy o prawach konsumenta.",
          "Sprzedawca zastrzega sobie prawo do zmiany Regulaminu z ważnych przyczyn, w tym zmiany przepisów prawa lub zmiany sposobu realizacji usług. Do zamówień złożonych przed wejściem w życie zmian stosuje się Regulamin w brzmieniu obowiązującym w chwili składania zamówienia.",
          "Konsument ma możliwość skorzystania z pozasądowych sposobów rozpatrywania reklamacji i dochodzenia roszczeń, w tym z platformy ODR Komisji Europejskiej dostępnej pod adresem ec.europa.eu/consumers/odr.",
          "Regulamin obowiązuje od dnia publikacji wskazanego w nagłówku.",
        ],
      },
    ],
  },
  {
    slug: "polityka-prywatnosci",
    eyebrow: "Informacje prawne",
    title: "Polityka prywatności",
    footerLabel: "Polityka prywatności",
    lead:
      "Dowiedz się, jakie dane zbieramy, w jakim celu są przetwarzane oraz jakie prawa przysługują Ci jako naszemu Klientowi w związku z ich przetwarzaniem.",
    updatedAt: "2026-04-01",
    sections: [
      {
        id: "administrator",
        heading: "§1. Administrator danych",
        paragraphs: [
          "Administratorem Twoich danych osobowych jest BROWIN Sp. z o.o. z siedzibą w Łodzi. Kontakt w sprawach związanych z ochroną danych: kontakt@browin-demo.pl.",
        ],
      },
      {
        id: "zakres-danych",
        heading: "§2. Zakres przetwarzanych danych",
        list: [
          "dane identyfikacyjne: imię, nazwisko, nazwa firmy",
          "dane kontaktowe: adres e-mail, numer telefonu, adres korespondencyjny",
          "dane transakcyjne: historia zamówień, forma płatności, rachunek bankowy (przy zwrotach)",
          "dane techniczne: adres IP, identyfikatory cookies, dane o sesji",
        ],
      },
      {
        id: "cele",
        heading: "§3. Cele przetwarzania",
        paragraphs: [
          "Przetwarzamy dane w celu realizacji zamówień, obsługi reklamacji, wystawiania dokumentów księgowych oraz – jeżeli wyraziłeś zgodę – w celach marketingowych i analitycznych.",
          "Podstawą prawną przetwarzania jest wykonanie umowy (art. 6 ust. 1 lit. b RODO), obowiązek prawny (art. 6 ust. 1 lit. c RODO) oraz – w przypadku marketingu – Twoja dobrowolna zgoda (art. 6 ust. 1 lit. a RODO).",
        ],
      },
      {
        id: "prawa",
        heading: "§4. Twoje prawa",
        list: [
          "prawo dostępu do danych i otrzymania ich kopii",
          "prawo do sprostowania i usunięcia danych",
          "prawo ograniczenia przetwarzania",
          "prawo do przenoszenia danych",
          "prawo wniesienia sprzeciwu wobec przetwarzania",
          "prawo do cofnięcia zgody w dowolnym momencie",
          "prawo wniesienia skargi do Prezesa Urzędu Ochrony Danych Osobowych",
        ],
      },
      {
        id: "cookies",
        heading: "§5. Pliki cookies",
        paragraphs: [
          "Sklep wykorzystuje pliki cookies w celu zapewnienia prawidłowego działania serwisu, zapamiętywania ustawień koszyka oraz analizy ruchu. Szczegółowe ustawienia możesz zmienić w panelu preferencji cookies lub w swojej przeglądarce.",
        ],
      },
    ],
  },
];

const slugIndex = new Map(infoPages.map((page) => [page.slug, page]));

export const getInfoPage = (slug: string): InfoPage | undefined => slugIndex.get(slug);
