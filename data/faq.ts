export type FaqQuestion = {
  id: string;
  question: string;
  answerHtml: string;
  answerText: string;
};

export type FaqCategory = {
  id: string;
  title: string;
  questions: FaqQuestion[];
};

export const faqCategories = [
  {
    "id": "winiarstwo-piwowarstwo",
    "title": "Winiarstwo i piwowarstwo",
    "questions": [
      {
        "id": "winiarstwo-piwowarstwo-1-co-to-jest-fermentacja-moszczu",
        "question": "Co to jest fermentacja moszczu?",
        "answerHtml": "<p class=\"text-justify\">Jest to proces odbywający się z udziałem drożdży, polegający na przemianie\n                        cukru w\n                        alkohol etylowy i dwutlenek węgla. Proces fermentacji przebiega w dw&oacute;ch etapach &ndash;\n                        pierwszy\n                        nazywany jest &bdquo;burzliwym&rdquo;, drugi zaś &bdquo;stacjonarnym&rdquo;.</p>",
        "answerText": "Jest to proces odbywający się z udziałem drożdży, polegający na przemianie cukru w alkohol etylowy i dwutlenek węgla. Proces fermentacji przebiega w dwóch etapach – pierwszy nazywany jest „burzliwym”, drugi zaś „stacjonarnym”."
      },
      {
        "id": "winiarstwo-piwowarstwo-2-co-to-jest-fermentacja-burzliwa",
        "question": "Co to jest fermentacja burzliwa?",
        "answerHtml": "<p class=\"text-justify\">Jest to pierwszy etap fermentacji, trwający 2-4 dni. Wymaga on dostarczenia\n                        do moszczu\n                        niewielkich ilości tlenu. Natlenienie to niezbędne jest dla prawidłowego rozwoju drożdży,\n                        dlatego w pierwszej\n                        fazie balon możemy zakorkować czopem z waty. Fermentacji tej towarzyszy zazwyczaj silne\n                        wydzielanie się\n                        dwutlenku węgla.</p>",
        "answerText": "Jest to pierwszy etap fermentacji, trwający 2-4 dni. Wymaga on dostarczenia do moszczu niewielkich ilości tlenu. Natlenienie to niezbędne jest dla prawidłowego rozwoju drożdży, dlatego w pierwszej fazie balon możemy zakorkować czopem z waty. Fermentacji tej towarzyszy zazwyczaj silne wydzielanie się dwutlenku węgla."
      },
      {
        "id": "winiarstwo-piwowarstwo-3-co-to-jest-fermentacja-stacjonarna",
        "question": "Co to jest fermentacja stacjonarna?",
        "answerHtml": "<p class=\"text-justify\">Jest to drugi etap fermentacji, kt&oacute;ry prowadzi się w warunkach\n                        beztlenowych\n                        (balon należy zakryć korkiem z rurką fermentacyjną). Na tym etapie następuje gł&oacute;wna\n                        synteza\n                        alkoholu.</p>",
        "answerText": "Jest to drugi etap fermentacji, który prowadzi się w warunkach beztlenowych (balon należy zakryć korkiem z rurką fermentacyjną). Na tym etapie następuje główna synteza alkoholu."
      },
      {
        "id": "winiarstwo-piwowarstwo-4-jaka-temperatura-jest-najlepsza-podczas-fermentacji",
        "question": "Jaka temperatura jest najlepsza podczas fermentacji?",
        "answerHtml": "<p class=\"text-justify\">Temperatura moszczu powinna mieścić się w zakresie 20-25&deg;C. W fazie\n                        końcowej\n                        fermentacji, kiedy wino zaczyna się klarować, zaleca się utrzymywanie temperatury w granicach\n                        18-22&deg;C.</p>",
        "answerText": "Temperatura moszczu powinna mieścić się w zakresie 20-25°C. W fazie końcowej fermentacji, kiedy wino zaczyna się klarować, zaleca się utrzymywanie temperatury w granicach 18-22°C."
      },
      {
        "id": "winiarstwo-piwowarstwo-5-co-to-sa-drozdze-winiarskie",
        "question": "Co to są drożdże winiarskie?",
        "answerHtml": "<p class=\"text-justify\">Są to drożdże należące do rodzaju Saccharomyces cerevisiae i Saccharomyces\n                        bayanus. Ze\n                        względu na swoje zalety używane są do przeprowadzania fermentacji win. Spośr&oacute;d cech\n                        charakterystycznych\n                        tych drożdży warto wymienić przede wszystkim: zdolność do wytworzenia wysokiej zawartości\n                        alkoholu w trunku,\n                        nadającemu winu trwałość; produkowanie klarownego wina i produkowanie estr&oacute;w, czyli\n                        substancji\n                        nadających bukiet winny, właściwy dla każdego rodzaju drożdży.</p>\n                    <p class=\"text-justify\">Fizycznie drożdże do produkcji wina domowego są sprzedawane w postaci:</p>\n                    <ul>\n                        <li>sterylnego suszu jabłkowego z &bdquo;uśpionymi&rdquo; drożdżami;</li>\n                        <li>mętnego płynu z zawieszonymi mikroorganizmami;</li>\n                        <li>suchego proszku &ndash; tzw. drożdże aktywne, liofilizowane.</li>\n                    </ul>",
        "answerText": "Są to drożdże należące do rodzaju Saccharomyces cerevisiae i Saccharomyces bayanus. Ze względu na swoje zalety używane są do przeprowadzania fermentacji win. Spośród cech charakterystycznych tych drożdży warto wymienić przede wszystkim: zdolność do wytworzenia wysokiej zawartości alkoholu w trunku, nadającemu winu trwałość; produkowanie klarownego wina i produkowanie estrów, czyli substancji nadających bukiet winny, właściwy dla każdego rodzaju drożdży. Fizycznie drożdże do produkcji wina domowego są sprzedawane w postaci: sterylnego suszu jabłkowego z „uśpionymi” drożdżami; mętnego płynu z zawieszonymi mikroorganizmami; suchego proszku – tzw. drożdże aktywne, liofilizowane."
      },
      {
        "id": "winiarstwo-piwowarstwo-6-co-to-sa-drozdze-aktywne",
        "question": "Co to są drożdże aktywne?",
        "answerHtml": "<p class=\"text-justify\">Są to liofilizowane kom&oacute;rki drożdży (suchy proszek). Zazwyczaj\n                        wystarczy je tylko\n                        uwodnić wg przepisu na opakowaniu. Zwykle polega to na wsypaniu drożdży to letniej wody, na p&oacute;ł\n                        godziny\n                        przed dodaniem do moszczu.</p>",
        "answerText": "Są to liofilizowane komórki drożdży (suchy proszek). Zazwyczaj wystarczy je tylko uwodnić wg przepisu na opakowaniu. Zwykle polega to na wsypaniu drożdży to letniej wody, na pół godziny przed dodaniem do moszczu."
      },
      {
        "id": "winiarstwo-piwowarstwo-7-drozdze-gornej-fermentacji",
        "question": "Drożdże górnej fermentacji",
        "answerHtml": "<p class=\"text-justify\">Są to szczepy drożdży z gatunku Saccharomyces cerevisiae, wykorzystywane w\n                        piwowarstwie\n                        do warzenia piw pszenicznych, angielskich, niekt&oacute;rych belgijskich i innych. Fermentują w\n                        temperaturach\n                        wyższych (15-25&deg;C), a w trakcie fazy burzliwej fermentacji zbierają się na powierzchni\n                        brzeczki i dopiero\n                        z czasem osadzają się na dnie. Drożdże g&oacute;rnej fermentacji nie występują jako kom&oacute;rki\n                        osobne lub\n                        w parach, lecz tworzą całe grupy fermentujących kom&oacute;rek, co r&oacute;żni je od drożdży\n                        fermentacji\n                        dolnej. Przeważa u nich tlenowy typ przemiany materii. Ze względu na większą zdolność\n                        zarodnikowania tworzą\n                        one po fermentacji biomasę większą, niż czynią to drożdże dolnej fermentacji. Drożdże g&oacute;rnej\n                        fermentacji dają piwo wysoko odfermentowane i o mniejszej klarowności, niż przy użyciu drożdży\n                        dolnej\n                        fermentacji. Posiadają r&oacute;wnież intensywniejszy zapach oraz wyższą zawartość ubocznych\n                        produkt&oacute;w\n                        fermentacji, w szczeg&oacute;lności wyższych alkoholi i estr&oacute;w.</p>",
        "answerText": "Są to szczepy drożdży z gatunku Saccharomyces cerevisiae, wykorzystywane w piwowarstwie do warzenia piw pszenicznych, angielskich, niektórych belgijskich i innych. Fermentują w temperaturach wyższych (15-25°C), a w trakcie fazy burzliwej fermentacji zbierają się na powierzchni brzeczki i dopiero z czasem osadzają się na dnie. Drożdże górnej fermentacji nie występują jako komórki osobne lub w parach, lecz tworzą całe grupy fermentujących komórek, co różni je od drożdży fermentacji dolnej. Przeważa u nich tlenowy typ przemiany materii. Ze względu na większą zdolność zarodnikowania tworzą one po fermentacji biomasę większą, niż czynią to drożdże dolnej fermentacji. Drożdże górnej fermentacji dają piwo wysoko odfermentowane i o mniejszej klarowności, niż przy użyciu drożdży dolnej fermentacji. Posiadają również intensywniejszy zapach oraz wyższą zawartość ubocznych produktów fermentacji, w szczególności wyższych alkoholi i estrów."
      },
      {
        "id": "winiarstwo-piwowarstwo-8-drozdze-dolnej-fermentacji",
        "question": "Drożdże dolnej fermentacji",
        "answerHtml": "<p class=\"text-justify\">Szczepy drożdży piwowarskich należące do gatunku Saccharomyces cerevisiae,\n                        stosowane w\n                        celu przeprowadzenia dolnej fermentacji brzeczki piwnej i otrzymania piw typu lager.\n                        Charakterystyczną cechą\n                        tych drożdży jest ich zdolność do fermentacji w temperaturze 5-10&deg;C i osadzanie się pod\n                        koniec procesu na\n                        dnie fermentora.</p>",
        "answerText": "Szczepy drożdży piwowarskich należące do gatunku Saccharomyces cerevisiae, stosowane w celu przeprowadzenia dolnej fermentacji brzeczki piwnej i otrzymania piw typu lager. Charakterystyczną cechą tych drożdży jest ich zdolność do fermentacji w temperaturze 5-10°C i osadzanie się pod koniec procesu na dnie fermentora."
      },
      {
        "id": "winiarstwo-piwowarstwo-9-jakie-sa-najlepsze-warunki-dla-rozwoju-drozdzy-w-moszczu",
        "question": "Jakie są najlepsze warunki dla rozwoju drożdży w moszczu?",
        "answerHtml": "<p class=\"text-justify\">Najlepsze warunki to sytuacja, kiedy stężenie cukru nie przekracza 22⁰Blg.\n                        Niezbędna\n                        jest r&oacute;wnież obecność odpowiedniej ilości związk&oacute;w mineralnych zawierających azot\n                        i fosfor, kt&oacute;re\n                        obecne są w tzw. pożywkach dla drożdży. Ważna jest r&oacute;wnież kwasowość moszczu.</p>",
        "answerText": "Najlepsze warunki to sytuacja, kiedy stężenie cukru nie przekracza 22⁰Blg. Niezbędna jest również obecność odpowiedniej ilości związków mineralnych zawierających azot i fosfor, które obecne są w tzw. pożywkach dla drożdży. Ważna jest również kwasowość moszczu."
      },
      {
        "id": "winiarstwo-piwowarstwo-10-co-to-jest-moszcz-owocowy",
        "question": "Co to jest moszcz owocowy?",
        "answerHtml": "<p class=\"text-justify\">Moszczem owocowym nazywamy roztw&oacute;r soku z owocami, odpowiednio\n                        rozcieńczony i\n                        dosłodzony, wzbogacony w pożywki, kt&oacute;ry następnie można poddać fermentacji\n                        etanolowej.</p>",
        "answerText": "Moszczem owocowym nazywamy roztwór soku z owocami, odpowiednio rozcieńczony i dosłodzony, wzbogacony w pożywki, który następnie można poddać fermentacji etanolowej."
      },
      {
        "id": "winiarstwo-piwowarstwo-11-dlaczego-nalezy-uzywac-szlachetnych-drozdzy-winiarskich",
        "question": "Dlaczego należy używać szlachetnych drożdży winiarskich?",
        "answerHtml": "<p class=\"text-justify\">Szlachetne drożdże winiarskie posiadają bezcenne zalety:</p>\n                    <ul>\n                        <li>wysoka tolerancja na alkohol &ndash; ok. 14-18%;</li>\n                        <li>odporność na wysokie stężenia cukru (miodowe lub uniwersalne), dwutlenku węgla, garbnik&oacute;w;</li>\n                        <li>wytrzymują większe stężenia siarki, np. po użyciu pirosiarczynu potasu;</li>\n                        <li>prowadzony przez nie proces fermentacji jest szybszy, co zmniejsza prawdopodobieństwo\n                            wystąpienia\n                            zakażeń;\n                        </li>\n                        <li>gotowe wino jest stabilne i dobrze odfermentowane;</li>\n                        <li>barwa wina jest trwała, a bukiet odpowiednio dobrany.</li>\n                    </ul>\n                    <p class=\"text-justify\">Wady prowadzenia fermentacji z udziałem drożdży dzikich:</p>\n                    <ul>\n                        <li>tolerancja na alkohol jedynie do ok. 10%;</li>\n                        <li>mała odporność na kwasy, większe stężenia cukru, duże ilości garbnik&oacute;w (np. wino z\n                            aronii)\n                        </li>\n                        <li>prowadzona przez nie fermentacja nie przebiega do końca;</li>\n                        <li>gotowe wino często jest niestabilne, łatwo ulega zakażeniom;</li>\n                        <li>barwa wina często jest nietrwała;</li>\n                        <li>smak i aromat gotowego wina w dużym stopniu są wynikiem przypadku.</li>\n                    </ul>",
        "answerText": "Szlachetne drożdże winiarskie posiadają bezcenne zalety: wysoka tolerancja na alkohol – ok. 14-18%; odporność na wysokie stężenia cukru (miodowe lub uniwersalne), dwutlenku węgla, garbników; wytrzymują większe stężenia siarki, np. po użyciu pirosiarczynu potasu; prowadzony przez nie proces fermentacji jest szybszy, co zmniejsza prawdopodobieństwo wystąpienia zakażeń; gotowe wino jest stabilne i dobrze odfermentowane; barwa wina jest trwała, a bukiet odpowiednio dobrany. Wady prowadzenia fermentacji z udziałem drożdży dzikich: tolerancja na alkohol jedynie do ok. 10%; mała odporność na kwasy, większe stężenia cukru, duże ilości garbników (np. wino z aronii) prowadzona przez nie fermentacja nie przebiega do końca; gotowe wino często jest niestabilne, łatwo ulega zakażeniom; barwa wina często jest nietrwała; smak i aromat gotowego wina w dużym stopniu są wynikiem przypadku."
      },
      {
        "id": "winiarstwo-piwowarstwo-12-jak-doszczelnic-pojemnik-fermentacyjny",
        "question": "Jak doszczelnić pojemnik fermentacyjny?",
        "answerHtml": "<p class=\"text-justify\">Pojemniki fermentacyjne można dodatkowo doszczelnić, smarując ich brzegi\n                        wazeliną lub\n                        olejem jadalnym.</p>",
        "answerText": "Pojemniki fermentacyjne można dodatkowo doszczelnić, smarując ich brzegi wazeliną lub olejem jadalnym."
      },
      {
        "id": "winiarstwo-piwowarstwo-13-gdzie-moge-znalezc-przepisy-na-domowe-wina",
        "question": "Gdzie mogę znaleźć przepisy na domowe wina?",
        "answerHtml": "<p class=\"text-justify\">Przepisy na domowe wina (a także inne, pyszne domowe trunki i smakołyki)\n                        można znaleźć w\n                        Przepiśniku na naszej stronie, a także w kwartalniku, wydawanym przez naszą firmę.</p>",
        "answerText": "Przepisy na domowe wina (a także inne, pyszne domowe trunki i smakołyki) można znaleźć w Przepiśniku na naszej stronie, a także w kwartalniku, wydawanym przez naszą firmę."
      },
      {
        "id": "winiarstwo-piwowarstwo-14-czy-przy-produkcji-trojniaka-i-dwojniaka-cala-ilosc-miodu-dodajemy-juz",
        "question": "Czy przy produkcji trójniaka i dwójniaka całą ilość miodu dodajemy już na samym początku nastawu?",
        "answerHtml": "<p class=\"text-justify\">Podczas produkcji miod&oacute;w pitnych proponujemy, by mi&oacute;d dodawać\n                        porcjami,\n                        np. w dw&oacute;ch lub trzech, mniej więcej co tydzień. Nie ma wtedy niebezpieczeństwa, że\n                        fermentacja się\n                        zatrzyma z powodu przesłodzenia. Oczywiście mi&oacute;d dodajemy po rozcieńczeniu w wodzie. W\n                        przypadku, gdy\n                        mamy mi&oacute;d &bdquo;niepewny&rdquo;, np. z marketu, proponujemy go wcześniej zagotować,\n                        zbierając powstałe\n                        burzowiny (zanieczyszczenia).</p>",
        "answerText": "Podczas produkcji miodów pitnych proponujemy, by miód dodawać porcjami, np. w dwóch lub trzech, mniej więcej co tydzień. Nie ma wtedy niebezpieczeństwa, że fermentacja się zatrzyma z powodu przesłodzenia. Oczywiście miód dodajemy po rozcieńczeniu w wodzie. W przypadku, gdy mamy miód „niepewny”, np. z marketu, proponujemy go wcześniej zagotować, zbierając powstałe burzowiny (zanieczyszczenia)."
      },
      {
        "id": "winiarstwo-piwowarstwo-15-czy-mozna-do-wina-uzyc-wody-mineralnej",
        "question": "Czy można do wina użyć wody mineralnej?",
        "answerHtml": "<p class=\"text-justify\">Według nas, nie ma w tej kwestii większych zastrzeżeń. Można użyć wody\n                        niskozmineralizowanej, gdyż czasami niekt&oacute;re zawierają większe ilości składnik&oacute;w\n                        mineralnych, kt&oacute;re\n                        mogą być p&oacute;źniej wyczuwalne. Warto użyć &bdquo;kran&oacute;wki&rdquo;, ale\n                        przegotowanej.</p>",
        "answerText": "Według nas, nie ma w tej kwestii większych zastrzeżeń. Można użyć wody niskozmineralizowanej, gdyż czasami niektóre zawierają większe ilości składników mineralnych, które mogą być później wyczuwalne. Warto użyć „kranówki”, ale przegotowanej."
      },
      {
        "id": "winiarstwo-piwowarstwo-16-jakie-sa-roznice-miedzy-drozdzami-ls2-i-enovini",
        "question": "Jakie są różnice między drożdżami LS2 i Enovini?",
        "answerHtml": "<ul>\n                        <li>LS2 fermentują do 16% alkoholu &ndash; Enovini nawet do 18%.</li>\n                        <li>LS2 polecane są do wszystkich rodzaj&oacute;w win, w tym gronowych i musujących &ndash;\n                            Enovini jest\n                            przeznaczone szczeg&oacute;lnie do win owocowych (białych i czerwonych), innych niż gronowe.\n                        </li>\n                        <li>LS2 to jeden gatunek drożdży &ndash; Enovini to mieszanka dw&oacute;ch gatunk&oacute;w\n                            drożdży, dlatego\n                            daje tak niepowtarzalny bukiet wina.\n                        </li>\n                        <li>LS2 tworzy mniejszą ilość osadu, a wino bardzo szybko się klaruje &ndash; ENOVINI klaruje\n                            się wolniej.\n                        </li>\n                    </ul>",
        "answerText": "LS2 fermentują do 16% alkoholu – Enovini nawet do 18%. LS2 polecane są do wszystkich rodzajów win, w tym gronowych i musujących – Enovini jest przeznaczone szczególnie do win owocowych (białych i czerwonych), innych niż gronowe. LS2 to jeden gatunek drożdży – Enovini to mieszanka dwóch gatunków drożdży, dlatego daje tak niepowtarzalny bukiet wina. LS2 tworzy mniejszą ilość osadu, a wino bardzo szybko się klaruje – ENOVINI klaruje się wolniej."
      },
      {
        "id": "winiarstwo-piwowarstwo-17-czy-fermentacje-burzliwa-trzeba-prowadzic-w-warunkach-beztlenowych-z-u",
        "question": "Czy fermentację burzliwą trzeba prowadzić w warunkach beztlenowych z użyciem rurki fermentacyjnej, czy nie jest to konieczne?",
        "answerHtml": "<p class=\"text-justify\">Użycie rurki fermentacyjnej nie jest konieczne podczas fermentacji\n                        burzliwej. W tym\n                        czasie z fermentującej brzeczki wydzielają się duże ilości dwutlenku węgla, kt&oacute;ry jest\n                        gazem &bdquo;ciężkim&rdquo;\n                        i dostatecznie izoluje brzeczkę od tlenu i wpływu innych czynnik&oacute;w atmosferycznych.\n                        Podczas tego etapu\n                        fermentacji można zastosować np. zwinięty wacik, aby do wnętrza nie dostały się\n                        zanieczyszczenia.</p>",
        "answerText": "Użycie rurki fermentacyjnej nie jest konieczne podczas fermentacji burzliwej. W tym czasie z fermentującej brzeczki wydzielają się duże ilości dwutlenku węgla, który jest gazem „ciężkim” i dostatecznie izoluje brzeczkę od tlenu i wpływu innych czynników atmosferycznych. Podczas tego etapu fermentacji można zastosować np. zwinięty wacik, aby do wnętrza nie dostały się zanieczyszczenia."
      },
      {
        "id": "winiarstwo-piwowarstwo-18-czym-sie-rozni-klarowin-od-zelatyny",
        "question": "Czym się różni Klarowin od żelatyny?",
        "answerHtml": "<p class=\"text-justify\"><strong>ROŻNICE:</strong></p>\n                    <p class=\"text-justify\"><strong>KLAROWIN:</strong></p>\n                    <ul>\n                        <li>występuje w postaci proszku,</li>\n                        <li>wiąże w swej strukturze r&oacute;żnego typu substancje, gł&oacute;wnie białka,</li>\n                        <li>stosowany jest gł&oacute;wnie do win białych i r&oacute;żowych,</li>\n                        <li>opakowanie 10 g wystarcza na sklarowanie 10 L płynu.</li>\n                    </ul>\n                    <p class=\"text-justify\"><strong>ŻELATYNA:</strong></p>\n                    <ul>\n                        <li>występuje w formie krystalicznej,</li>\n                        <li>usuwa zmętnienia wywołane obecnością substancji barwnikowych i garbnikowych,</li>\n                        <li>stosowana jest gł&oacute;wnie przy winach czerwonych,</li>\n                        <li>opakowanie 7 g wystarcza na sklarowanie 30-50 L płynu.</li>\n                    </ul>",
        "answerText": "ROŻNICE: KLAROWIN: występuje w postaci proszku, wiąże w swej strukturze różnego typu substancje, głównie białka, stosowany jest głównie do win białych i różowych, opakowanie 10 g wystarcza na sklarowanie 10 L płynu. ŻELATYNA: występuje w formie krystalicznej, usuwa zmętnienia wywołane obecnością substancji barwnikowych i garbnikowych, stosowana jest głównie przy winach czerwonych, opakowanie 7 g wystarcza na sklarowanie 30-50 L płynu."
      },
      {
        "id": "winiarstwo-piwowarstwo-19-kiedy-dodaje-sie-preparaty-klarujace-do-wina",
        "question": "Kiedy dodaje się preparaty klarujące do wina?",
        "answerHtml": "<p class=\"text-justify\">Środki klarujące należy stosować tylko w&oacute;wczas, jeśli jest się w stu\n                        procentach\n                        pewnym, że fermentacja dobiegła końca. W przeciwnym razie powstający w trakcie fermentacji\n                        dwutlenek węgla\n                        będzie uniemożliwiał opadanie cząsteczek zaadsorbowanych przez środki klarujące.</p>",
        "answerText": "Środki klarujące należy stosować tylko wówczas, jeśli jest się w stu procentach pewnym, że fermentacja dobiegła końca. W przeciwnym razie powstający w trakcie fermentacji dwutlenek węgla będzie uniemożliwiał opadanie cząsteczek zaadsorbowanych przez środki klarujące."
      },
      {
        "id": "winiarstwo-piwowarstwo-20-po-co-jest-rurka-fermentacyjna-katowa-do-pojemnikow",
        "question": "Po co jest rurka fermentacyjna kątowa do pojemników?",
        "answerHtml": "<p class=\"text-justify\">Tego rodzaju rurka montowana jest z boku pojemnika fermentacyjnego, dzięki\n                        czemu mogą\n                        one być sztaplowane (układane jeden na drugim).</p>",
        "answerText": "Tego rodzaju rurka montowana jest z boku pojemnika fermentacyjnego, dzięki czemu mogą one być sztaplowane (układane jeden na drugim)."
      },
      {
        "id": "winiarstwo-piwowarstwo-21-nie-moge-wlozyc-korka-walcowego-do-butelki-co-robic",
        "question": "Nie mogę włożyć korka walcowego do butelki, co robić?",
        "answerHtml": "<p class=\"text-justify\">Korki walcowe są korkami szerszymi od średnicy standardowej butelki\n                        zazwyczaj o kilka\n                        milimetr&oacute;w. Jest to celowe, aby korki po zakorkowaniu były szczelne. Butelkę takim\n                        korkiem można\n                        zakorkować tylko przy użyciu korkownicy &ndash; wystarczy ręczna, tzw. młotkowa (tulejka). Przy\n                        większej\n                        ilości butelek proponujemy użycie korkownicy tr&oacute;jramiennej. Korek przed zakorkowaniem\n                        należy\n                        odpowiednio przygotować. W warunkach domowych korki wystarczy zanurzyć na ok. 5 min w gorącej\n                        wodzie lub\n                        umieścić pod przykryciem nad wrzątkiem. Dzięki temu będą one bardziej plastyczne, co ułatwi\n                        korkowanie\n                        butelek.</p>",
        "answerText": "Korki walcowe są korkami szerszymi od średnicy standardowej butelki zazwyczaj o kilka milimetrów. Jest to celowe, aby korki po zakorkowaniu były szczelne. Butelkę takim korkiem można zakorkować tylko przy użyciu korkownicy – wystarczy ręczna, tzw. młotkowa (tulejka). Przy większej ilości butelek proponujemy użycie korkownicy trójramiennej. Korek przed zakorkowaniem należy odpowiednio przygotować. W warunkach domowych korki wystarczy zanurzyć na ok. 5 min w gorącej wodzie lub umieścić pod przykryciem nad wrzątkiem. Dzięki temu będą one bardziej plastyczne, co ułatwi korkowanie butelek."
      },
      {
        "id": "winiarstwo-piwowarstwo-22-czy-lepsza-jest-rurka-szklana-czy-plastikowa",
        "question": "Czy lepsza jest rurka szklana, czy plastikowa?",
        "answerHtml": "<p class=\"text-justify\">Rurka fermentacyjna wypełniona wodą stosowana jest w procesie fermentacji w\n                        celu\n                        zabezpieczenia zawartości nastawu przed natlenieniem, a jednocześnie umożliwia regularne\n                        wydobywanie się\n                        dwutlenku węgla powstającego podczas zachodzącego procesu. Proces ten przebiega prawidłowo\n                        niezależnie od\n                        tego, czy użyjemy rurki szklanej, czy plastikowej. Jednakże rurka plastikowa posiada kilka\n                        praktycznych zalet\n                        &ndash; m.in.: bańki w tego typu rurkach są większe, co powoduje, że nie trzeba dolewać wody\n                        zbyt często, a\n                        ponadto nie ma obawy, że rurka taka zostanie przypadkowo stłuczona.</p>",
        "answerText": "Rurka fermentacyjna wypełniona wodą stosowana jest w procesie fermentacji w celu zabezpieczenia zawartości nastawu przed natlenieniem, a jednocześnie umożliwia regularne wydobywanie się dwutlenku węgla powstającego podczas zachodzącego procesu. Proces ten przebiega prawidłowo niezależnie od tego, czy użyjemy rurki szklanej, czy plastikowej. Jednakże rurka plastikowa posiada kilka praktycznych zalet – m.in.: bańki w tego typu rurkach są większe, co powoduje, że nie trzeba dolewać wody zbyt często, a ponadto nie ma obawy, że rurka taka zostanie przypadkowo stłuczona."
      },
      {
        "id": "winiarstwo-piwowarstwo-23-czy-lepiej-klarowac-czy-filtrowac-wino",
        "question": "Czy lepiej klarować, czy filtrować wino?",
        "answerHtml": "<p class=\"text-justify\">Jeśli chcemy zachować piękny bukiet wina, to proponujemy klarowanie środkiem\n                        odpowiednim\n                        do danego gatunku wina. Wymaga to jednak czasu i cierpliwości. Jeśli zależy nam zatem na czasie,\n                        a wino ma\n                        bardzo intensywny bukiet (wina wysokogarbnikowe), możemy je filtrować przy użyciu r&oacute;żnego\n                        rodzaju\n                        maszyn i filtr&oacute;w. Bardzo dobre i natychmiastowe efekty dają filtry ciśnieniowe. Należy\n                        jednak pamiętać,\n                        że przy takim filtrowaniu tracimy nie tylko pewną ilość bukietu, ale i część garbnik&oacute;w.\n                        Niestety,\n                        czasami klarowanie się nie sprawdza i wtedy pozostaje tylko filtracja. Wino takie można potem\n                        zostawić do\n                        kupażu.</p>",
        "answerText": "Jeśli chcemy zachować piękny bukiet wina, to proponujemy klarowanie środkiem odpowiednim do danego gatunku wina. Wymaga to jednak czasu i cierpliwości. Jeśli zależy nam zatem na czasie, a wino ma bardzo intensywny bukiet (wina wysokogarbnikowe), możemy je filtrować przy użyciu różnego rodzaju maszyn i filtrów. Bardzo dobre i natychmiastowe efekty dają filtry ciśnieniowe. Należy jednak pamiętać, że przy takim filtrowaniu tracimy nie tylko pewną ilość bukietu, ale i część garbników. Niestety, czasami klarowanie się nie sprawdza i wtedy pozostaje tylko filtracja. Wino takie można potem zostawić do kupażu."
      },
      {
        "id": "winiarstwo-piwowarstwo-24-jak-i-po-co-stosowac-ziola-do-aromatyzowania-wina",
        "question": "Jak i po co stosować zioła do aromatyzowania wina?",
        "answerHtml": "<p class=\"text-justify\">Zioła stosujemy, aby uzyskać wino typu wermut. Czasami także wtedy, gdy\n                        uzyskany bukiet\n                        nam nie odpowiada i chcemy go &bdquo;zatuszować&rdquo;.</p>\n                    <p class=\"text-justify\">Wina aromatyzowane można uzyskać następującymi metodami:</p>\n                    <ul>\n                        <ul>\n                            <li>dodając kompozycję zi&oacute;ł bezpośrednio do fermentującego nastawu,</li>\n                            <li>dolewając esencję ziołową przygotowaną w 0,5-1 litrze młodego wina, przed\n                                leżakowaniem.\n                            </li>\n                            <li>zalewając wstępnie zestaw zi&oacute;ł wodą o temp. 70&deg;C, a następnie dodając\n                                spirytus tak, by w\n                                mieszaninie uzyskać 40-50% roztw&oacute;r alkoholu (w tym stężeniu najlepiej ekstrahują\n                                się aromaty).\n                            </li>\n                        </ul>\n                    </ul>\n                    <p class=\"text-justify\">Wina ziołowe po dodaniu esencji powinny leżakować przynajmniej miesiąc.\n                        Korzystnie na\n                        smak, aromat i stabilność wina wpłynie kilku- lub kilkunastodniowe wychłodzenie wina w\n                        temperaturze\n                        3-6&deg;C.</p>",
        "answerText": "Zioła stosujemy, aby uzyskać wino typu wermut. Czasami także wtedy, gdy uzyskany bukiet nam nie odpowiada i chcemy go „zatuszować”. Wina aromatyzowane można uzyskać następującymi metodami: dodając kompozycję ziół bezpośrednio do fermentującego nastawu, dolewając esencję ziołową przygotowaną w 0,5-1 litrze młodego wina, przed leżakowaniem. zalewając wstępnie zestaw ziół wodą o temp. 70°C, a następnie dodając spirytus tak, by w mieszaninie uzyskać 40-50% roztwór alkoholu (w tym stężeniu najlepiej ekstrahują się aromaty). Wina ziołowe po dodaniu esencji powinny leżakować przynajmniej miesiąc. Korzystnie na smak, aromat i stabilność wina wpłynie kilku- lub kilkunastodniowe wychłodzenie wina w temperaturze 3-6°C."
      },
      {
        "id": "winiarstwo-piwowarstwo-25-co-to-sa-drozdze-piwne",
        "question": "Co to są drożdże piwne?",
        "answerHtml": "<p class=\"text-justify\">Drożdże to organizmy względnie beztlenowe. Oznacza to, że w obecności tlenu\n                        zamiast z\n                        fermentacji, korzystają one z bardziej wydajnego procesu oddychania tlenowego. Wszystkie drożdże\n                        piwne\n                        zaliczane są do gatunku Saccharomyces cerevisiae. Wśr&oacute;d drożdży piwowarskich wyr&oacute;żnia\n                        się\n                        jednakże dwie grupy: drożdże g&oacute;rnej i dolnej fermentacji, kt&oacute;re r&oacute;żnią się\n                        zar&oacute;wno\n                        pod względem morfologicznym, jak i fizjologicznym. Dodawane są one do brzeczki piwnej w celu\n                        wywołania\n                        fermentacji alkoholowej. Dzięki zawartemu w nich enzymowi zwanemu zymazą, rozkładają one obecne\n                        w brzeczce\n                        glukozę, fruktozę, sacharozę i maltozę na alkohol etylowy i dwutlenek węgla.</p>",
        "answerText": "Drożdże to organizmy względnie beztlenowe. Oznacza to, że w obecności tlenu zamiast z fermentacji, korzystają one z bardziej wydajnego procesu oddychania tlenowego. Wszystkie drożdże piwne zaliczane są do gatunku Saccharomyces cerevisiae. Wśród drożdży piwowarskich wyróżnia się jednakże dwie grupy: drożdże górnej i dolnej fermentacji, które różnią się zarówno pod względem morfologicznym, jak i fizjologicznym. Dodawane są one do brzeczki piwnej w celu wywołania fermentacji alkoholowej. Dzięki zawartemu w nich enzymowi zwanemu zymazą, rozkładają one obecne w brzeczce glukozę, fruktozę, sacharozę i maltozę na alkohol etylowy i dwutlenek węgla."
      },
      {
        "id": "winiarstwo-piwowarstwo-26-co-zrobic-jesli-po-otwarciu-nagazowanego-piwa-w-ciagu-kilku-sekund-cal",
        "question": "Co zrobić, jeśli po otwarciu nagazowanego piwa w ciągu kilku sekund cały osad unosi się do góry i miesza z piwem, a piwo „ucieka” z butelki w postaci piany?",
        "answerHtml": "<p class=\"text-justify\">To nie jest normalna sytuacja; piwo jest prawdopodobnie przegazowane, tzn.\n                        zawiera zbyt\n                        dużo dwutlenku węgla (CO2). Aby zapobiec przegazowaniu piwa, przed zlaniem go należy\n                        skontrolować ilość cukru,\n                        np. cukromierzem, czy nie zostało jeszcze zbyt wiele niedofermentowanego. Jeśli ilość cukru jest\n                        duża, to piwo\n                        należy pozostawić do dalszej fermentacji lub dodać odrobinę mniej cukru do refermentacji w\n                        butelkach.</p>",
        "answerText": "To nie jest normalna sytuacja; piwo jest prawdopodobnie przegazowane, tzn. zawiera zbyt dużo dwutlenku węgla (CO2). Aby zapobiec przegazowaniu piwa, przed zlaniem go należy skontrolować ilość cukru, np. cukromierzem, czy nie zostało jeszcze zbyt wiele niedofermentowanego. Jeśli ilość cukru jest duża, to piwo należy pozostawić do dalszej fermentacji lub dodać odrobinę mniej cukru do refermentacji w butelkach."
      },
      {
        "id": "winiarstwo-piwowarstwo-27-ile-trwa-warzenie-piwa-jak-dlugo-trzeba-na-nie-czekac",
        "question": "Ile trwa warzenie piwa? Jak długo trzeba na nie czekać?",
        "answerHtml": "<p class=\"text-justify\">Czas potrzebny na przygotowanie piwa &ndash; od momentu &bdquo;wymieszania&rdquo;\n                        surowc&oacute;w\n                        do otwarcia butelki, zależy od rodzaju piwa, jakie warzymy. Piwa ciemne, ciężkie wymagają\n                        dłuższego czasu,\n                        nawet do 6 miesięcy, zaś lekkie jasne piwa mogą być gotowe do picia już po 5 tygodniach. Należy\n                        jednak\n                        pamiętać, że im dłużej piwo dojrzewa i nabiera lepszego bukietu, tym osad robi się cięższy i\n                        pozostaje na dnie\n                        butelki, dzięki czemu piwo lepiej smakuje.</p>\n                    <p class=\"text-justify\">Przykładowo, warzenie piwa Lager, Jasne Pełne (brew-kit) wymaga\n                        odpowiednio:</p>\n                    <ul>\n                        <li>fermentacja gł&oacute;wna: ok. 7 dni;</li>\n                        <li>dojrzewanie w butelkach: ok. 14 dni;</li>\n                        <li>leżakowanie w butelkach: 7-10 dni.</li>\n                    </ul>\n                    <p class=\"text-justify\">W sumie: ok. 5 tygodni.</p>",
        "answerText": "Czas potrzebny na przygotowanie piwa – od momentu „wymieszania” surowców do otwarcia butelki, zależy od rodzaju piwa, jakie warzymy. Piwa ciemne, ciężkie wymagają dłuższego czasu, nawet do 6 miesięcy, zaś lekkie jasne piwa mogą być gotowe do picia już po 5 tygodniach. Należy jednak pamiętać, że im dłużej piwo dojrzewa i nabiera lepszego bukietu, tym osad robi się cięższy i pozostaje na dnie butelki, dzięki czemu piwo lepiej smakuje. Przykładowo, warzenie piwa Lager, Jasne Pełne (brew-kit) wymaga odpowiednio: fermentacja główna: ok. 7 dni; dojrzewanie w butelkach: ok. 14 dni; leżakowanie w butelkach: 7-10 dni. W sumie: ok. 5 tygodni."
      },
      {
        "id": "winiarstwo-piwowarstwo-28-czy-podczas-warzenia-brew-kitow-wydzielaja-sie-nieprzyjemne-zapachy",
        "question": "Czy podczas warzenia Brew-kitów wydzielają się nieprzyjemne zapachy?",
        "answerHtml": "<p class=\"text-justify\">Podczas warzenia Brew-kit&oacute;w nie ma mowy o nieprzyjemnych zapachach.\n                        Podczas\n                        zalewania i mieszania składnik&oacute;w w kuchni unosi się swoisty, słodowy aromat, zaś podczas\n                        pierwszych 3-4\n                        dni fermentacji z fermentora wydobywać się będzie delikatny, przyjemny zapach fermentującego\n                        piwa.</p>",
        "answerText": "Podczas warzenia Brew-kitów nie ma mowy o nieprzyjemnych zapachach. Podczas zalewania i mieszania składników w kuchni unosi się swoisty, słodowy aromat, zaś podczas pierwszych 3-4 dni fermentacji z fermentora wydobywać się będzie delikatny, przyjemny zapach fermentującego piwa."
      },
      {
        "id": "winiarstwo-piwowarstwo-29-czy-mozna-zastosowac-bentonit-do-klarowania-piwa",
        "question": "Czy można zastosować bentonit do klarowania piwa?",
        "answerHtml": "<p class=\"text-justify\">Bentonit był i ciągle jeszcze bywa stosowany w piwowarstwie. Jego działanie\n                        polega na\n                        adsorpcji białek, co zabezpiecza piwo przed tzw. zmętnieniem na zimno. Dzisiaj skuteczniejsze\n                        jest stosowanie\n                        żeli i zoli krzemowych, zatem w piwowarstwie do mowym raczej nie polecamy bentonitu.</p>",
        "answerText": "Bentonit był i ciągle jeszcze bywa stosowany w piwowarstwie. Jego działanie polega na adsorpcji białek, co zabezpiecza piwo przed tzw. zmętnieniem na zimno. Dzisiaj skuteczniejsze jest stosowanie żeli i zoli krzemowych, zatem w piwowarstwie do mowym raczej nie polecamy bentonitu."
      },
      {
        "id": "winiarstwo-piwowarstwo-30-czy-do-sterylizacji-butelek-mozna-uzyc-kuchenki-mikrofalowej",
        "question": "Czy do sterylizacji butelek można użyć kuchenki mikrofalowej?",
        "answerHtml": "<p class=\"text-justify\">Oczywiście, mikrofale są stosowane do dezynfekcji / sterylizacji rozmaitych\n                        obiekt&oacute;w.\n                        Czynnikiem dezynfekującym jest w istocie temperatura generowana poprzez absorbujące\n                        promieniowanie cząsteczki\n                        wody. Dwuminutowa ekspozycja czystej, wilgotnej butelki w domowej kuchence mikrofalowej powinna\n                        wystarczyć.</p>",
        "answerText": "Oczywiście, mikrofale są stosowane do dezynfekcji / sterylizacji rozmaitych obiektów. Czynnikiem dezynfekującym jest w istocie temperatura generowana poprzez absorbujące promieniowanie cząsteczki wody. Dwuminutowa ekspozycja czystej, wilgotnej butelki w domowej kuchence mikrofalowej powinna wystarczyć."
      }
    ]
  },
  {
    "id": "termometry-higrometry-stacje-pogody",
    "title": "Termometry, higrometry i stacje pogody",
    "questions": [
      {
        "id": "termometry-higrometry-stacje-pogody-1-jak-dziala-termometr-bimetaliczny",
        "question": "Jak działa termometr bimetaliczny?",
        "answerHtml": "<p class=\"text-justify\">Zasada działania termometr&oacute;w bimetalicznych oparta jest na\n                        wykorzystaniu zjawiska\n                        r&oacute;żnej rozszerzalności termicznej metali. Pomiar temperatury odbywa się za pomocą\n                        czujnika\n                        bimetalicznego. Elementem pomiarowym (termoelementem) jest specjalna spirala wykonana z dw&oacute;ch\n                        sklejonych pask&oacute;w taśmy metalowej: stalowej oraz miedzianej &ndash; mających r&oacute;żne\n                        wartości wsp&oacute;łczynnika\n                        rozszerzalności temperaturowej. Jeden koniec taśmy przymocowany jest do drucika, kt&oacute;rego\n                        obr&oacute;t\n                        powoduje bezpośrednio ruch wskaz&oacute;wki. Drugi koniec taśmy przymocowany jest do znajdującej\n                        się na końcu\n                        tulejki śruby, kt&oacute;ra służy do zerowania termometru, a także jest elementem przewodzącym\n                        ciepło. Pod\n                        wpływem wzrostu temperatury taśma wygina się w kierunku metalu o mniejszej rozszerzalności,\n                        powodując ruch\n                        wskaz&oacute;wki.</p>",
        "answerText": "Zasada działania termometrów bimetalicznych oparta jest na wykorzystaniu zjawiska różnej rozszerzalności termicznej metali. Pomiar temperatury odbywa się za pomocą czujnika bimetalicznego. Elementem pomiarowym (termoelementem) jest specjalna spirala wykonana z dwóch sklejonych pasków taśmy metalowej: stalowej oraz miedzianej – mających różne wartości współczynnika rozszerzalności temperaturowej. Jeden koniec taśmy przymocowany jest do drucika, którego obrót powoduje bezpośrednio ruch wskazówki. Drugi koniec taśmy przymocowany jest do znajdującej się na końcu tulejki śruby, która służy do zerowania termometru, a także jest elementem przewodzącym ciepło. Pod wpływem wzrostu temperatury taśma wygina się w kierunku metalu o mniejszej rozszerzalności, powodując ruch wskazówki."
      },
      {
        "id": "termometry-higrometry-stacje-pogody-2-co-to-jest-higrometr",
        "question": "Co to jest higrometr?",
        "answerHtml": "<p class=\"text-justify\">Jest to przyrząd, kt&oacute;rego podstawową funkcją jest pomiar wilgotności\n                        względnej\n                        powietrza.</p>",
        "answerText": "Jest to przyrząd, którego podstawową funkcją jest pomiar wilgotności względnej powietrza."
      },
      {
        "id": "termometry-higrometry-stacje-pogody-3-co-nazywamy-wilgotnoscia-wzgledna",
        "question": "Co nazywamy wilgotnością względną?",
        "answerHtml": "<p class=\"text-justify\">Wilgotność względna określa stosunek rzeczywistej ilości pary wodnej\n                        zawartej w\n                        powietrzu do maksymalnej zawartości pary wodnej w powietrzu przy całkowitym nasyceniu (100%\n                        wilgotności)\n                        &ndash; przy tym samym ciśnieniu i temperaturze. Uwaga: w powietrzu cieplejszym mieści się\n                        więcej pary wodnej,\n                        niż w powietrzu zimniejszym, przy tym samym ciśnieniu. Dlatego też ochłodzenie powoduje\n                        nasycenie powietrza\n                        parą wodną i jej kondensację, czyli zamianę w wodę (rosa, mgła, chmura).</p>",
        "answerText": "Wilgotność względna określa stosunek rzeczywistej ilości pary wodnej zawartej w powietrzu do maksymalnej zawartości pary wodnej w powietrzu przy całkowitym nasyceniu (100% wilgotności) – przy tym samym ciśnieniu i temperaturze. Uwaga: w powietrzu cieplejszym mieści się więcej pary wodnej, niż w powietrzu zimniejszym, przy tym samym ciśnieniu. Dlatego też ochłodzenie powoduje nasycenie powietrza parą wodną i jej kondensację, czyli zamianę w wodę (rosa, mgła, chmura)."
      },
      {
        "id": "termometry-higrometry-stacje-pogody-4-jak-dziala-higrometr-bimetaliczny",
        "question": "Jak działa higrometr bimetaliczny?",
        "answerHtml": "<p class=\"text-justify\">Higrometr bimetaliczny posiada śrubowo zwinięty bimetal złożony ze\n                        specjalnie dobranych\n                        materiał&oacute;w o wysokiej stabilności termicznej. Zasada ich działania polega na zmianie ich\n                        długości pod\n                        wpływem zmian wilgotności powietrza. Zjawisko to powoduje poruszanie wskaz&oacute;wki, kt&oacute;ra\n                        obraca się\n                        wok&oacute;ł skali.</p>",
        "answerText": "Higrometr bimetaliczny posiada śrubowo zwinięty bimetal złożony ze specjalnie dobranych materiałów o wysokiej stabilności termicznej. Zasada ich działania polega na zmianie ich długości pod wpływem zmian wilgotności powietrza. Zjawisko to powoduje poruszanie wskazówki, która obraca się wokół skali."
      },
      {
        "id": "termometry-higrometry-stacje-pogody-5-co-to-jest-cisnienie-atmosferyczne",
        "question": "Co to jest ciśnienie atmosferyczne?",
        "answerHtml": "<p class=\"text-justify\">Jest to ciśnienie, jakie wywierane jest przez atmosferę, zatem jest to\n                        ciężar warstwy\n                        powietrza, kt&oacute;re znajduje się nad jednostką powierzchni.</p>",
        "answerText": "Jest to ciśnienie, jakie wywierane jest przez atmosferę, zatem jest to ciężar warstwy powietrza, które znajduje się nad jednostką powierzchni."
      },
      {
        "id": "termometry-higrometry-stacje-pogody-6-co-warto-wiedziec-o-jednostce-cisnienia",
        "question": "Co warto wiedzieć o jednostce ciśnienia?",
        "answerHtml": "<p class=\"text-justify\">Kiedyś ciśnienie atmosferyczne mierzono w milimetrach słupka rtęci (mm Hg).\n                        Aktualnie\n                        występującą w układzie SI jednostką ciśnienia atmosferycznego jest Pascal (Pa). Ponieważ\n                        wartości podawane w\n                        Pascalach byłyby ogromne, to wartości ciśnienia atmosferycznego podaje się w hektopaskalach (1\n                        hPa = 100 Pa).\n                        Zależność między starą a nową jednostką przedstawia się następująco: 750 mm Hg = 1000 hPa</p>",
        "answerText": "Kiedyś ciśnienie atmosferyczne mierzono w milimetrach słupka rtęci (mm Hg). Aktualnie występującą w układzie SI jednostką ciśnienia atmosferycznego jest Pascal (Pa). Ponieważ wartości podawane w Pascalach byłyby ogromne, to wartości ciśnienia atmosferycznego podaje się w hektopaskalach (1 hPa = 100 Pa). Zależność między starą a nową jednostką przedstawia się następująco: 750 mm Hg = 1000 hPa"
      },
      {
        "id": "termometry-higrometry-stacje-pogody-7-dlaczego-termometry-zaokienne-wyblakly",
        "question": "Dlaczego termometry zaokienne wyblakły?",
        "answerHtml": "<p class=\"text-justify\">Jest to efekt identyczny jak ten, kt&oacute;ry zachodzi w przypadku plakat&oacute;w\n                        wystawionych na długą ekspozycję słoneczną. Termometry posiadają nadruk wykonany farbą na\n                        podkładce\n                        tekturowej, dlatego najlepiej montować je w miejscu nienarażonym na bezpośrednie działanie\n                        promieni\n                        słonecznych. Informacja ta znajduje się w opisach naszych produkt&oacute;w. Ponadto bezpośrednie\n                        działanie\n                        promieni słonecznych na termometr fałszuje odczyt rzeczywistej temperatury.</p>",
        "answerText": "Jest to efekt identyczny jak ten, który zachodzi w przypadku plakatów wystawionych na długą ekspozycję słoneczną. Termometry posiadają nadruk wykonany farbą na podkładce tekturowej, dlatego najlepiej montować je w miejscu nienarażonym na bezpośrednie działanie promieni słonecznych. Informacja ta znajduje się w opisach naszych produktów. Ponadto bezpośrednie działanie promieni słonecznych na termometr fałszuje odczyt rzeczywistej temperatury."
      }
    ]
  },
  {
    "id": "inne",
    "title": "Inne",
    "questions": [
      {
        "id": "inne-1-co-to-jest-sokownik",
        "question": "Co to jest sokownik?",
        "answerHtml": "<p class=\"text-justify\">Jest to naczynie składające się z trzech ułożonych na sobie element&oacute;w:</p>\n                    <ul>\n                        <li>naczynie dolne, do kt&oacute;rego wlewa się wodę w celu uparowania owoc&oacute;w;</li>\n                        <li>naczynie środkowe, do kt&oacute;rego spływa wyizolowany pod wpływem pary sok z owoc&oacute;w;</li>\n                        <li>naczynie g&oacute;rne, w kt&oacute;rym umieszcza się owoce.</li>\n                    </ul>\n                    <p class=\"text-justify\">Sokownik służy do izolacji soku z owoc&oacute;w pod wpływem gorącej pary\n                        wodnej, bez\n                        utraty dużej ilości witamin.</p>",
        "answerText": "Jest to naczynie składające się z trzech ułożonych na sobie elementów: naczynie dolne, do którego wlewa się wodę w celu uparowania owoców; naczynie środkowe, do którego spływa wyizolowany pod wpływem pary sok z owoców; naczynie górne, w którym umieszcza się owoce. Sokownik służy do izolacji soku z owoców pod wpływem gorącej pary wodnej, bez utraty dużej ilości witamin."
      },
      {
        "id": "inne-2-jakie-sa-zalety-saletry-potasowej",
        "question": "Jakie są zalety saletry potasowej?",
        "answerHtml": "<p class=\"text-justify\">Saletra potasowa (azotan potasu) jest obok soli kuchennej najważniejszym\n                        dodatkiem przy\n                        peklowaniu mięsa. Dodatek ten gwarantuje zachowanie jego r&oacute;żowej barwy. W pierwszym\n                        etapie peklowania\n                        pochodzące z saletry jony azotanowe pod wpływem enzym&oacute;w zawartych w mięsie zostają\n                        zredukowane do\n                        azotyn&oacute;w. W drugim etapie jony azotynowe reagują z mioglobiną, białkiem odpowiedzialnym\n                        za r&oacute;żową\n                        (ale nietrwałą) barwę mięsa. Produktem reakcji jest nitrozomioglobina o trwałej, r&oacute;żowej\n                        barwie, nawet\n                        w wyższych temperaturach. Stosowanie saletry potasowej zawierającej jedynie jony azotanowe jest\n                        zdrowsze i\n                        bezpieczniejsze od dostępnych na rynku mieszanek peklujących zawierających azotyny, kt&oacute;re\n                        w przypadku\n                        nawet niewielkiego przedawkowania mogą okazać się szkodliwe dla naszego zdrowia.</p>",
        "answerText": "Saletra potasowa (azotan potasu) jest obok soli kuchennej najważniejszym dodatkiem przy peklowaniu mięsa. Dodatek ten gwarantuje zachowanie jego różowej barwy. W pierwszym etapie peklowania pochodzące z saletry jony azotanowe pod wpływem enzymów zawartych w mięsie zostają zredukowane do azotynów. W drugim etapie jony azotynowe reagują z mioglobiną, białkiem odpowiedzialnym za różową (ale nietrwałą) barwę mięsa. Produktem reakcji jest nitrozomioglobina o trwałej, różowej barwie, nawet w wyższych temperaturach. Stosowanie saletry potasowej zawierającej jedynie jony azotanowe jest zdrowsze i bezpieczniejsze od dostępnych na rynku mieszanek peklujących zawierających azotyny, które w przypadku nawet niewielkiego przedawkowania mogą okazać się szkodliwe dla naszego zdrowia."
      },
      {
        "id": "inne-3-czy-krety-ryja-zima",
        "question": "Czy krety „ryją” zimą?",
        "answerHtml": "<p class=\"text-justify\">Krety \"ryją\" na działkach r&oacute;wnież zimą (oczywiście mniej\n                        intensywnie). Tym samym\n                        nieprawdziwe jest porzekadło, że \"jak krety ryją, to już będzie wiosna\". Zwierzęta te ryją w\n                        zimie głębiej, w\n                        warstwach niezamarzniętej ziemi. Jeśli zima jest niezbyt sroga, to robią kopce na powierzchni,\n                        dostarczając w\n                        ten spos&oacute;b tlenu do korytarza i zapewniając sobie lepszą orientację w kwestiach\n                        pogody.</p>",
        "answerText": "Krety \"ryją\" na działkach również zimą (oczywiście mniej intensywnie). Tym samym nieprawdziwe jest porzekadło, że \"jak krety ryją, to już będzie wiosna\". Zwierzęta te ryją w zimie głębiej, w warstwach niezamarzniętej ziemi. Jeśli zima jest niezbyt sroga, to robią kopce na powierzchni, dostarczając w ten sposób tlenu do korytarza i zapewniając sobie lepszą orientację w kwestiach pogody."
      },
      {
        "id": "inne-4-co-to-jest-to-miareczkowanie",
        "question": "Co to jest to miareczkowanie?",
        "answerHtml": "<p class=\"text-justify\">Jest to technika analityczna pozwalająca oznaczyć ilościowo konkretną\n                        substancję\n                        (analit) rozpuszczoną w pr&oacute;bce. W miareczkowaniu wykorzystuje się kompletną reakcję\n                        chemiczną pomiędzy\n                        analitem i dodawanym do pr&oacute;bki reagentem (titrantem) o znanym stężeniu.</p>",
        "answerText": "Jest to technika analityczna pozwalająca oznaczyć ilościowo konkretną substancję (analit) rozpuszczoną w próbce. W miareczkowaniu wykorzystuje się kompletną reakcję chemiczną pomiędzy analitem i dodawanym do próbki reagentem (titrantem) o znanym stężeniu."
      },
      {
        "id": "inne-5-co-to-jest-sacharoza",
        "question": "Co to jest sacharoza?",
        "answerHtml": "<p class=\"text-justify\">Jest to zwyczajny cukier stołowy, otrzymywany z trzciny cukrowej lub burak&oacute;w\n                        cukrowych. Wz&oacute;r sumaryczny sacharozy: C12H22O11. Sacharoza składa się z dw&oacute;ch cukr&oacute;w\n                        prostych: glukozy i fruktozy, dlatego jest zaliczana do disacharyd&oacute;w\n                        (dwucukr&oacute;w).</p>",
        "answerText": "Jest to zwyczajny cukier stołowy, otrzymywany z trzciny cukrowej lub buraków cukrowych. Wzór sumaryczny sacharozy: C12H22O11. Sacharoza składa się z dwóch cukrów prostych: glukozy i fruktozy, dlatego jest zaliczana do disacharydów (dwucukrów)."
      },
      {
        "id": "inne-6-co-to-jest-dekstroza",
        "question": "Co to jest dekstroza?",
        "answerHtml": "<p class=\"text-justify\">Jest to najważniejszy &bdquo;cukier prosty&rdquo;, og&oacute;lnie zwany\n                        &bdquo;cukrem\n                        gronowym&rdquo;, a w medycynie &bdquo;glukozą&rdquo;. Dekstroza jest cukrem występującym\n                        naturalnie np. w\n                        słodkich owocach i miodzie. Pozyskuje się ją także ze skrobi, np. kukurydzianej.</p>",
        "answerText": "Jest to najważniejszy „cukier prosty”, ogólnie zwany „cukrem gronowym”, a w medycynie „glukozą”. Dekstroza jest cukrem występującym naturalnie np. w słodkich owocach i miodzie. Pozyskuje się ją także ze skrobi, np. kukurydzianej."
      },
      {
        "id": "inne-7-co-to-jest-fruktoza",
        "question": "Co to jest fruktoza?",
        "answerHtml": "<p class=\"text-justify\">Jest to cukier owocowy, monosacharyd występujący w stanie wolnym (w owocach,\n                        miodzie i\n                        nektarze kwiat&oacute;w) oraz związanym (m.in. wchodzi wraz z glukozą w skład sacharozy, a także\n                        inuliny).</p>",
        "answerText": "Jest to cukier owocowy, monosacharyd występujący w stanie wolnym (w owocach, miodzie i nektarze kwiatów) oraz związanym (m.in. wchodzi wraz z glukozą w skład sacharozy, a także inuliny)."
      },
      {
        "id": "inne-8-co-to-zacier-gorzelniczy",
        "question": "Co to zacier gorzelniczy?",
        "answerHtml": "<p class=\"text-justify\">W znaczeniu potocznym zacier kojarzony jest z domowym gorzelnictwem &ndash;\n                        w&oacute;wczas\n                        można powiedzieć, że jest mieszaniną wody z dodatkiem cukru lub wysokosłodzonych przetwor&oacute;w\n                        owocowych.\n                        Typowy zacier do cel&oacute;w gorzelniczych przygotowuje się z ziemniak&oacute;w, zb&oacute;ż\n                        lub owoc&oacute;w.\n                        Proces zacierania można prowadzić przy użyciu preparat&oacute;w enzymatycznych pochodzenia\n                        mikrobiologicznego,\n                        zawierających &alpha;-amylazę, amyloglukozydazę oraz pullulanazę. Po procesie fermentacji\n                        powstały alkohol\n                        etylowy oddestylowuje się.</p>",
        "answerText": "W znaczeniu potocznym zacier kojarzony jest z domowym gorzelnictwem – wówczas można powiedzieć, że jest mieszaniną wody z dodatkiem cukru lub wysokosłodzonych przetworów owocowych. Typowy zacier do celów gorzelniczych przygotowuje się z ziemniaków, zbóż lub owoców. Proces zacierania można prowadzić przy użyciu preparatów enzymatycznych pochodzenia mikrobiologicznego, zawierających α-amylazę, amyloglukozydazę oraz pullulanazę. Po procesie fermentacji powstały alkohol etylowy oddestylowuje się."
      },
      {
        "id": "inne-9-co-to-jest-destylacja",
        "question": "Co to jest destylacja?",
        "answerHtml": "<p class=\"text-justify\">Jest to rozdzielanie ciekłej mieszaniny wieloskładnikowej poprzez\n                        odparowywanie, a\n                        następnie skroplenie jej składnik&oacute;w. Stosuje się ją w celu wyizolowania lub oczyszczenia\n                        jednego lub\n                        więcej związk&oacute;w składowych. Proces wykorzystuje r&oacute;żną lotność względną składnik&oacute;w\n                        mieszaniny. Gł&oacute;wny produkt destylacji (czyli skroplona ciecz) nazywany jest\n                        destylatem.</p>",
        "answerText": "Jest to rozdzielanie ciekłej mieszaniny wieloskładnikowej poprzez odparowywanie, a następnie skroplenie jej składników. Stosuje się ją w celu wyizolowania lub oczyszczenia jednego lub więcej związków składowych. Proces wykorzystuje różną lotność względną składników mieszaniny. Główny produkt destylacji (czyli skroplona ciecz) nazywany jest destylatem."
      },
      {
        "id": "inne-10-czym-jest-sztaplowanie",
        "question": "Czym jest sztaplowanie?",
        "answerHtml": "<p class=\"text-justify\">Jest to układanie czegoś jedno na drugim. Pojęcia tego często używa się w\n                        kontekście\n                        ustawiania pojemnik&oacute;w fermentacyjnych w jednej kolumnie.</p>",
        "answerText": "Jest to układanie czegoś jedno na drugim. Pojęcia tego często używa się w kontekście ustawiania pojemników fermentacyjnych w jednej kolumnie."
      },
      {
        "id": "inne-11-co-to-jest-stopien-fahrenheita",
        "question": "Co to jest stopień Fahrenheita?",
        "answerHtml": "<p class=\"text-justify\">Jest to najstarsza znana skala stosowana do pomiaru temperatury, nazwana tak\n                        od nazwiska\n                        jej tw&oacute;rcy &ndash; Daniela G. Fahrenheita, aktualnie stosowana gł&oacute;wnie w krajach\n                        anglosaskich. W\n                        skali Fahrenheita temperatura punkt&oacute;w termometrycznych skali Celsjusza wynosi:</p>\n                    <ul>\n                        <li>32&deg;F &ndash; temperatura topnienia lodu (0&deg;C)</li>\n                        <li>212&deg;F &ndash; temperatura wrzenia wody (100&deg;C)</li>\n                    </ul>\n                    <p class=\"text-justify\">180&deg;F odpowiada 100&deg;C i dlatego 1.8&deg;F = 1&deg;C</p>",
        "answerText": "Jest to najstarsza znana skala stosowana do pomiaru temperatury, nazwana tak od nazwiska jej twórcy – Daniela G. Fahrenheita, aktualnie stosowana głównie w krajach anglosaskich. W skali Fahrenheita temperatura punktów termometrycznych skali Celsjusza wynosi: 32°F – temperatura topnienia lodu (0°C) 212°F – temperatura wrzenia wody (100°C) 180°F odpowiada 100°C i dlatego 1.8°F = 1°C"
      },
      {
        "id": "inne-12-co-to-jest-ciecz-termometryczna",
        "question": "Co to jest ciecz termometryczna?",
        "answerHtml": "<p class=\"text-justify\">Jest to mieszanina, w skład kt&oacute;rej wchodzi toluen (stosowany jako\n                        rozpuszczalnik)\n                        z naftą oraz barwnik spożywczy. Mieszanina ta charakteryzuje się niską temperaturą krzepnięcia,\n                        wysoką\n                        temperaturą wrzenia oraz dużą rozszerzalnością cieplną.</p>",
        "answerText": "Jest to mieszanina, w skład której wchodzi toluen (stosowany jako rozpuszczalnik) z naftą oraz barwnik spożywczy. Mieszanina ta charakteryzuje się niską temperaturą krzepnięcia, wysoką temperaturą wrzenia oraz dużą rozszerzalnością cieplną."
      }
    ]
  },
  {
    "id": "proces-zakupowy",
    "title": "Proces zakupowy",
    "questions": [
      {
        "id": "proces-zakupowy-1-czy-mozna-anulowac-zlozone-zamowienie",
        "question": "Czy można anulować złożone zamówienie?",
        "answerHtml": "<p class=\"text-justify\">Istnieje taka możliwość. Po złożeniu zam&oacute;wienia w sklepie\n                        internetowym Klient\n                        otrzymuje maila z informacją o przyjęciu zam&oacute;wienia. Jeżeli chce zrezygnować z zam&oacute;wienia,\n                        powinien napisać maila z informacją o rezygnacji lub zadzwonić pod podany w mailu numer\n                        telefonu.</p>",
        "answerText": "Istnieje taka możliwość. Po złożeniu zamówienia w sklepie internetowym Klient otrzymuje maila z informacją o przyjęciu zamówienia. Jeżeli chce zrezygnować z zamówienia, powinien napisać maila z informacją o rezygnacji lub zadzwonić pod podany w mailu numer telefonu."
      },
      {
        "id": "proces-zakupowy-2-platnosci-w-jaki-sposob-mozna-zaplacic-za-zamowiony-towar",
        "question": "Płatności – w jaki sposób można zapłacić za zamówiony towar?",
        "answerHtml": "<p class=\"text-justify\">Płatności można dokonać przelewem elektronicznym na konto podane na stronie\n                        www lub w\n                        mailu potwierdzającym przyjęcie zam&oacute;wienia. Za zam&oacute;wione produkty można zapłacić r&oacute;wnież\n                        got&oacute;wką przy odbiorze towaru (za pobraniem). Jeżeli Klientowi odpowiada inna forma\n                        płatności, powinien\n                        skontaktować się ze sklepem i ustalić szczeg&oacute;ły.</p>",
        "answerText": "Płatności można dokonać przelewem elektronicznym na konto podane na stronie www lub w mailu potwierdzającym przyjęcie zamówienia. Za zamówione produkty można zapłacić również gotówką przy odbiorze towaru (za pobraniem). Jeżeli Klientowi odpowiada inna forma płatności, powinien skontaktować się ze sklepem i ustalić szczegóły."
      },
      {
        "id": "proces-zakupowy-3-jakie-sposoby-wysylki-sa-dostepne",
        "question": "Jakie sposoby wysyłki są dostępne?",
        "answerHtml": "<p class=\"text-justify\">Zam&oacute;wiony produkt, w zależności od preferencji Klienta, wysyłamy za\n                        pośrednictwem\n                        Poczty Polskiej lub firmy kurierskiej.</p>",
        "answerText": "Zamówiony produkt, w zależności od preferencji Klienta, wysyłamy za pośrednictwem Poczty Polskiej lub firmy kurierskiej."
      },
      {
        "id": "proces-zakupowy-4-jak-uzyskac-fakture-vat-za-zakupione-produkty",
        "question": "Jak uzyskać fakturę VAT za zakupione produkty?",
        "answerHtml": "<p class=\"text-justify\">W trakcie składania zam&oacute;wienia należy wpisać dane niezbędne do\n                        otrzymania faktury\n                        oraz zaznaczyć opcję &bdquo;faktura&rdquo; przed zatwierdzeniem zam&oacute;wienia.</p>",
        "answerText": "W trakcie składania zamówienia należy wpisać dane niezbędne do otrzymania faktury oraz zaznaczyć opcję „faktura” przed zatwierdzeniem zamówienia."
      },
      {
        "id": "proces-zakupowy-5-czy-mozna-sprawdzic-zawartosc-paczki-przed-uiszczeniem-oplaty-u-kurier",
        "question": "Czy można sprawdzić zawartość paczki przed uiszczeniem opłaty u kuriera?",
        "answerHtml": "<p class=\"text-justify\">Niestety nie, ale należy sprawdzić, czy paczka jest w nienaruszonym stanie.\n                        Jeżeli\n                        zauważy się ingerencję w zawartość paczki, proszę zgłosić to kurierowi, a po uiszczeniu opłaty\n                        za paczkę,\n                        otworzyć ją przy kurierze, sprawdzić zawartość i w razie stwierdzenia brak&oacute;w lub\n                        jakichkolwiek\n                        uszkodzeń, można zażądać spisania protokołu.</p>",
        "answerText": "Niestety nie, ale należy sprawdzić, czy paczka jest w nienaruszonym stanie. Jeżeli zauważy się ingerencję w zawartość paczki, proszę zgłosić to kurierowi, a po uiszczeniu opłaty za paczkę, otworzyć ją przy kurierze, sprawdzić zawartość i w razie stwierdzenia braków lub jakichkolwiek uszkodzeń, można zażądać spisania protokołu."
      },
      {
        "id": "proces-zakupowy-6-jak-nalezy-postapic-gdy-nie-otrzyma-sie-maila-potwierdzajacego-zlozeni",
        "question": "Jak nalezy postąpić, gdy nie otrzyma się maila potwierdzającego złożenia zamówienia?",
        "answerHtml": "<p class=\"text-justify\">Należy natychmiast skontaktować się z nami &ndash; być może transakcja nie\n                        została\n                        prawidłowo przeprowadzona lub przez pomyłkę został wpisany zły adres mailowy. Brak maila\n                        potwierdzającego może\n                        r&oacute;wnież oznaczać, że zam&oacute;wienie jeszcze nie zostało zarejestrowane.</p>",
        "answerText": "Należy natychmiast skontaktować się z nami – być może transakcja nie została prawidłowo przeprowadzona lub przez pomyłkę został wpisany zły adres mailowy. Brak maila potwierdzającego może również oznaczać, że zamówienie jeszcze nie zostało zarejestrowane."
      },
      {
        "id": "proces-zakupowy-7-co-zrobic-gdy-w-trakcie-skladania-zamowienia-wybrana-zostala-zla-opcja",
        "question": "Co zrobić, gdy w trakcie składania zamówienia wybrana została zła opcja zapłaty?",
        "answerHtml": "<p class=\"text-justify\">Należy skontaktować się z nami mailowo lub telefonicznie. Złożonego zam&oacute;wienia\n                        nie można już cofnąć, ale zrobimy co w naszej mocy, aby umożliwić wygodny spos&oacute;b zapłaty\n                        za towar.</p>",
        "answerText": "Należy skontaktować się z nami mailowo lub telefonicznie. Złożonego zamówienia nie można już cofnąć, ale zrobimy co w naszej mocy, aby umożliwić wygodny sposób zapłaty za towar."
      }
    ]
  }
] satisfies FaqCategory[];
