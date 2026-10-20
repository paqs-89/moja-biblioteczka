# 📚 Moja Prywatna Biblioteczka (PWA + JSON na GitHubie)

Aplikacja **Progressive Web App (PWA)** do prowadzenia prywatnej biblioteczki domowej. Prezentuje książki na realistycznym drewnianym regale (w widoku **okładek 3D** lub **grzbietów książek**), automatycznie pobiera okładki i metadane po numerze **ISBN** oraz przechowuje bazę w pliku [`data/books.json`](./data/books.json) synchronizowanym z darmowym kontem **GitHub**.

---

## ✨ Główne funkcje

1. **Wizualna półka z książkami**:
   - **Widok Okładek 3D** — książki stoją przodem na drewnianych półkach z efektem grubości kartek, wstążką statusu, oceną gwiazdkową i nazwą sklepu.
   - **Widok Grzbietów** — książki stoją bokiem obok siebie (szerokość grzbietu dopasowana do liczby stron), a po najechaniu wyświetla się podgląd okładki.
   - **4 motywy drewna regału**: *Klasyczny dąb*, *Ciemny orzech*, *Jasna sosna*, *Czarny grafit*.
   - **Tryb „Półki wg statusu”** — możliwość podzielenia regału na osobne półki dla książek czytanych, oczekujących na półce i przeczytanych.
2. **Pobieranie okładek i szczegółów po numerze ISBN**:
   - Równoległe wyszukiwanie w 3 katalogach: **Google Books API**, **Polska Biblioteka Narodowa (`data.bn.org.pl`)** oraz **Open Library**.
   - **Wbudowany skaner kodów kreskowych aparatem** — zeskanuj kod EAN/ISBN-13 z tyłu książki telefonem.
3. **Oceny, statusy i miejsce zakupu**:
   - Ocenianie w skali **1–5 ★** (także bezpośrednio z karty książki na półce).
   - Oznaczanie statusu: *Na półce (Do przeczytania)*, *W trakcie czytania*, *Przeczytana*, *Lista życzeń*.
   - Zapisywanie **gdzie kupiono książkę** (np. *Empik*, *Allegro*, *Bonito*, *Świat Książki*, *Antykwariat*, *Prezent*) wraz z filtrowaniem półki po sklepie, ceną i datą zakupu.
4. **Baza danych w pliku JSON + darmowy GitHub**:
   - Wszystkie dane znajdują się w pliku `data/books.json`.
   - Automatyczny zapis zmian przez **GitHub REST API** bezpośrednio z aplikacji oraz możliwość ręcznego eksportu/importu pliku `books.json`.

---

## 🚀 Jak uruchomić za darmo na GitHub Pages (krok po kroku)

1. **Utwórz repozytorium na GitHubie**:
   - Zaloguj się na [github.com](https://github.com) i kliknij **New repository**.
   - Nazwij repozytorium np. `moja-biblioteczka` i wgraj wszystkie pliki z tego katalogu.
2. **Włącz GitHub Pages**:
   - Wejdź w **Settings → Pages** w swoim repozytorium.
   - W sekcji **Branch** wybierz `main` (folder `/ (root)`) i kliknij **Save**.
   - Po chwili Twoja aplikacja będzie działać pod adresem:
     `https://<twoj-login>.github.io/moja-biblioteczka/`
3. **Skonfiguruj automatyczny zapis do pliku `data/books.json`**:
   - Na GitHubie wejdź w **Settings (Twojego profilu) → Developer settings → Personal access tokens → Fine-grained tokens → Generate new token**.
   - W sekcji **Repository access** wybierz *Only select repositories* i wskaż `moja-biblioteczka`.
   - W sekcji **Permissions → Repository permissions → Contents** ustaw **Read and write**.
   - Wygeneruj token, kliknij przycisk **JSON / GitHub** w górnym pasku aplikacji i wklej token. Od tej chwili każda zmiana na półce automatycznie zaktualizuje plik `data/books.json` na Twoim GitHubie!
