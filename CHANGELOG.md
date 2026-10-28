# Changelog

## Traducción al español — 2026-10-28

- Versión **Glass Dusk ES**, basada en Glass Dusk 1.7.2 de Yareli.
- Español como idioma predeterminado para los textos del tema, con las opciones de inglés y ucraniano conservadas.
- Traducción de los ajustes, los nombres y las descripciones de colores, los textos de la biblioteca y Big Picture, y las instrucciones de instalación.
- Se conservan a continuación las notas originales del autor, en inglés.

Versions follow [semantic versioning](https://semver.org). The repository starts at 1.2.0. The two earlier versions were built before it existed, and they are described from the development notes.

## 1.7.2 — 2026-10-26

**Library**
- *Your Collections* sat on Steam's slate gradient instead of the theme's glass ([#21](https://github.com/Yareli0i/glass-dusk/issues/21), reported by @timinside).

**Address bar**
- Once you had copied a page's address from the address bar, its *Copied!* tip stayed on screen and turned up again over whatever you did next ([#22](https://github.com/Yareli0i/glass-dusk/issues/22), reported by @timinside). The cause is Millennium's reclass, which the theme needs: it gives every name in Steam's style maps a readable second name, and Steam takes the tip down only when its animation ends under the name it expects, which no longer matched. The theme puts that one name back.

## 1.7.1 — 2026-10-24

**In-game overlay**
- A clock or timer pinned over the game sat in a dark box of glass. Pinned and left on screen once the overlay closes, Steam drops the ground of these panels (the clock and timer, notes, achievements, the timeline, a browser) so the game shows round them; *Overlay panels → Glass* put it back. It keeps out of them now ([#20](https://github.com/Yareli0i/glass-dusk/issues/20), reported by @timinside).

## 1.7.0 — 2026-10-24

**Store**
- The whole store is in the theme now, not only the front page, a game's page and search. Hubs (every category, tag and genre page, Specials, Demos and the rest), the store menu with its flyouts and the search panel, the wishlist, the cart, the charts, the personal calendar, the recommender, the older list pages (New Releases, Upcoming, curators, Popular Tags, developer and publisher pages, the Discovery Queue page, Community Recommendations, Labs), the Points Shop and the News Hub sit on the same dark glass, with the same buttons, chips and cards.
- Your account's pages on the store are restyled too: account details, store preferences, languages, ignored products, purchase history, licences, product activation, devices, cookies, family, notification settings and playtests.
- Links and the rest of Steam's blue text follow the accent colour.
- A game's page: the media strip, system requirements, *Read more*, awards, the new reviews section and the right column lost the last of Steam's blue and grey.
- In the lists under the front page's tabs, the name of the row under the pointer turned dark on dark. It stays readable now.
- What Steam added or redrew lately is in too: the front page's *Top New Releases* (it sat in a teal frame), a piece of news opened on its own (a grey page in the middle of the News Hub), the curators the News Hub suggests, the month's top releases on the charts (the *Silver* group was a pale slab), event pages with light art of their own such as *Cooking Fest* (the trailers, the list of games and its filters had no ground, so the text could not be read), *Show more* under a shelf, and a bundle's discount, cost and savings, which stayed in Steam's lime and blue. Since then Steam rebuilt the cart on its newer components, which left its buttons in Steam's blue again, and put an *Explore Your Discovery Queue* band in purple and blue on every hub: both are in the theme now.
- Left as Steam draws them, on purpose: the price and *Add to Cart* blocks, the landing pages (About Steam, Steam Deck and hardware) and the art of sale events, which come with art of their own.

**Speed**
- The wishlist no longer stutters. Under the theme its scrolling ran at less than half the frame rate it has without it, and the pointer lagged by up to a third of a second. Rules that only one kind of page needs (the front page's blocks, the calendar, the charts, the recommender, your account, the cart, a game's reviews, the Points Shop, the News Hub, parts of the hubs) now load on that page alone, and the rest keep away from the selectors that made every page pay for them. It now scrolls nearly as smoothly as without the theme; what stutter is left is Steam's own.
- The store's front page, search and a game's page lost their stutter too. While a page scrolls, Steam has the browser restyle the whole page now and then, and every rule loaded counted, including the client's own two style sheets (menus, chat, plugins), which Millennium loads into web pages as well and which do nothing there: they are switched off on web pages now. The front page went from 24 long frames in five seconds of scrolling to 2, as without the theme, and search from 9 to none.
- On a game's page the reviews are styled by marks the theme puts on them, not by their shape: scrolling Cyberpunk 2077's page, with its thousands of reviews, went from 25-28 long frames in five seconds to 4-7, and a smaller game's page scrolls as it does without the theme.

## 1.6.14 — 2026-10-20

**Sign-in**
- *Sign-in screen* has another new choice, *Slideshow*, which is what was asked for on Discord: the art of one of your games after another fills the window behind the chooser and the signing-in screen, each fading into the next every three seconds or so while it slowly comes closer, and the colour follows the picture. It takes the 24 games you played last.
## 1.6.13 — 2026-10-20

**Sign-in**
- *Sign-in screen* has a new choice, *Your games* (asked for on Discord): the covers of your own games drift past behind the chooser and the signing-in screen, in rows on a tilted plane, each at its own pace and every other one the other way, like Steam's own wall made of your library. The games played last come first, up to 120 of them; the colour stays the last game's.
## 1.6.12 — 2026-10-20

**Game list**
- *Store: game list* keeps to the client's web pages ([#19](https://github.com/Yareli0i/glass-dusk/issues/19), reported by @PlzCarryMe). Millennium's settings page is drawn by the client itself and does not make room for the list, so the list covered its right side, with the *Use* buttons and the menu arrows. With *On hover*, pointing at one of those menus brought the list out. The list now stays off such pages, and only the list itself brings it out.
## 1.6.11 — 2026-10-19

**Game list**
- With *Store: game list* on, bits of the last game page opened in the library came through over the store and the other web pages while one was loading: the play bar's *Cloud Status* in a dark box, while Steam synced a game's saves ([#18](https://github.com/Yareli0i/glass-dusk/issues/18), reported by @kofbd). Nothing of the library behind the list is drawn now.
- The *Collections* button beside *Home* is a round button like the sort and filter ones under it, with its four squares in the theme's ink, and it takes the accent while the Collections page is open (asked about on Discord). Steam drew it as grey squares on two grounds at once, pressed into the corner of the list's glass.
## 1.6.10 — 2026-10-18

**Sign-in**
- The account chooser Steam shows when it starts (*Who's playing?*), and the signing-in screen after it, are in the theme ([#17](https://github.com/Yareli0i/glass-dusk/issues/17), asked for by @kofbd). New switch *Sign-in screen*: the art of the game you played last with its colour (by default; plain dusk until there is a game to take it from), plain dusk, or Steam's wall of covers dimmed, each with the chooser on a card of glass, rounded avatars and the spinner in the theme's colour. *Steam* leaves both as Steam draws them.

**Game list**
- Your game list can stay beside the store and the other web pages of the client ([#17](https://github.com/Yareli0i/glass-dusk/issues/17), asked for by @kofbd). New switch *Store: game list*: *Pinned* keeps Steam's own list there, with its collections, search and filters; *On hover* leaves a strip at the window's edge and the list comes out when you point at it; *Rail* shows your last games' covers, and a button opens the full list (the theme remembers which). The page narrows beside the list. Off by default.
- When Steam starts on the store, the library is shown for a moment so the list is there, and the store page loads once more after it, as it does whenever you switch from the library to the store.
## 1.6.9 — 2026-10-18

**Library home**
- The header's numbers count games added from outside Steam too (reported on Discord): *Games*, and the hours, the hours of two weeks and the games played when a plugin such as Non-Steam Playtimes keeps their time. Without one, Steam keeps no hours for them, so such a game adds to *Games*, and once it has been run it no longer counts as unplayed.

## 1.6.8 — 2026-10-18

**Game page**
- The collections a game is in show at the top right of its art again, as Steam draws them, now as glass pills ([#16](https://github.com/Yareli0i/glass-dusk/issues/16), asked for by @YuujiNana). The theme had hidden them. A click opens the collection. New switch *Game page: collection tags*, on by default.

## 1.6.7 — 2026-10-17

**Library home**
- Games added to Steam from outside it (non-Steam games) turn up on the *Continue* card and in the recently played row like any other game (asked for on Discord). With custom art, from SteamGridDB for example, they get their hero, logo and cover; without it, the card shows the name. Steam counts no playtime for them, so the card says only when the game was last played.
- A date from an earlier year comes with its year: on the *Continue* card and under the covers of the recently played row "Oct 12" could have been any October, and with *Home games → Whole library* the home shows games last played years ago.

**Library**
- Game covers on a collection's page and on Steam's shelves are rounded like the rest of the theme, and follow the *Corners* setting (asked for on Discord).
- The action row at the top of a game's menu wears the accent whatever it says. Only *Play* did; *Install*, *Update*, *Download*, *Stop* and the rest stayed in Steam's blue, *Launch* in its green.

**Big Picture**
- The hours chip says nothing about playtime for a non-Steam game, where it said "0 h", and a game last played long ago is "3 months ago" or "2 years ago" there instead of "843 days ago".

## 1.6.6 — 2026-10-16

**Game list**
- The *Library Filters* panel, behind the button next to the list's search, could not be used ([#15](https://github.com/Yareli0i/glass-dusk/issues/15), reported by @Beastmodplayer). Steam opens it to the right of the button, which with the list on the right is past the edge of the window, and with the list on the left the list's glass cut it off. It now opens towards the middle of the window, above the game page, on a solid ground so the list doesn't read through it.

## 1.6.5 — 2026-10-15

**Game page**
- *Adjust Logo Position* (right click on the art): Steam's *Done* button sat in the bottom right corner of the art, which fades out in this theme, and with HLTB for Steam installed its box covered the button, so a click went to HLTB's *View details* instead (reported on Discord by Eng.REVY). While the logo is being placed, *Done* sits in the top right corner now, above any plugin. The same goes for the *Done* of the Custom Logo Position plugin.

## 1.6.4 — 2026-10-14

**Library home**
- Hidden games no longer turn up on the *Continue* card or in the recently played row ([#13](https://github.com/Yareli0i/glass-dusk/pull/13), by @JankyMouse).
- The recently played row shows as many covers as fit across it, up to eleven, instead of scrolling sideways ([#13](https://github.com/Yareli0i/glass-dusk/pull/13)).
- Pointing at a cover in that row brings up a card with the game's screenshots, your own first and then the store's, with its name and hours ([#13](https://github.com/Yareli0i/glass-dusk/pull/13), an idea by @JankyMouse). New switch *Recently played: preview*, on by default. The store's screenshots are fetched only when a cover is pointed at.
- New switch *Home games* ([#14](https://github.com/Yareli0i/glass-dusk/issues/14), asked for by @Mystery14): *Continue* and the recently played row can take their games from the whole library instead of only what is installed. A game that is not installed gets *Install* instead of *Play*.
- New switch *Continue card: achievements* puts the game's achievement progress on the card ([#14](https://github.com/Yareli0i/glass-dusk/issues/14)).
- New switch *Add shelf button* hides Steam's *Add shelf* row ([#13](https://github.com/Yareli0i/glass-dusk/pull/13)).

**Game list**
- With the list on the right, where the theme puts it by default, dragging the divider snapped the list to its narrowest ([#13](https://github.com/Yareli0i/glass-dusk/pull/13), found by @JankyMouse). The list follows the pointer now, and its width is still Steam's own setting.

## 1.6.3 — 2026-10-11

**Library home**
- New switch *Recently played shelf* on the *Library* tab ([#12](https://github.com/Yareli0i/glass-dusk/issues/12)): the row of covers under the *Continue* card can be turned off. It is on by default, as before.
- When there was nothing to put in that row (one installed game played so far), its heading stood alone. It is left out now.

## 1.6.2 — 2026-10-10

**Library home**
- The *Continue* card's button said *Play* while its game was starting or already running ([#11](https://github.com/Yareli0i/glass-dusk/issues/11)). It follows the game now, like the button on the game's own page: *Cancel* while Steam is starting it, *Stop* while it runs, and it does what it says.

**Store**
- In a wide window the front page's main carousel showed a pale oval over the previous and next games at its sides ([#10](https://github.com/Yareli0i/glass-dusk/issues/10), reported with its cause by @AlExpler). The arrows there carry no backdrop now, and the neighbouring cards have rounded corners.

## 1.6.1 — 2026-10-10

**Library home**
- With *What's New shelf* switched on, the shelf was still Steam's grey-blue slab from edge to edge ([#9](https://github.com/Yareli0i/glass-dusk/issues/9)). The theme hides that shelf by default and had never styled it. It sits on the home like the theme's own shelf now: the same small heading, rounded pictures, the game's name as a chip.
- A news tile under the pointer gets dark glass and the accent colour instead of Steam's navy and blue, and its menu button is a dark dot instead of a light grey square.
- The shelf's settings window (the gear next to *What's New*) is themed: soft rounded rows, and its switch follows the accent.

## 1.6.0 — 2026-10-10

**Library home**
- You choose the numbers in the header. Each one has its own switch in the theme's settings: *Games*, *Hours played* and *On disk* as before, and three new ones, *Hours, 2 weeks*, *Unplayed* and *Perfect games* (every achievement unlocked). The first three are on by default, so the header looks the same until you touch a switch. With all six on, the row drops under the greeting in a narrow window.
- *Home numbers: second line* puts a small line under each number: games installed, games played, the share of the library never started, average completion, drives in use.
- *Perfect games* is kept right. Steam's own record of achievements goes stale: a game that got new achievements with a DLC went on counting as perfect for a month. While the number is on, the theme has Steam renew that record for a game played since it was last checked, and for every played game once a day.
- The *Continue* card shows the hours of the last two weeks next to the total, when the two differ.

## 1.5.5 — 2026-10-10

**Library**
- The filter menu above the game list (*Games*, *Software*, *Tools*, *Group by…*) had no background at all, so the list read through it. It has the same glass as the other menus now.

## 1.5.4 — 2026-10-09

**News window**
- The window that opens from *What's New* or *View Latest News* was left as Steam draws it: a grey slab with a white glow in its header and footer, and square grey buttons beside it ([#6](https://github.com/Yareli0i/glass-dusk/issues/6)). It is a dark card in the theme's colours now. The buttons beside it are round, and *Rate Up*, *Discuss* and *Share* are pills.

**Game page**
- The page's text showed through the bar that sticks to the top while scrolling ([#7](https://github.com/Yareli0i/glass-dusk/issues/7)). The bar is opaque now.
- A plugin that adds a button next to the gear got it stacked above the gear, and the sticky bar grew to two rows. The buttons sit side by side.

## 1.5.3 — 2026-10-07

**Library home**
- For newer games the *Continue* card came up blank, with the game's name as plain text instead of its logo ([#5](https://github.com/Yareli0i/glass-dusk/issues/5)). These games keep their library art in hashed folders and have nothing at the old fixed address, neither in Steam's cache nor on the CDN, and the fixed address was the only place the theme looked. It asks Steam where the game's hero and logo are now.
- The window background on the library home missed the same games, and the accent colour with it. Both come from the hero, so both are back.

## 1.5.2 — 2026-10-07

**Game page**
- The play bar's button was themed only as *Play*. *Install*, *Update*, *Stop* and *Cancel* kept Steam's blue slab with square corners ([#2](https://github.com/Yareli0i/glass-dusk/issues/2)). Every state is the same pill now, in the page's strip and in the one that sticks to the top. *Install* and *Update* take the game's colour like *Play*; *Stop* and *Cancel* are quiet, so a running game does not look like one waiting to be played.

**Friends list**
- In a narrow window the search looked like a wide empty field that ran into the requests button ([#3](https://github.com/Yareli0i/glass-dusk/issues/3)). The theme was painting the whole strip the search slides into. The search is a magnifier until it is opened, as in Steam, and the opened field is themed.
- *Got it!* on the quick-access box was a pill sticking out over the dashed frame. It is a corner tab of the box now.
- In a game that reports what you are doing, the header shows three lines, and the game's name overlapped yours. Steam draws it that way without the theme too; the theme now gives the lines room.

**Chat**
- Hovering a chat tab lit up a grey box inside it, narrower than the tab. The whole tab is highlighted now.

## 1.5.1 — 2026-10-06

**Library home**
- The three numbers in the header were all counted from the installed apps, so a large library showed a fraction of itself ([#1](https://github.com/Yareli0i/glass-dusk/issues/1), reported with a fix by @eviljjonahjameson):
  - *Games* is every game in the library, installed or not. Family-shared games count, hidden ones do not. It used to count installed apps, tools and videos among them.
  - *Hours played* adds up the whole library. Uninstalling a game no longer takes its hours away.
  - *On disk* is what Steam's library folders hold on every drive: games, DLC, workshop items, shader caches and staged updates. It is the total that Settings → Storage shows, in the same units. It used to miss workshop items and shaders.
- The header no longer disappears when nothing installed has been played yet. It shows the numbers without the *Continue* card.

**Store**
- A bundle's page: the right column had a square dark patch behind *Bundle details*. It is gone. SteamDB's *View on SteamDB* button there and on package pages was left in Steam's blue; it is a quiet chip now.
- A package's page: the banner's black frame gets rounded corners, and the price summary under the list of items is a card.
- A game's page: the list of DLC was grey slabs with an outlined *Browse all* box. The rows are quiet now and *Browse all* is a chip. The orange notice box, and the purple *Downloadable Content* notice on a DLC's page, have rounded corners.

## 1.5.0 — 2026-10-04

**Plugins**
- Millennium plugins that draw their own interface now wear the theme instead of Steam's stock blue and grey:
  - *HLTB for Steam* — the strip over a game's art (it also no longer fades out with the bottom of the art), in Big Picture too, and its block on store pages;
  - *Achievement Groups* — its whole page: search, filters, dropdowns, buttons, groups, rows and the preferences window. Unlocked achievements are tinted with the game's colour instead of green;
  - *Player Count* and *Size on Disk* — their tiles in the play bar now read like Steam's own: grey caption and icon, white value. Player Count no longer paints its number red, gold or blue;
  - *Extendium* — its menu on the address bar and the extensions window: extension cards, the details view, fields and links. The compatibility pill keeps its colour as a quiet tint.
- New switch: *Plugins* (Theme / Plugin's own).

**Store**
- A game's page: the right column was a stack of square near-black blocks. They are now the same soft rounded cards as the purchase boxes on the left, the achievements block included.
- Browser extensions added through Extendium get the same cards: SteamDB's and Augmented Steam's blocks, price lines and the app ID chip. Augmented Steam's column of link buttons was eight accent buttons; they are quiet chips now.
- A game's page: the "already in your library" block and the review form were left in Steam's colours. The form is now themed; Yes / No are quiet until one is picked, and *Post review* is the accent button.
- A game's page: the customer reviews section sat on dark bands that the theme itself put there. The bands are gone; review cards are rounded and their buttons match the theme. Rating colours and the thumb boxes stay Steam's.
- A game's page: the rows of *Is this game relevant to you?* sat on dark plates. A rule meant for capsule blurbs caught them.

**Settings, chat and dialogs**
- Settings → Storage → *Move Content*: the dialog had no ground of its own and its text sat on top of the game list. Any dialog opened inside a settings window now gets its own panel.
- Chat window: it kept Steam's grey ground, tab and entry row, and the emoticon, attach and voice buttons came out as filled circles like the send button. The window now matches the friends list; the four buttons share one shape, and send is filled only when there is something to send.
- Switches, sliders, segmented choices, radio buttons and checkbox ticks stayed in Steam's blue. They now take the accent colour.
- Settings: family members, the *Game update timing* note and the recording modes were grey square slabs.
- Game Properties: the beta branches and DLC tables were grey.
- Recordings & Screenshots: grey buttons, a blue title and grey recording tiles.

**Achievements page**
- The progress bar at the top was blue, Steam's slate sheet sat behind the list, and the *Scroll to top* tab was blue.

## 1.4.0 — 2026-10-01

**Community and profiles**
- Community and profile pages are no longer restyled. They were caught half-way: rules meant for the client's own windows (friends, avatars, scrollbars) also matched community markup. Profiles carry their owners' own backgrounds and themes, so these pages now stay exactly as Steam draws them.
- Store styling applies to store.steampowered.com only.

**Fixes**
- Wishlist: a huge unstyled header with a menu button sat on top of the page. It is Steam's own in-client header, shown with or without the theme, and it is now hidden.
- Library: the right-click menu on a game stayed in Steam's grey with a green Play row. It now matches the other menus.
- Library: the card that appears when hovering a game gets rounded corners and the theme's dark ground.
- Game page: the *Featured* update card kept Steam's blue frame and square corners.
- Settings → Account: the three large tiles were stretched into ovals.
- Friends list: the glow behind your name was a hard-edged ellipse. Steam's own soft glow is back.

**Other**
- Donate button for steambrew.app (Ko-fi).
- Source comments are in English throughout, and the screenshots show the English client.

## 1.3.0 — 2026-09-30

Ready for release.

**Settings**
- All settings are in English. The new *Theme language* switch keeps the theme's own text in English by default, with Ukrainian as an option.
- New: *Background art* (Normal / Subtle / Vivid), *Library home* (Theme / Steam), *Game list side* (Right / Left), *Big Picture hours chip*.
- *Accent colour → Fixed* uses the Accent from the Colors tab instead of a hard-coded blue.
- The Colors tab now has names and descriptions. Glass tint and the play bar colour work; four colours that changed nothing are gone.

**Fixes**
- *What's New shelf* and *Game list side → Left* had no effect: option files load before the main stylesheet and lost to it. They now outweigh it.
- The library home header sat 5 px from the window edge. It now lines up with Steam's shelves.
- The number font and the meadow were linked through the theme's folder name, and would have gone missing in any other folder. Both now use relative paths.
- Big Picture is matched by its window class, not its title, so it works in every Steam language.
- Removed `UseDefaultPatches`, which the Millennium docs say must not be combined with custom patches.
- Removed a development helper and an unused option file from the theme.

## 1.2.0 — 2026-09-30

**Big Picture: Cover**
- The focused game's art fills the home screen. Buttons, tabs and the focus ring take their colour from it.
- A chip at the top left shows the game's logo, hours played and when it was last played.

**In-game overlay**
- *Game Overview*, the browser and the toolbar become smoked glass, coloured by the game being played.

**Fixes**
- Big Picture was treated as the main window and cleared the colour that menus follow.
- The chip and the colour lagged one game behind: during a move Steam keeps two background images, and the old one was being read.
- Big Picture stuttered on every move: a CSS blur was redone for every frame of Steam's cross-fade. The art is now blurred once into a small canvas, and images are decoded and scaled off the main thread. Frame times now match Steam without the theme.

## 1.1.0 — 2026-09-26

- In-game overlay: a light veil replaces Steam's near-black sheet behind the Shift+Tab panels.
- New switch: *In-game overlay* (Transparent / Steam).

## 1.0.0 — 2026-09-12

- The open game's art, blurred, fills the client, and the accent colour is picked from it. The library home borrows the last game you played.
- Two panes of smoked glass with the game list on the right; its own library home header (greeting, stats, Continue, recent games).
- Game page, store and community, menus, settings, notifications, friends and chat restyled.
- Switches: Background, Accent, Glass, Corners, What's New shelf.
