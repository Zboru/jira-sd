# Jira SD Helper

Wtyczka pomagająca w codziennej pracy na Service Desk poprzez dodanie niestandardowych funkcjonalności skierowanych ku produktywności.

## Aktualna lista funkcji:
* Wyświetlanie statusów wątków wewnętrznych na liście zgłoszeń
* Powiadomienia push związane z nowo-dodanymi zgłoszeniami przez klienta

## Instalacja

Instalacja ogranicza się do kilku prostych kroków. Klonujemy repozytorium, pobieramy zależności i 'budujemy' kod za pomocą `npm run build`.

Następnie przechodzimy do przeglądarki Chrome* i w pasku adresu wklejamy `chrome://extensions`. Tam uruchamiamy tryb dewelopera w prawym górnym rogu i wskazujemy folder repozytorium poprzez przycisk "Załaduj rozpakowane".

Wtyczka powinna być dostępna z poziomu ikony wtyczek obok paska adresu. Tam możemy skonfigurować nasze dane dostępowe do JIRA. Należy podać adres e-mail oraz wygenerowany Token API. Token możemy wygenerować pod adresem `https://id.atlassian.com/manage-profile/security/api-tokens`, w ustawieniach jest również odnośnik prowadzący na tę stronę.

Po zapisaniu odpowiednich danych wtyczka powinna wskazać ich prawidłowość i po odświeżeniu strony zgłoszeń powinniśmy zobaczyć poprawne funkcjonowanie poprzez wyświetlanie statusów wątków wewnętrznych.

\**Do działania wtyczki wymagana jest przeglądarka oparta o Chromium, ponieważ fundament wtyczki jest oparty o manifest w wersji 3, którego przykładowo przeglądarka Firefox tymczasowo nie wspiera (planowane wsparcie w 2023r)*

## Powiadomienia push

Do poprawnego funkcjonowania powiadomień push związanych z nowymi zgłoszeniami wystarczy przełączyć switch oraz podać kwerendę JQL. Widoczny przykład kwerendy JQL można sprawdzić na widoku filtrów. Po wklejeniu i zapisaniu kwerendy, wtyczka powinna co 60s skanować nowe zgłoszenia i wyświetlać je jako powiadomienia.

 Do wyświetlania powiadmień nie jest wymagana włączona karta z kolejką zgłoszeń, wystarczy że przeglądarka jest uruchomiona.

## Dodatkowe informacje
Aby wtyczka pokazywała poprawnie statusy wątków wewnętrznych, trzeba włączyć wyświetlanie kolumny "Key" w tabeli zgłoszeń.