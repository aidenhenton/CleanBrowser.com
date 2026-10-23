# Clear

A clean, standalone browser start page.

Open `index.html` directly in a browser, or serve the folder locally:

```sh
python3 -m http.server 4173
```

Then visit `http://localhost:4173`.

Features include URL/search detection, four editable favorites, keyboard focus (`Cmd/Ctrl+K`), focus mode, quiet appearance settings, selectable UI fonts, and Reserved mode that prevents history from being written. Searches and favorites open inside the persistent Clean Browser tab. Favorites and appearance preferences are stored locally in your browser.

External sites must allow iframe embedding; some services with strict browser embedding policies may not display in the page frame.