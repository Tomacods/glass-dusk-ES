/* ╔══════════════════════════════════════════════════════════════════════════╗
   ║  Glass Dusk — runtime                                                    ║
   ║                                                                          ║
   ║  The open game's art is the client's background and the source of its     ║
   ║  accent; on the library home that is the game you played last. The main   ║
   ║  window publishes both to localStorage, so every other window Steam opens ║
   ║  (menus, notifications, friends, settings) wears the same colour.         ║
   ║                                                                          ║
   ║  Library data comes from the client's own store (window.opener.appStore). ║
   ╚══════════════════════════════════════════════════════════════════════════╝ */
(() => {
  if (window.__glassDusk) return;
  const HOUSE = '#5e90e4';
  const root = document.documentElement;
  // The in-game overlay's desktop window is titled "SP Overlay: <pid>/…" and carries the
  // same body class as the main window, so it has to be told apart by title.
  const isOverlay = /^(SP|Steam) Overlay/i.test(document.title || '');
  // Big Picture (and the other gamepad windows — on-screen keyboard, controller layout)
  // carry SteamUIPopupWindowBody as well. Taken for the main window, they cleared the
  // accent every other window follows, so they get their own branch.
  const bodyClass = document.body ? document.body.className : '';
  const isGamepad = !isOverlay && (/GamepadUIPopupWindowBody/.test(bodyClass) || /Big Picture/.test(document.title || ''));
  const isMain = !isOverlay && !isGamepad && (/SteamUIPopupWindowBody/.test(bodyClass) ||
    /^Steam$/.test(document.title));
  const state = window.__glassDusk = { art: null, accent: HOUSE, home: 0, main: isMain };

  const shared = () => {
    try { return window.opener && window.opener.appStore ? window.opener : null; } catch (e) { return null; }
  };

  /* ═════════════ picking a colour out of the art ═════════════ */

  const rgb2hsv = (r, g, b) => {
    r /= 255; g /= 255; b /= 255;
    const mx = Math.max(r, g, b), mn = Math.min(r, g, b), d = mx - mn;
    let h = 0;
    if (d) h = mx === r ? ((g - b) / d + (g < b ? 6 : 0)) : mx === g ? (b - r) / d + 2 : (r - g) / d + 4;
    return [h / 6, mx ? d / mx : 0, mx];
  };
  const hsl2rgb = (h, s, l) => {
    const k = n => (n + h * 12) % 12;
    const a = s * Math.min(l, 1 - l);
    const f = n => l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
    return [f(0) * 255, f(8) * 255, f(4) * 255];
  };
  const hex = v => Math.round(Math.max(0, Math.min(255, v))).toString(16).padStart(2, '0');

  const accentFrom = img => {
    const c = document.createElement('canvas');
    c.width = 96; c.height = 31;
    const ctx = c.getContext('2d', { willReadFrequently: true });
    ctx.drawImage(img, 0, 0, c.width, c.height);
    let data;
    try { data = ctx.getImageData(0, 0, c.width, c.height).data; } catch (e) { return null; }

    const buckets = {};
    for (let i = 0; i < data.length; i += 4) {
      const [h, s, v] = rgb2hsv(data[i], data[i + 1], data[i + 2]);
      if (s < 0.28 || v < 0.28) continue;
      const w = s * s * v, k = Math.floor(h * 18) % 18;
      const acc = buckets[k] || (buckets[k] = [0, 0, 0, 0]);
      acc[0] += data[i] * w; acc[1] += data[i + 1] * w; acc[2] += data[i + 2] * w; acc[3] += w;
    }
    const best = Object.values(buckets).sort((a, b) => b[3] - a[3])[0];
    if (!best) return null;

    // keep the art's hue, hold saturation and lightness in a band that reads on dark glass
    const [h, s] = rgb2hsv(best[0] / best[3], best[1] / best[3], best[2] / best[3]);
    const rgb = hsl2rgb(h, Math.min(Math.max(s, 0.42), 0.68), 0.56);
    const lum = (0.2126 * rgb[0] + 0.7152 * rgb[1] + 0.0722 * rgb[2]) / 255;
    return { accent: '#' + rgb.map(hex).join(''), ink: lum > 0.62 ? '#10131a' : '#ffffff' };
  };

  /* ═════════════ the art layer, in every window ═════════════ */

  const layer = document.createElement('div');
  layer.id = 'gd-art';
  const mountLayer = () => {
    if (document.body && !layer.isConnected) document.body.insertBefore(layer, document.body.firstChild);
  };

  // switch «Accent colour → Fixed» (css/options/accent-fixed.css): the art stops
  // recolouring anything and --gd-accent stays whatever the Colors tab says
  const accentLocked = () => getComputedStyle(root).getPropertyValue('--gd-accent-lock').trim() === '1';

  const paint = (src, accent, ink) => {
    if (src) {
      layer.style.backgroundImage = `url("${src}")`;
      layer.classList.add('on');
    } else {
      layer.classList.remove('on');
    }
    if (accent && !accentLocked()) {
      root.style.setProperty('--gd-accent', accent);
      root.style.setProperty('--gd-accent-ink', ink || '#fff');
    } else {
      root.style.removeProperty('--gd-accent');
      root.style.removeProperty('--gd-accent-ink');
    }
  };

  /* ── web pages: the store gets its app's art; community and profiles are left alone ── */

  // Profiles carry their owners' own backgrounds and themes, and the community's old
  // markup read worse half-restyled than untouched — so nothing here runs on them.
  if (/(^|\.)steamcommunity\.com$/.test(location.hostname)) return;
  const webHost = /(^|\.)steampowered\.com$/.test(location.hostname);
  if (webHost) {
    // css/webkit.css reaches every web page (Steam-WebKit); its rules wait for this class.
    // A URL patch was tried and missed pages that redirect (/wishlist/ → /wishlist/id/…,
    // /replay/ → /replay/<id>/…). Checkout, help and login pages stay Steam's own.
    if (location.hostname === 'store.steampowered.com') root.classList.add('gd-store');
    const appid = (location.pathname.match(/\/app\/(\d+)/) || [])[1];
    if (appid) {
      const url = `https://shared.steamstatic.com/store_item_assets/steam/apps/${appid}/library_hero.jpg`;
      root.style.setProperty('--gd-art', `url("${url}")`);
      const flag = () => document.body && document.body.classList.add('gd-art');
      if (document.body) flag(); else addEventListener('DOMContentLoaded', flag);
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        const picked = accentFrom(img);
        if (picked && !accentLocked()) {
          root.style.setProperty('--gd-accent', picked.accent);
          root.style.setProperty('--gd-accent-ink', picked.ink);
        }
      };
      img.src = url;
    }
    return;
  }

  /* ── where a game's art lives ── */

  // Newer games keep their library files in hashed folders — /assets/<id>/<hash>/library_hero.jpg —
  // and have nothing at the plain address, neither in Steam's cache nor on the CDN. The
  // hash is in the app's details, and with those loaded Steam can list the candidates itself.
  const steamArt = (o, fn, key, app) => {
    try {
      const list = o.appDetailsStore[fn](app)[key];
      return Array.isArray(list) ? list.filter(Boolean) : [];
    } catch (e) { return []; }
  };

  // Steam loads the details on demand, so a picture that depends on them waits for the
  // answer: asked once per game, and 1.5 s without one means the plain addresses are tried.
  const detailsAsked = new Map();
  const detailsReady = (o, app) => {
    let entry = detailsAsked.get(app.appid);
    if (!entry) {
      let ask = null;
      try { if (!o.appDetailsStore.GetAppDetails(app.appid)) ask = o.appDetailsStore.RequestAppDetails(app.appid); }
      catch (e) { /* no such store in this client: the plain addresses are all there is */ }
      entry = { done: !ask };
      entry.promise = !ask ? Promise.resolve()
        : Promise.race([ask, new Promise(r => setTimeout(r, 1500))]).catch(() => {}).then(() => { entry.done = true; });
      detailsAsked.set(app.appid, entry);
    }
    return entry;
  };

  /* ── the game being played: its colour for the overlay and its panels ── */

  // In the overlay the accent should belong to the game on screen, not to whatever page
  // the client window showed last. Its hero (custom art first) goes through accentFrom
  // once per game; `done` gets the pick, later calls get it from the cache.
  const runningAccent = done => {
    let o = null;
    try { o = window.opener; } catch (e) { return; }
    const id = o && o.SteamUIStore && o.SteamUIStore.MainRunningAppID;
    if (!id) return;
    if (runningAccent.id === id) { if (runningAccent.picked) done(runningAccent.picked); return; }
    runningAccent.id = id;
    runningAccent.picked = null;
    let urls = [`/assets/${id}/library_hero.jpg`];
    try {
      const app = o.appStore.GetAppOverviewByAppID(id);
      if (app) urls = [...steamArt(o, 'GetHeroImages', 'rgHeroImages', app), ...urls];
      if (app && app.rt_custom_image_mtime) {
        const custom = o.appStore.GetCustomHeroImageURLs(app);
        urls = [...new Set([...(Array.isArray(custom) ? custom : [custom]).filter(Boolean), ...urls])];
      }
    } catch (e) { /* no custom art, the cached hero will do */ }
    const attempt = i => {
      if (i >= urls.length) return;
      const img = new Image();
      img.onload = () => {
        const picked = accentFrom(img);
        if (!picked) { attempt(i + 1); return; }
        runningAccent.picked = picked;
        done(picked);
      };
      img.onerror = () => attempt(i + 1);
      img.src = new URL(urls[i], location.href).href;
    };
    attempt(0);
  };
  const storedAccent = () => {
    try { return [localStorage.getItem('gd-accent'), localStorage.getItem('gd-accent-ink')]; } catch (e) { return [null, null]; }
  };

  /* ── in-game overlay: the game has to show through ── */

  // The art layer would lie between the game and the overlay as a grey sheet, on top of
  // Steam's own backdrop (black 67→93 % plus a 300 px inset shadow). So the overlay gets
  // no art layer, and css/overlay.css thins the backdrop. That file names the backdrop by
  // its current hash; after a client update the lookup below finds the new one in the
  // overlay's own CSS module.
  if (isOverlay) {
    root.classList.add('gd-overlay');
    const mapBackdrop = () => {
      if (document.getElementById('gd-overlay-map')) return true;
      if (!document.head) return false;
      let mod = null;
      for (const host of [window, window.opener]) {
        try {
          const api = host && host.MILLENNIUM_API;
          mod = api && api.findModule && api.findModule(m => m && m.Wrapper && m.PreviewPinnedView && m.ToolbarContainer);
        } catch (e) { /* no access from this window */ }
        if (mod) break;
      }
      if (!mod) return false;
      const style = document.createElement('style');
      style.id = 'gd-overlay-map';
      style.textContent = `.${mod.Wrapper}{background:var(--gd-overlay-backdrop)!important;box-shadow:var(--gd-overlay-shadow)!important}`;
      document.head.appendChild(style);
      return true;
    };
    const follow = () => {
      layer.remove();
      const picked = runningAccent.picked;
      const [accent, ink] = picked ? [picked.accent, picked.ink] : storedAccent();
      paint(null, accent, ink);
    };
    let tries = 0;
    const timer = setInterval(() => { if (mapBackdrop() || ++tries > 30) clearInterval(timer); }, 1000);
    addEventListener('storage', follow);
    if (document.body) follow(); else addEventListener('DOMContentLoaded', follow);
    mapBackdrop();
    // the client store can still be filling in when the overlay starts, so ask again a few times
    let asks = 0;
    const ask = setInterval(() => { runningAccent(follow); if (runningAccent.picked || ++asks > 20) clearInterval(ask); }, 3000);
    runningAccent(follow);
    return;
  }

  /* ── windows other than the main one just follow what it published ── */

  if (!isMain && !isGamepad) {
    const follow = () => {
      // overlay panels (OverlayPopupBody): the recording timeline is see-through and spans
      // the screen, so an art layer there would grey out the game — accent only
      const overlayPanel = document.body && document.body.classList.contains('OverlayPopupBody');
      if (overlayPanel) {
        // a panel over the game wears the game's colour, like the overlay itself
        layer.remove();
        runningAccent(() => {});
        const picked = runningAccent.picked;
        const [accent, ink] = picked ? [picked.accent, picked.ink] : storedAccent();
        paint(null, accent, ink);
        return;
      }
      mountLayer();
      try {
        paint(localStorage.getItem('gd-art'), localStorage.getItem('gd-accent'), localStorage.getItem('gd-accent-ink'));
      } catch (e) { /* storage can be unavailable in some popups */ }
    };
    addEventListener('storage', follow);
    setInterval(follow, 1500);
    if (document.body) follow(); else addEventListener('DOMContentLoaded', follow);
    return;
  }

  const publish = (src, accent, ink) => {
    try {
      if (src) localStorage.setItem('gd-art', src); else localStorage.removeItem('gd-art');
      if (accent) { localStorage.setItem('gd-accent', accent); localStorage.setItem('gd-accent-ink', ink || '#fff'); }
      else { localStorage.removeItem('gd-accent'); localStorage.removeItem('gd-accent-ink'); }
    } catch (e) { /* nothing to share with, fine */ }
  };

  // Every picture comes as a list of candidates: your custom art first, then the
  // client's own cache, then the CDN. A missing custom file still answers 200
  // with a small HTML stub, so the only honest test is whether the image decodes
  // — which is exactly how the library itself picks its art.
  // The sign-in window (switch «Sign-in screen → Game art») wears the art of the game played
  // last. gd-art follows whatever page the main window shows, and is empty when Steam was
  // closed on the store, so the home's pick is kept apart: the picture, its game (Steam's own
  // copy stands in if the custom one is not served before sign-in) and its colour.
  let artFromHome = 0;
  const rememberForSignIn = (src, appid, picked) => {
    try { localStorage.setItem('gd-signin', JSON.stringify({ src, appid, accent: picked.accent, ink: picked.ink })); }
    catch (e) { /* no storage: the sign-in window falls back to dusk */ }
  };

  const applyArt = list => {
    const urls = (Array.isArray(list) ? list : [list]).filter(Boolean);
    const key = urls.join('|');
    if (key === state.art) return;
    state.art = key;
    const homeId = artFromHome;

    const clear = () => {
      paint(null, null);
      state.accent = HOUSE;
      publish(null, null);
    };
    if (!urls.length) { clear(); return; }

    const attempt = i => {
      if (state.art !== key) return;
      if (i >= urls.length) { clear(); return; }
      const src = new URL(urls[i], location.href).href;
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        if (state.art !== key) return;
        const picked = accentFrom(img) || { accent: HOUSE, ink: '#fff' };
        state.accent = picked.accent;
        paint(src, picked.accent, picked.ink);
        publish(src, picked.accent, picked.ink);
        if (homeId) rememberForSignIn(src, homeId, picked);
      };
      img.onerror = () => attempt(i + 1);
      img.src = src;
    };
    attempt(0);
  };

  /* ═════════════ artwork, custom first ═════════════ */

  const CDN = id => `https://shared.steamstatic.com/store_item_assets/steam/apps/${id}`;

  const listFrom = (o, fn, app) => {
    try {
      const v = o.appStore[fn](app);
      return Array.isArray(v) ? v : v ? [v] : [];
    } catch (e) { return []; }
  };

  // Hero and logo take Steam's own candidates ahead of the plain addresses (see steamArt);
  // callers wait for detailsReady first, or a newer game ends up with no picture at all.
  const artFor = (o, app) => {
    const id = app.appid;
    const custom = fn => (app.rt_custom_image_mtime ? listFrom(o, fn, app) : []);
    const uniq = list => [...new Set(list)];
    return {
      portrait: [...custom('GetCustomVerticalCapsuleURLs'), ...listFrom(o, 'GetCachedVerticalCapsuleURL', app),
        ...listFrom(o, 'GetVerticalCapsuleURLForApp', app), `${CDN(id)}/library_600x900.jpg`],
      hero: uniq([...custom('GetCustomHeroImageURLs'), ...steamArt(o, 'GetHeroImages', 'rgHeroImages', app),
        `/assets/${id}/library_hero.jpg`, `${CDN(id)}/library_hero.jpg`]),
      logo: uniq([...custom('GetCustomLogoImageURLs'), ...steamArt(o, 'GetLogoImages', 'rgLogoImages', app),
        `/assets/${id}/logo.png`, `${CDN(id)}/logo.png`]),
    };
  };

  // point an <img> at the first candidate that decodes; `none` runs when none does
  const chain = (img, urls, none) => {
    let i = 0;
    const next = () => {
      if (i >= urls.length) { img.onerror = null; if (none) none(); return; }
      img.src = urls[i++];
    };
    img.onerror = next;
    next();
  };

  // The id RunGame wants. Library entries have no m_gameid (undefined), so the Play
  // button passed an empty string and silently did nothing. For a Steam game it is
  // simply the appid.
  const gameIdOf = app => String(app.gameid || app.m_gameid || app.appid || '');

  const esc = s => String(s == null ? '' : s)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

  /* ═════════════ which art belongs on screen ═════════════ */

  const KEEP = {};   // "leave the ground as it is for now"

  // The game page's hero, whichever file Steam settled on — custom art included.
  // While Steam is still trying candidates the element is not decoded yet; the
  // ground then stays put instead of flashing to the library's art.
  const heroElement = () => [...document.querySelectorAll('.Header img, .HeaderBackgroundImage img')]
    .find(i => /library_hero\.(jpg|png)|\/customimages\/\d+_hero\./.test(i.src));

  // Installed on this machine: what can be launched right now.
  const isInstalled = a => {
    try { return !!a.per_client_data && [...a.per_client_data].some(c => c.installed); } catch (e) { return false; }
  };
  const installedApps = o => o.appStore.allApps.filter(isInstalled);
  // A game added to the library from outside Steam (a shortcut) has a type of its own. It
  // belongs on the home like any game: «Continue» and the recent row take it too. Steam counts
  // no playtime for it, so no "0 min" either.
  const SHORTCUT = 1073741824;
  const playable = a => a.app_type === 1 || a.app_type === SHORTCUT;
  const playedOf = app => (app.app_type === SHORTCUT && !(app.minutes_playtime_forever > 0) ? ''
    : `${hoursOf(app.minutes_playtime_forever || 0)} ${W().inGame}${twoWeeksOf(app)}`);
  // Steam's own list of hidden games: nothing on the home shows them (#13)
  const hiddenIn = o => id => { try { return o.collectionStore.BIsHidden(id); } catch (e) { return false; } };

  // The header's numbers are about the whole library, installed or not: every
  // game Steam lists (family-shared ones too, and games added from outside Steam), minus the
  // ones the user has hidden. Steam keeps no hours for a game from outside it; a plugin such as
  // Non-Steam Playtimes writes them into the same fields, and the numbers take them from there.
  const libraryGames = o => {
    const hidden = hiddenIn(o);
    return o.appStore.allApps.filter(a => playable(a) && a.visible_in_game_list !== false && !hidden(a.appid));
  };
  // a game from outside Steam may have been run with no hours to show for it
  const wasPlayed = a => a.minutes_playtime_forever > 0 || (a.app_type === SHORTCUT && a.rt_last_time_played > 0);

  // «Continue» and the recent row take their games from what is installed here, or — switch
  // «Home games → Whole library» (css/options/home-all.css) — from everything in the library,
  // for those who uninstall a game the moment they are done with it (#14).
  const homeApps = o => {
    const hidden = hiddenIn(o);
    const whole = getComputedStyle(root).getPropertyValue('--gd-home-games').trim() === 'all';
    return (whole ? o.appStore.allApps.filter(a => a.visible_in_game_list !== false) : installedApps(o))
      .filter(a => !hidden(a.appid));
  };

  const lastPlayed = o => {
    const apps = homeApps(o);
    const games = apps.filter(playable);
    return (games.length ? games : apps)
      .filter(a => a.rt_last_time_played)
      .sort((a, b) => b.rt_last_time_played - a.rt_last_time_played)[0] || null;
  };

  const wantedArt = () => {
    artFromHome = 0;
    const hero = heroElement();
    if (hero) return hero.complete && hero.naturalWidth > 0 ? [hero.src] : KEEP;   // a game page is open

    const mode = getComputedStyle(root).getPropertyValue('--gd-bg-mode').trim();
    if (mode === 'meadow' || mode === 'plain') return null;   // the options take over

    // Only the library home borrows the last game's art. On the store, community
    // or downloads there is no game in view, so the client stays neutral — that
    // way the window chrome never disagrees with the page inside it.
    if (!document.querySelector('.LeftListSizableContainer')) return null;

    const o = shared();
    const last = o ? lastPlayed(o) : null;
    if (!last) return null;
    const ready = detailsReady(o, last);
    if (ready.done) { artFromHome = last.appid; return artFor(o, last).hero; }
    if (!ready.woken) { ready.woken = true; ready.promise.then(() => soon()); }
    return KEEP;
  };

  /* ═════════════ the sign-in window ═════════════ */

  // It carries the main window's body class, so it runs this branch too. While its account
  // chooser ("Who's playing?") or the signing-in screen after it is up, the window is marked
  // for css/shared.css:
  // html[data-gd-login=art|dusk|wall] (switch «Sign-in screen», css/options/login-*.css; Game
  // art by default), and the block holding Steam's backdrop gets [data-gd-login-frame].
  // Game art falls back to dusk until the picture decodes, or when there is none yet.
  let signInArt = null;   // null: not looked for yet; '': none; otherwise the picture shown
  const signInPicture = () => {
    signInArt = '';
    let kept = null;
    try { kept = JSON.parse(localStorage.getItem('gd-signin') || 'null'); } catch (e) { /* none */ }
    if (!kept || !kept.appid) return;
    const urls = [kept.src, `${CDN(kept.appid)}/library_hero.jpg`].filter(Boolean);
    const attempt = i => {
      if (i >= urls.length) return;
      const img = new Image();
      img.onload = () => { signInArt = urls[i]; paint(urls[i], kept.accent, kept.ink); soon(); };
      img.onerror = () => attempt(i + 1);
      img.src = urls[i];
    };
    attempt(0);
  };
  const signIn = () => {
    const login = document.querySelector('.Login.DesktopUI');
    if (!login) return false;
    const want = getComputedStyle(root).getPropertyValue('--gd-login').trim() || 'art';
    const frame = login.parentElement;
    // the password form and Steam Guard stay Steam's own
    if (want === 'steam' || !login.querySelector('.UserChooser, .StatusThrobber')) {
      root.removeAttribute('data-gd-login');
      if (frame) frame.removeAttribute('data-gd-login-frame');
      paint(null, null);
      return true;
    }
    if (frame) frame.setAttribute('data-gd-login-frame', '');
    if (want === 'art' && signInArt === null) signInPicture();
    const mode = want === 'art' && !signInArt ? 'dusk' : want;
    root.setAttribute('data-gd-login', mode);
    if (mode !== 'art') paint(null, null);
    // the signing-in spinner is a picture in Steam's blue: turned round the colour wheel to the accent
    const m = /^#?([0-9a-f]{6})$/i.exec(getComputedStyle(root).getPropertyValue('--gd-accent').trim());
    if (m) {
      const [h] = rgb2hsv(...[0, 2, 4].map(i => parseInt(m[1].slice(i, i + 2), 16)));
      root.style.setProperty('--gd-login-hue', `${Math.round(h * 360 - 205)}deg`);
    }
    return true;
  };

  /* ═════════════ the home header ═════════════ */

  // switch «Theme language» (css/options/lang-uk.css sets --gd-lang: uk); English by default
  const isUk = () => getComputedStyle(root).getPropertyValue('--gd-lang').trim() === 'uk';
  const locale = () => (isUk() ? 'uk' : 'en');
  // `sub` is the small second line under each number (switch «Home numbers: second line»)
  const WORDS = {
    uk: { cont: 'Продовжити', recent: 'Нещодавні ігри', play: 'Грати', stop: 'Зупинити', cancel: 'Скасувати', install: 'Встановити', games: 'Ігор', hours: 'Награно, год',
        disk: 'На дисках, ГБ', twoWeeks: 'За 2 тижні, год', unplayed: 'Не запущено', perfect: 'Ідеальні ігри',
        today: 'Сьогодні', yday: 'Учора', inGame: 'у грі', inTwoWeeks: 'за два тижні',
        slOpen: 'Показати список ігор', slClose: 'Сховати список ігор',
        ach: (n, of) => `${n} з ${of} досягнень`,
        sub: {
          games: n => `${n} встановлено`,
          inGames: n => `у ${n} ${plural(n, { one: 'грі', other: 'іграх' })}`,
          share: n => `${n}% бібліотеки`,
          average: n => `${n}% у середньому`,
          drives: n => `на ${n} ${plural(n, { one: 'диску', other: 'дисках' })}`,
        },
        hello: h => (h < 5 ? 'Доброї ночі,' : h < 12 ? 'Доброго ранку,' : h < 18 ? 'Доброго дня,' : h < 23 ? 'Доброго вечора,' : 'Доброї ночі,') },
    en: { cont: 'Continue', recent: 'Recently played', play: 'Play', stop: 'Stop', cancel: 'Cancel', install: 'Install', games: 'Games', hours: 'Hours played',
        disk: 'On disk, GB', twoWeeks: 'Hours, 2 weeks', unplayed: 'Unplayed', perfect: 'Perfect games',
        today: 'Today', yday: 'Yesterday', inGame: 'played', inTwoWeeks: 'in two weeks',
        slOpen: 'Show the game list', slClose: 'Hide the game list',
        ach: (n, of) => `${n} of ${of} achievements`,
        sub: {
          games: n => `${n} installed`,
          inGames: n => `in ${n} ${plural(n, { one: 'game', other: 'games' })}`,
          share: n => `${n}% of the library`,
          average: n => `${n}% average`,
          drives: n => `on ${n} ${plural(n, { one: 'drive', other: 'drives' })}`,
        },
        hello: h => (h < 5 ? 'Good night,' : h < 12 ? 'Good morning,' : h < 18 ? 'Good afternoon,' : h < 23 ? 'Good evening,' : 'Good night,') },
  };
  const W = () => WORDS[locale()];
  // "one" or everything else is all the header's phrases need, in either language
  const plural = (n, forms) => (new Intl.PluralRules(locale()).select(n) === 'one' ? forms.one : forms.other);
  // A day of this year needs no year. An older one does, or "12 Oct" could be any October; with
  // «Home games → Whole library» the home shows games last played years ago.
  const dayShort = { format: d => new Intl.DateTimeFormat(locale(), d.getFullYear() === new Date().getFullYear()
    ? { day: 'numeric', month: 'short' } : { day: 'numeric', month: 'short', year: 'numeric' }).format(d) };
  const clock = { format: d => new Intl.DateTimeFormat(locale(), { hour: '2-digit', minute: '2-digit' }).format(d) };

  const relDay = ts => {
    const d = new Date(ts * 1000), now = new Date();
    const days = Math.round((new Date(now.getFullYear(), now.getMonth(), now.getDate()) -
      new Date(d.getFullYear(), d.getMonth(), d.getDate())) / 864e5);
    if (days === 0) return W().today;
    if (days === 1) return W().yday;
    return dayShort.format(d);
  };
  const hoursOf = min => (min < 60
    ? `${min} ${isUk() ? 'хв' : 'min'}`
    : `${(min / 60).toLocaleString(locale(), { maximumFractionDigits: 1 })} ${isUk() ? 'год' : 'h'}`);

  /* ═════════════ Big Picture: the focused game paints the screen ═════════════ */

  // Switch "Big Picture → Cover" (css/bigpicture.css). Steam keeps the focused game's
  // art behind its home screen; during a move there are two images — the incoming one
  // first, the outgoing one marked OffScreen. Reading the last one showed the game just
  // left, so the chip and the colour were always one step behind.
  //
  // That art is blurred here ONCE per game into a small canvas and stretched over the
  // screen; two canvases cross-fade. A CSS blur on Steam's own images was redone on every
  // frame of its cross-fade: 19 frames over 50 ms per carousel run, 0 without it. The image
  // is fetched, decoded and scaled down off the main thread before it is touched (drawing
  // the full hero stalled frames too), and fast scrolling skips the games in between.
  // The chip is plain DOM, so the gamepad never lands on it: it only tells.
  if (isGamepad) {
    const enabled = () => getComputedStyle(root).getPropertyValue('--gd-bpm').trim() === 'cover';

    const bgImage = () => [...document.querySelectorAll('.BasicHome .RecentGamesBackgroundImage')]
      .find(i => !i.classList.contains('OffScreen')) || null;

    // the background component knows its game (props.appid a few fibers up); custom and
    // cached URLs carry it too
    const appOf = img => {
      const key = Object.keys(img).find(k => k.startsWith('__reactFiber'));
      for (let f = key && img[key], i = 0; f && i < 8; f = f.return, i++) {
        const p = f.memoizedProps;
        if (p && typeof p.appid === 'number') return p.appid;
      }
      const m = (img.src || '').match(/\/(?:customimages|assets)\/(\d+)/);
      return m ? Number(m[1]) : null;
    };

    const ago = ts => {
      if (!ts) return isUk() ? 'ще не запускав' : 'never played';
      const m = Math.max(0, Math.round((Date.now() / 1000 - ts) / 60));
      if (m < 60) return isUk() ? `${m} хв тому` : `${m} min ago`;
      if (m < 1440) return isUk() ? `${Math.round(m / 60)} год тому` : `${Math.round(m / 60)} h ago`;
      const d = Math.round(m / 1440);
      if (d === 1) return W().yday.toLowerCase();
      if (d < 45) return isUk() ? `${d} дн. тому` : `${d} days ago`;
      // past a month and a half, months; past a year, years ("843 days ago" says little)
      if (d < 365) { const mo = Math.round(d / 30.44); return isUk() ? `${mo} міс. тому` : `${mo} ${mo === 1 ? 'month' : 'months'} ago`; }
      const y = Math.floor(d / 365.25);
      return isUk() ? `${y} р. тому` : `${y} ${y === 1 ? 'year' : 'years'} ago`;
    };
    const hours = min => (min < 60 ? `${min} ${isUk() ? 'хв' : 'min'}`
      : `${(min / 60).toLocaleString(locale(), { maximumFractionDigits: min < 6000 ? 1 : 0 })} ${isUk() ? 'год' : 'h'}`);

    /* the art layer */
    const W = 192, H = 108, PAD = 12;
    const layer = document.createElement('div');
    layer.id = 'gd-bpm-bg';
    const planes = [0, 1].map(() => {
      const c = document.createElement('canvas');
      c.width = W; c.height = H;
      layer.appendChild(c);
      return c;
    });
    let front = -1;
    const paintArt = img => {
      const next = front === 0 ? 1 : 0;
      const ctx = planes[next].getContext('2d');
      ctx.clearRect(0, 0, W, H);
      ctx.filter = 'blur(4px) brightness(.72) saturate(1.5)';
      // cover the screen with a margin past every edge, so the blur does not fade at the border
      const iw = img.naturalWidth || img.width, ih = img.naturalHeight || img.height;
      const r = Math.max((W + PAD * 2) / iw, (H + PAD * 2) / ih);
      const w = iw * r, h = ih * r;
      ctx.drawImage(img, (W - w) / 2, (H - h) / 2, w, h);
      planes[next].classList.add('on');
      if (front >= 0 && front !== next) planes[front].classList.remove('on');
      front = next;
    };

    /* the chip — built once per game, logo or name, never both in turn */
    const chip = document.createElement('div');
    chip.id = 'gd-bpm-chip';
    let chipToken = 0;
    const renderChip = (o, app) => {
      const header = document.querySelector('.BasicHome .Header');
      const mine = ++chipToken;
      if (!header || !app) { chip.remove(); return; }
      const min = app.minutes_playtime_forever || 0;
      // a game from outside Steam has no playtime Steam knows of: no "0 h" for it
      const timed = min > 0 || (app.rt_last_time_played && app.app_type !== SHORTCUT);
      const stats = `<span>${timed ? `<b>${hours(min)}</b> · ` : ''}${ago(app.rt_last_time_played)}</span>`;
      const put = head => {
        if (mine !== chipToken) return;
        chip.textContent = '';
        chip.dataset.app = String(app.appid);
        chip.append(head);
        chip.insertAdjacentHTML('beforeend', stats);
        if (chip.parentElement !== header) header.insertBefore(chip, header.firstChild);
      };
      // the logo too goes through the off-thread shrink: a 3539×1756 custom logo decoded
      // in the header held a frame for ~90 ms
      const urls = artFor(o, app).logo;
      const next = async i => {
        if (i >= urls.length) {
          const name = document.createElement('span');
          name.className = 'gd-name';
          name.textContent = app.display_name;
          put(name);
          return;
        }
        // the CDN refuses fetch() (no CORS), and its official logos are small anyway: a plain <img>
        if (/^https?:/.test(urls[i])) {
          const img = new Image();
          img.alt = '';
          img.onload = () => put(img);
          img.onerror = () => next(i + 1);
          img.src = urls[i];
          return;
        }
        let bmp;
        try { bmp = await cached('logo:' + urls[i], () => shrink(urls[i], { resizeHeight: 40, resizeQuality: 'high' })); }
        catch (e) { next(i + 1); return; }
        const c = document.createElement('canvas');
        c.width = bmp.width; c.height = bmp.height;
        c.getContext('2d').drawImage(bmp, 0, 0);
        put(c);
      };
      next(0);
    };
    const appRecord = (o, id) => {
      try { return o.appStore.GetAppOverviewByAppID(id) || o.appStore.allApps.find(a => a.appid === id) || null; }
      catch (e) { return null; }
    };

    /* one game at a time, after it is decoded */
    let want = null, timer = 0, token = 0, chipApp = null, minute = 0;
    // Fetched and scaled down to 320 px off the main thread. Drawing the full decoded
    // 1920×620 hero into a canvas that is then read back pulled it off the GPU and held
    // a frame for 50–240 ms, right in the middle of Steam's cross-fade.
    // Custom art can be huge (animated PNGs of 10–75 MB here), so each picture is fetched
    // once and kept small: the last 16 of them, 320 px wide.
    const small = new Map();
    const shrink = async (src, opts) => {
      const res = await fetch(src);
      if (!res.ok) throw new Error(String(res.status));
      return createImageBitmap(await res.blob(), opts);   // a 40-byte "missing" stub rejects here
    };
    const remember = (key, bmp) => {
      small.set(key, bmp);
      if (small.size > 16) {
        const [oldKey, oldBmp] = small.entries().next().value;
        small.delete(oldKey);
        oldBmp.close();
      }
      return bmp;
    };
    const cached = async (key, make) => {
      if (small.has(key)) { const b = small.get(key); small.delete(key); small.set(key, b); return b; }
      return remember(key, await make());
    };
    const loadSmall = src => cached(src, () => shrink(src, { resizeWidth: 320, resizeQuality: 'medium' }));
    const apply = async (src, id) => {
      const mine = ++token;
      let img;
      try { img = await loadSmall(src); } catch (e) { return; }
      if (mine !== token || !enabled()) return;
      paintArt(img);
      if (layer.classList.contains('show')) root.classList.add('gd-bpm-bg');
      const picked = accentLocked() ? null : accentFrom(img);
      if (picked) root.style.setProperty('--gd-bpm-accent', picked.accent);
      else root.style.removeProperty('--gd-bpm-accent');
      const o = shared();
      chipApp = o && id ? appRecord(o, id) : null;
      minute = Math.floor(Date.now() / 60000);
      renderChip(o, chipApp);
    };
    const schedule = (src, id) => {
      clearTimeout(timer);
      timer = setTimeout(() => { apply(src, id); }, 160);
    };

    const teardown = () => {
      clearTimeout(timer);
      token++; chipToken++;
      chip.remove(); layer.remove();
      root.classList.remove('gd-bpm-bg');
      root.style.removeProperty('--gd-bpm-accent');
      want = null; chipApp = null; front = -1;
      planes.forEach(c => c.classList.remove('on'));
    };

    const step = () => {
      if (!enabled()) { if (want !== null || layer.isConnected) teardown(); return; }
      const img = bgImage();
      if (!img) {
        // not the home screen: a game page shows its own hours — its colour only
        chipToken++;
        chip.remove();
        layer.classList.remove('show');
        root.classList.remove('gd-bpm-bg');
        const hero = [...document.querySelectorAll('.ImgContainer img.ImgSrc')].find(i => /hero/.test(i.src));
        if (hero && hero.src !== want) { want = hero.src; schedule(hero.src, null); }
        return;
      }
      const home = document.querySelector('.BasicHome');
      if (home && layer.parentElement !== home) home.insertBefore(layer, home.firstChild);
      layer.classList.add('show');
      if (front >= 0) root.classList.add('gd-bpm-bg');
      if (img.src !== want) { want = img.src; schedule(img.src, appOf(img)); return; }
      // "N хв тому" moves on by itself
      const now = Math.floor(Date.now() / 60000);
      if (chipApp && now !== minute) { minute = now; renderChip(shared(), chipApp); }
    };
    setInterval(() => { try { step(); } catch (e) { /* Big Picture extras are a bonus, never break it */ } }, 250);
    return;
  }

  // What the block shows can change underneath it — a game just played, custom
  // art set from the library — so it is rebuilt whenever that picture changes,
  // checked at most every couple of seconds.
  let homeChecked = 0;
  let homeSig = '';

  // Space taken in every mounted Steam library folder: games, DLC, workshop
  // items, shader caches and staged updates — the parts Settings → Storage lists.
  // Steam answers asynchronously, so the header keeps the last answer and asks
  // again once a minute, or at once when something is installed or removed.
  let diskBytes = null;
  let diskDrives = 0;   // library folders that actually hold something
  let diskAsked = 0;
  let diskFor = -1;

  const askDisk = (o, installedCount) => {
    const now = Date.now();
    if (installedCount === diskFor && now - diskAsked < 60000) return;
    diskFor = installedCount;
    diskAsked = now;
    try {
      o.SteamClient.InstallFolder.GetInstallFolders().then(folders => {
        const mounted = folders.filter(f => f && f.bIsMounted !== false);
        diskBytes = mounted.reduce((sum, f) => {
          const parts = [f.nAppSize, f.nDLCSize, f.nWorkshopSize, f.nShaderSize, f.nStagedSize].map(Number);
          return sum + (parts.every(Number.isFinite) ? parts.reduce((a, b) => a + b, 0) : Number(f.nUsedSize) || 0);
        }, 0);
        diskDrives = mounted.filter(f => Number(f.nUsedSize) > 0).length;
        homeChecked = 0;   // show it on the next pass
      }).catch(() => {});
    } catch (e) { /* a client without this call: the per-app sizes stand in */ }
  };

  // Which numbers the header shows: the switches «Home number: …» (css/options/stat-*.css).
  // Option files load before css/steam.css, so a default written there would always win.
  // Hence no defaults in CSS at all: a number that is on by default stays on unless its
  // variable says "off", and one that is off by default needs "on".
  const STATS = [
    ['games', 'games', true],
    ['hours', 'hours', true],
    ['twoWeeks', 'two-weeks', false],
    ['unplayed', 'unplayed', false],
    ['perfect', 'perfect', false],
    ['disk', 'disk', true],
  ];
  const statsShown = () => {
    const css = getComputedStyle(root);
    const says = name => css.getPropertyValue(`--gd-stat-${name}`).trim();
    return {
      list: STATS.filter(([, name, byDefault]) => (byDefault ? says(name) !== 'off' : says(name) === 'on')).map(([key]) => key),
      sub: says('sub') === 'on',
    };
  };

  // Achievement progress as Steam caches it for the library: an entry for every game it
  // has looked at, which covers the ones ever started. A game counts as perfect when all
  // of its achievements are unlocked; `average` is over the games with at least one.
  // Null when the client has no such cache.
  const achievements = (o, games) => {
    try {
      const mine = new Set(games.map(a => a.appid));
      let perfect = 0, started = 0, percent = 0;
      for (const [id, e] of o.appAchievementProgressCache.m_achievementProgress.mapCache) {
        if (!e || !(e.total > 0) || !mine.has(Number(id))) continue;
        if (e.all_unlocked) perfect++;
        if (e.unlocked > 0) { started++; percent += Number(e.percentage) || 0; }
      }
      return { perfect, average: started ? Math.round(percent / started) : 0 };
    } catch (e) { return null; }
  };

  // That cache goes stale on its own. Steam renews an entry only when something asks about
  // a game played since it was cached, and never for a game that got new achievements with
  // a DLC: two such games stayed "perfect" here for a month. So while the number is on,
  // the header keeps the cache current itself, through Steam's own queue (one batched
  // request for everything queued). A played game is asked about when it has no entry,
  // when it was played after the entry was made (Steam's own test), or when the entry is
  // older than a day. A hundred games at a time, the next hundred once Steam has its
  // answer, and no game more often than every six hours whatever comes back.
  const ACH_MAX_AGE = 24 * 3600;       // seconds, like cache_time
  const ACH_ASK_GAP = 6 * 3600 * 1000;
  const ACH_BATCH = 100;
  const achAsked = new Map();          // appid → when it was last asked about
  let achSent = 0;
  const renewAchievements = (o, games) => {
    try {
      const cache = o.appAchievementProgressCache;
      const now = Date.now();
      const waiting = cache.m_mapQueuedCacheMisses ? cache.m_mapQueuedCacheMisses.size : 0;
      if (waiting && now - achSent < 60000) return;   // a minute without an answer: stop waiting for it
      const known = (cache.m_achievementProgress && cache.m_achievementProgress.mapCache) || new Map();
      let room = ACH_BATCH;
      for (const a of games) {
        if (a.app_type === SHORTCUT) continue;   // nothing to ask Steam about a game from outside it
        if (!(a.minutes_playtime_forever > 0) || now - (achAsked.get(a.appid) || 0) < ACH_ASK_GAP) continue;
        const e = known.get(a.appid);
        if (e && a.rt_last_time_played <= e.cache_time && now / 1000 - e.cache_time < ACH_MAX_AGE) continue;
        achAsked.set(a.appid, now);
        cache.QueueCacheUpdate(a.appid);
        achSent = now;
        if (!--room) break;
      }
    } catch (e) { /* no such cache in this client: the number shows a dash */ }
  };

  // One game's entry in that cache, for the Continue card (switch «Continue card: achievements»,
  // css/options/cont-ach-on.css). Null for a game with no achievements, or none known yet.
  const achievementsOf = (o, app) => {
    try {
      const e = o.appAchievementProgressCache.m_achievementProgress.mapCache.get(app.appid);
      return e && e.total > 0 ? e : null;
    } catch (e) { return null; }
  };

  // "· 1.4 h in two weeks" for the Continue card. Nothing when it would say zero or only
  // repeat the total next to it.
  const twoWeeksOf = app => {
    const recent = app.minutes_playtime_last_two_weeks || 0;
    return recent > 0 && recent < (app.minutes_playtime_forever || 0) ? ` · ${hoursOf(recent)} ${W().inTwoWeeks}` : '';
  };

  // The Continue button follows its game the way the button on the game's own page does:
  // Play, Cancel while Steam is starting it, Stop while it runs (#11), Install when the game
  // is not on this machine (it can be, with «Home games → Whole library»). Steam keeps the
  // state per client; the numbers are its EDisplayStatus.
  const LAUNCHING = 1, RUNNING = 4, TERMINATING = 36;
  const playState = app => {
    let status;
    try {
      const local = app.local_per_client_data;
      status = local && local.display_status !== undefined ? local.display_status : app.display_status;
    } catch (e) { /* an overview without it: Play */ }
    return status === LAUNCHING ? 'cancel' : status === RUNNING || status === TERMINATING ? 'stop'
      : isInstalled(app) ? 'play' : 'install';
  };
  const PLAY_ICONS = {
    play: '<path fill="currentColor" d="M8 5.2v13.6a.8.8 0 0 0 1.2.7l10.9-6.8a.8.8 0 0 0 0-1.4L9.2 4.5A.8.8 0 0 0 8 5.2z"/>',
    cross: '<path fill="none" stroke="currentColor" stroke-width="2.8" stroke-linecap="round" d="M6.5 6.5l11 11m0-11l-11 11"/>',
    install: '<path fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" d="M12 4v11m-4.5-4.5L12 15l4.5-4.5M5.5 19.5h13"/>',
  };
  const paintPlay = (button, state) => {
    if (button.dataset.state === state) return;
    button.dataset.state = state;
    button.innerHTML = `<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">${PLAY_ICONS[state] || PLAY_ICONS.cross}</svg>${W()[state]}`;
  };
  // The header is rebuilt only when what it shows changes, and that would redraw the art
  // too. A game starting or stopping changes the button alone, so it is repainted in place.
  const syncPlay = () => {
    const button = document.querySelector('.gd-continue .gd-play');
    const o = shared();
    if (!button || !o) return;
    try {
      const app = o.appStore.GetAppOverviewByAppID(Number(button.closest('.gd-continue').dataset.app));
      if (app) paintPlay(button, playState(app));
    } catch (e) { /* the button stays as it is */ }
  };

  /* ── the recent row: a look at the game under the pointer ── */

  // Switch «Recently played: preview» (on by default; css/options/recent-preview-off.css turns it
  // off), an idea from #13.
  // Nothing is asked for until a cover has been pointed at for a moment. Then the game's hero
  // art goes up at once, and over it, in turn: the user's own screenshots of that game, newest
  // first (Steam's list of them, read once), and the store's (its small versions, asked once
  // per game). The card sits on <body>: the pane the home is in clips anything fixed inside it.
  const SHOT_EVERY = 3500;
  const storeShots = new Map();   // appid → promise of addresses
  const storeShotsOf = appid => {
    if (!storeShots.has(appid)) {
      storeShots.set(appid, fetch(`https://store.steampowered.com/api/appdetails?appids=${appid}&filters=screenshots`)
        .then(r => r.json())
        .then(j => ((j && j[appid] && j[appid].data && j[appid].data.screenshots) || [])
          .map(s => s && s.path_thumbnail).filter(u => /^https:\/\//.test(u || '')).slice(0, 8))
        .catch(() => { storeShots.delete(appid); return []; }));
    }
    return storeShots.get(appid);
  };
  let ownShots = null;            // promise of every local screenshot's record
  const ownShotsOf = (o, app) => {
    if (!ownShots) {
      try {
        const api = o.SteamClient.Screenshots;
        ownShots = api.GetAllAppsLocalScreenshotsCount()
          .then(n => (n > 0 ? api.GetAllAppsLocalScreenshotsRange(0, n - 1) : []))
          .catch(() => { ownShots = null; return []; });
      } catch (e) { return Promise.resolve([]); }
    }
    const ids = new Set([String(app.appid), gameIdOf(app)]);
    return ownShots.then(all => (Array.isArray(all) ? all : [])
      .filter(s => s && ids.has(String(s.strGameID)) && s.strUrl)
      .sort((a, b) => (b.nCreated || 0) - (a.nCreated || 0))
      .slice(0, 4).map(s => '/' + String(s.strUrl).replace(/^\/+/, '')));
  };

  let peek = null;                // the card of the home that is on screen, and how to put it away
  const dropPeek = () => { if (peek) { peek.hide(); peek.card.remove(); peek = null; } };
  addEventListener('scroll', () => peek && peek.hide(), true);
  const wirePeek = (o, block, shelf) => {
    const card = document.createElement('div');
    card.className = 'gd-peek';
    card.hidden = true;
    card.innerHTML = '<img alt=""><div><strong></strong><span></span></div>';
    const img = card.querySelector('img'), title = card.querySelector('strong'), line = card.querySelector('span');
    let wait = 0, turn = 0, shown = null;
    const hide = () => { clearTimeout(wait); clearTimeout(turn); shown = null; card.hidden = true; };
    const show = cap => {
      const app = shelf.find(a => String(a.appid) === cap.dataset.app);
      if (!app) return;
      shown = app.appid;
      title.textContent = app.display_name;
      line.textContent = playedOf(app);
      img.onerror = null;
      img.removeAttribute('src');
      const at = cap.getBoundingClientRect();
      card.hidden = false;
      const w = card.offsetWidth, h = card.offsetHeight;
      card.style.left = `${Math.max(12, Math.min(innerWidth - w - 12, at.left + at.width / 2 - w / 2))}px`;
      // under the cover while there is room: over it, the card would hide the Continue card's button
      card.style.top = `${at.bottom + 12 + h <= innerHeight - 12 ? at.bottom + 12 : Math.max(12, at.top - h - 12)}px`;
      detailsReady(o, app).promise.then(() => { if (shown === app.appid && !img.getAttribute('src')) chain(img, artFor(o, app).hero); });
      // the store knows nothing of a game from outside Steam; its screenshots carry its long id
      Promise.all([ownShotsOf(o, app), app.app_type === SHORTCUT ? [] : storeShotsOf(app.appid)]).then(([own, store]) => {
        const urls = [...own, ...store];
        let i = 0;
        const next = () => {
          if (shown !== app.appid || !urls.length) return;
          const url = urls[i % urls.length];
          const probe = new Image();
          probe.onload = () => {
            if (shown !== app.appid) return;
            img.onerror = null;
            img.src = url;
            i++;
            if (urls.length > 1) turn = setTimeout(next, SHOT_EVERY);
          };
          probe.onerror = () => { urls.splice(i % urls.length, 1); next(); };
          probe.src = url;
        };
        next();
      });
    };
    block.addEventListener('pointerover', e => {
      const cap = e.target.closest('.gd-cap');
      if (!cap || cap.contains(e.relatedTarget)) return;
      clearTimeout(wait);
      wait = setTimeout(() => { if (cap.isConnected) show(cap); }, 350);
    });
    block.addEventListener('pointerout', e => {
      const cap = e.target.closest('.gd-cap');
      if (cap && !cap.contains(e.relatedTarget)) hide();
    });
    block.addEventListener('pointerdown', hide);
    document.body.appendChild(card);
    peek = { card, hide };
  };

  const buildHome = () => {
    const o = shared();
    const host = document.querySelector('.LibraryHome');
    if (!o || !host) { dropPeek(); return; }
    // switch «Library home → Steam» (css/options/home-steam.css)
    if (getComputedStyle(root).getPropertyValue('--gd-home').trim() === 'steam') {
      host.querySelectorAll('.gd-home').forEach(b => b.remove());
      dropPeek();
      homeSig = '';
      return;
    }
    const anchor = host.closest('.Body.InnerContainer') || host.parentElement || host;
    const existing = anchor.querySelector(':scope > .gd-home');
    if (existing && anchor.firstElementChild !== existing) anchor.insertBefore(existing, anchor.firstElementChild);

    const now = Date.now();
    if (existing && now - homeChecked < 2500) return;
    homeChecked = now;

    const apps = installedApps(o);
    const games = libraryGames(o);
    const last = lastPlayed(o);   // null when nothing the home may show has been played yet
    if (!games.length && !apps.length) return;

    // switch «Recently played shelf» (css/options/recent-hide.css). Up to eleven games; the row
    // itself shows as many of them as fit across it (css/steam.css).
    const rowOff = getComputedStyle(root).getPropertyValue('--gd-recent').trim() === 'off';
    const shelf = !last || rowOff ? [] : homeApps(o).filter(a => a.rt_last_time_played && playable(a) && a.appid !== last.appid)
      .sort((a, b) => b.rt_last_time_played - a.rt_last_time_played)
      .slice(0, 11);
    const peeking = getComputedStyle(root).getPropertyValue('--gd-recent-preview').trim() !== 'off';
    // switch «Continue card: achievements»: the card keeps that one entry of Steam's cache current
    const wantAch = !!last && getComputedStyle(root).getPropertyValue('--gd-cont-ach').trim() === 'on';
    if (wantAch) renewAchievements(o, [last]);
    const lastAch = wantAch ? achievementsOf(o, last) : null;
    const minutes = games.reduce((s, a) => s + (a.minutes_playtime_forever || 0), 0);
    askDisk(o, apps.length);
    // until Steam answers, the installed apps' own sizes (no workshop items or shaders)
    const bytes = diskBytes !== null ? diskBytes : apps.reduce((s, a) => s + Number(a.size_on_disk || 0), 0);
    // 2^30, like Steam's own Storage page, which also calls the unit GB
    const gigs = Math.round(bytes / 2 ** 30);
    const name = (document.querySelector('.SuperNav .MenuButton span') || {}).textContent || '';

    // every number the header can show, with the small line that may go under it
    const shown = statsShown();
    const installed = new Set(apps.map(a => a.appid));
    const played = games.filter(wasPlayed).length;
    const recent = games.filter(a => a.minutes_playtime_last_two_weeks > 0);
    if (shown.list.includes('perfect')) renewAchievements(o, games);
    const ach = shown.list.includes('perfect') ? achievements(o, games) : null;
    const numbers = {
      games: [games.length, () => W().sub.games(games.filter(a => installed.has(a.appid)).length)],
      hours: [Math.round(minutes / 60), () => W().sub.inGames(played)],
      twoWeeks: [Math.round(recent.reduce((s, a) => s + a.minutes_playtime_last_two_weeks, 0) / 60), () => W().sub.inGames(recent.length)],
      unplayed: [games.length - played, () => W().sub.share(games.length ? Math.round((games.length - played) / games.length * 100) : 0)],
      perfect: [ach ? ach.perfect : '–', () => (ach ? W().sub.average(ach.average) : '')],
      disk: [gigs, () => (diskDrives ? W().sub.drives(diskDrives) : '')],
    };
    const stats = shown.list.map(key => ({ label: W()[key], value: numbers[key][0], sub: shown.sub ? numbers[key][1]() : '' }));

    const sig = [locale(), new Date().getHours(), name, ...stats.map(s => `${s.label}=${s.value}/${s.sub}`),
      ...(last ? [last.rt_last_time_played, last.minutes_playtime_forever, last.minutes_playtime_last_two_weeks || 0] : []),
      lastAch ? `${lastAch.unlocked}/${lastAch.total}` : '',
      ...(last ? [last, ...shelf] : []).map(a => `${a.appid}:${a.rt_custom_image_mtime || 0}`)].join('|');
    if (existing && sig === homeSig) return;
    homeSig = sig;
    dropPeek();

    const block = document.createElement('div');
    block.className = 'gd-home';
    block.innerHTML = `
      <div class="gd-top">
        <div class="gd-hello">
          <small>${W().hello(new Date().getHours())}</small>
          <strong>${esc(name)}</strong>
        </div>
        ${!stats.length ? '' : `<div class="gd-stats">${stats.map(s => `
          <div><small>${s.label}</small><b class="gd-num">${s.value}</b>${s.sub ? `<i>${esc(s.sub)}</i>` : ''}</div>`).join('')}
        </div>`}
      </div>${!last ? '' : `
      <div class="gd-continue" data-app="${last.appid}">
        <img class="gd-cont-art" alt="">
        <div class="gd-cont-body">
          <small>${W().cont}</small>
          <img class="gd-cont-logo" alt="">
          <span class="gd-cont-name">${esc(last.display_name)}</span>
          <div class="gd-cont-meta">${relDay(last.rt_last_time_played)}, ${clock.format(new Date(last.rt_last_time_played * 1000))}${
            playedOf(last) ? ` · ${playedOf(last)}` : ''}</div>${!lastAch ? '' : `
          <div class="gd-cont-ach"><i><b style="width: ${Math.round(lastAch.unlocked / lastAch.total * 100)}%"></b></i>${esc(W().ach(lastAch.unlocked, lastAch.total))}</div>`}
          <button class="gd-play" data-game="${esc(gameIdOf(last))}"></button>
        </div>
      </div>${!shelf.length ? '' : `
      <h4 class="gd-label">${W().recent}</h4>
      <div class="gd-shelf">
        ${shelf.map(a => `
          <button class="gd-cap" data-app="${a.appid}"${peeking ? '' : ` title="${esc(a.display_name)}"`}>
            <img alt="">
            <span>${relDay(a.rt_last_time_played)}</span>
          </button>`).join('')}
      </div>`}`}`;

    if (last) {
      paintPlay(block.querySelector('.gd-play'), playState(last));
      const hero = block.querySelector('.gd-cont-art');
      const logo = block.querySelector('.gd-cont-logo');
      const title = block.querySelector('.gd-cont-name');
      logo.addEventListener('load', () => title.remove(), { once: true });
      // both pictures wait until Steam knows where this game keeps its files
      detailsReady(o, last).promise.then(() => {
        const art = artFor(o, last);
        chain(hero, art.hero, () => hero.remove());
        // the logo is optional; the game's name stands in when there is none
        chain(logo, art.logo, () => { logo.remove(); title.classList.add('on'); });
      });
    }

    // a game with no cover at all gets its name on a plain tile
    block.querySelectorAll('.gd-cap').forEach((cap, i) => {
      const img = cap.querySelector('img');
      chain(img, artFor(o, shelf[i]).portrait, () => {
        const tile = document.createElement('span');
        tile.className = 'gd-cap-text';
        tile.textContent = shelf[i].display_name;
        img.replaceWith(tile);
      });
    });

    block.addEventListener('click', e => {
      const play = e.target.closest('.gd-play');
      if (play) {
        e.stopPropagation();
        const id = play.dataset.game;
        if (!id) { console.warn('[Glass Dusk] немає ідентифікатора гри для запуску'); return; }
        try {
          if (play.dataset.state === 'stop') o.SteamClient.Apps.TerminateApp(id, false);
          else if (play.dataset.state === 'cancel') o.SteamClient.Apps.CancelLaunch(id);
          else if (play.dataset.state === 'install') o.SteamClient.URL.ExecuteSteamURL('steam://install/' + play.closest('.gd-continue').dataset.app);
          else o.SteamClient.Apps.RunGame(id, '', -1, 100);
        } catch (err) { console.warn('[Glass Dusk] кнопка гри не спрацювала', err); }
        return;
      }
      const card = e.target.closest('[data-app]');
      if (card) {
        try { o.SteamClient.URL.ExecuteSteamURL('steam://nav/games/details/' + card.dataset.app); } catch (err) { /* ignore */ }
      }
    });

    if (existing) existing.replaceWith(block);
    else anchor.insertBefore(block, anchor.firstElementChild);
    if (peeking && shelf.length) wirePeek(o, block, shelf);
    state.home++;
  };

  /* ═════════════ the divider beside a game list on the right ═════════════ */

  // Steam sizes the list from the list's own left edge to the pointer. That holds while the
  // list is on the left; on the right (the theme's default) the edge under the pointer is the
  // one that moves, so the list snapped to its narrowest and would not come back (#13).
  // While that divider is held, Steam is handed a pointer position that yields the width the
  // real pointer asks for. The width stays Steam's own setting, kept across restarts.
  let held = null;
  const steered = new WeakSet();
  const steer = e => {
    if (!held || steered.has(e)) return;
    const list = held.layout.querySelector(':scope > .LeftListSizableContainer');
    if (!list || (e.type === 'mousemove' && !e.buttons)) { held = null; return; }
    e.stopImmediatePropagation();
    const width = held.layout.getBoundingClientRect().right - (e.clientX - held.grab);
    const told = new MouseEvent(e.type, { bubbles: true, cancelable: true, view: window,
      clientX: list.getBoundingClientRect().left + width, clientY: e.clientY,
      screenX: e.screenX, screenY: e.screenY, button: e.button, buttons: e.buttons });
    steered.add(told);
    e.target.dispatchEvent(told);
    if (e.type === 'mouseup') held = null;
  };
  addEventListener('mousedown', e => {
    const divider = e.button === 0 && e.target.closest ? e.target.closest('.LibraryWindowDivider') : null;
    const layout = divider && divider.parentElement;
    const list = layout && layout.querySelector(':scope > .LeftListSizableContainer');
    if (list && getComputedStyle(layout).flexDirection === 'row-reverse') {
      held = { layout, grab: e.clientX - list.getBoundingClientRect().left };
    }
  }, true);
  addEventListener('mousemove', steer, true);
  addEventListener('mouseup', steer, true);

  /* ═════════════ the game list beside the store ═════════════ */

  // Switch «Store: game list» (css/options/storelist-*.css → --gd-store-list): Steam's own game
  // list stays beside the web pages of the main window (store, community) — pinned, coming out
  // when pointed at, or as a rail of the last games' covers that opens into it (#17). Steam
  // hides the library under .LocalContentContainer with an inline display: none and keeps it
  // mounted once it has been shown; css/steam.css brings the list back as a layer, and the page,
  // a separate view that takes its bounds from .BrowserWrapper, narrows beside it.
  // Marks on <html>: gd-sl-<mode>, gd-on-web while a web page is shown, gd-sl-open while the
  // list is out (On hover, Rail). --gd-list-w is the list's width, which stays Steam's setting.
  const SL_MODES = ['pinned', 'hover', 'rail'];
  let slMode = '', slPrimed = false, slTimer = 0, slWatched = null, slWatchedWeb = null;
  const slRailKept = () => { try { return localStorage.getItem('gd-sl-rail-open') === '1'; } catch (e) { return false; } };
  const slSetOpen = (open, delay) => {
    clearTimeout(slTimer);
    slTimer = setTimeout(() => {
      root.classList.toggle('gd-sl-open', open);
      if (slMode === 'rail') { try { localStorage.setItem('gd-sl-rail-open', open ? '1' : '0'); } catch (e) { /* not kept */ } }
    }, delay || 0);
  };
  // On hover: out after a moment over the list, back in when the pointer leaves for the page.
  // A menu keeps the list out while it is out, but no menu brings it out: the main window has
  // menus of its own away from the list, as on Millennium's settings page (#19). The page is not
  // part of this document, so leaving for it shows as a pointerout with nowhere to go.
  const slInside = el => !!(el && el.closest && (el.closest('.LeftListSizableContainer') ||
    (root.classList.contains('gd-sl-open') && el.closest('.contextMenu, .DropDown'))));
  addEventListener('pointerover', e => {
    if (slMode === 'hover' && root.classList.contains('gd-on-web') && slInside(e.target)) slSetOpen(true, 120);
  }, true);
  addEventListener('pointerout', e => {
    if (slMode === 'hover' && root.classList.contains('gd-on-web') && slInside(e.target) && !slInside(e.relatedTarget)) slSetOpen(false, 200);
  }, true);
  // The list is only there once the library has been shown in this session. When Steam starts
  // on a web page, the library is visited for a moment and the page comes straight back. Steam
  // unloads the page for that visit (its place in the page's history goes to a blank stand-in)
  // and loads it again on the way back, as it does whenever you switch Library → Store; going
  // back before the stand-in is in left the page blank, so the return waits for it.
  const slPrime = () => {
    if (slPrimed) return;
    let o = null, h = null;
    try { o = shared(); h = o.SteamUIStore.WindowStore.MainWindowInstance.m_history; } catch (e) { return; }
    // only once the window is really on a web page (at start it is still on /init)
    if (!h || !/^\/browser/.test(h.location.pathname)) return;
    const m = o.MainWindowBrowserManager;
    const url = m && m.m_URL;
    // and once the page itself is in: at start Steam shows a blank one first, and coming back
    // to that would leave the window empty
    if (m && (!url || /^data:/.test(url))) return;
    slPrimed = true;
    const t0 = Date.now();
    h.push('/library/home');
    const back = () => {
      const ready = document.querySelector('.LeftListSizableContainer') && (!m || /^data:/.test(m.m_URL || ''));
      if (!ready && Date.now() - t0 < 6000) { setTimeout(back, 100); return; }
      setTimeout(() => {
        h.goBack();
        setTimeout(() => {
          try {
            // no "forward" to that visit: Steam's arrow would offer it
            const e = h.entries;
            if (Array.isArray(e) && e.length === h.index + 2 && /^\/library\/home/.test(e[e.length - 1].pathname)) { e.splice(h.index + 1); h.length = e.length; }
            // and if the page did not come back, it is opened again
            if (m && url && /^data:/.test(m.m_URL || '')) m.ShowURL(url);
          } catch (err) { /* the page is a click away */ }
        }, 1500);
      }, 300);
    };
    setTimeout(back, 100);
  };
  const slRail = o => {
    const frame = document.querySelector('.ContentFrame');
    if (!frame) return;
    let rail = document.getElementById('gd-rail');
    if (!rail) {
      rail = document.createElement('div');
      rail.id = 'gd-rail';
      rail.innerHTML = '<button class="gd-rail-open"><svg viewBox="0 0 24 24"><path fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" d="M14.5 6l-6 6 6 6"/></svg></button><div class="gd-rail-caps"></div>';
      const close = document.createElement('button');
      close.id = 'gd-rail-close';
      close.innerHTML = '<svg viewBox="0 0 24 24"><path fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" d="M9.5 6l6 6-6 6"/></svg>';
      rail.addEventListener('click', e => {
        if (e.target.closest('.gd-rail-open')) { slSetOpen(true); return; }
        const cap = e.target.closest('.gd-rail-cap');
        if (cap) { try { shared().SteamUIStore.Navigate('/library/app/' + cap.dataset.app); } catch (err) { /* stays */ } }
      });
      close.addEventListener('click', () => slSetOpen(false));
      rail.close = close;
    }
    rail.querySelector('.gd-rail-open').title = W().slOpen;
    rail.close.title = W().slClose;
    if (rail.parentElement !== frame) frame.appendChild(rail);
    if (rail.close.parentElement !== frame) frame.appendChild(rail.close);
    const hidden = hiddenIn(o);
    const games = o.appStore.allApps.filter(a => playable(a) && a.rt_last_time_played && a.visible_in_game_list !== false && !hidden(a.appid))
      .sort((a, b) => b.rt_last_time_played - a.rt_last_time_played).slice(0, 14);
    const sig = games.map(a => `${a.appid}:${a.rt_custom_image_mtime || 0}`).join('|');
    // kept on the rail itself: Steam may throw it out with the frame's content, and a new one is empty
    if (sig === rail.dataset.sig) return;
    rail.dataset.sig = sig;
    const caps = rail.querySelector('.gd-rail-caps');
    caps.innerHTML = games.map(a => `<button class="gd-rail-cap" data-app="${a.appid}" title="${esc(a.display_name)}"><img alt=""></button>`).join('');
    caps.querySelectorAll('.gd-rail-cap').forEach((cap, i) => {
      const img = cap.querySelector('img');
      chain(img, artFor(o, games[i]).portrait, () => {
        const tile = document.createElement('span');
        tile.textContent = games[i].display_name;
        img.replaceWith(tile);
      });
    });
  };
  const storeList = () => {
    const want = getComputedStyle(root).getPropertyValue('--gd-store-list').trim();
    const mode = SL_MODES.includes(want) ? want : '';
    if (mode !== slMode) {
      for (const m of SL_MODES) root.classList.toggle('gd-sl-' + m, m === mode);
      slMode = mode;
      root.classList.toggle('gd-sl-open', mode === 'rail' && slRailKept());
    }
    const lc = document.querySelector('.LocalContentContainer');
    const web = document.querySelector('.BrowserWrapper');
    // a web page in the main window: Steam hides the library and shows the web view; watch both
    // come and go. Pages of the client's own with the library hidden, such as Millennium's
    // settings, hide the web view too: they are not drawn to make room, so the list stays off
    // them (#19).
    const follow = el => new MutationObserver(() => soon()).observe(el, { attributes: true, attributeFilter: ['style'] });
    if (lc && lc !== slWatched) { slWatched = lc; follow(lc); }
    if (web && web !== slWatchedWeb) { slWatchedWeb = web; follow(web); }
    const onWeb = !!lc && lc.style.display === 'none' && !!web && web.style.display !== 'none';
    root.classList.toggle('gd-on-web', !!mode && onWeb);
    if (!mode || !onWeb) return;
    const list = document.querySelector('.LeftListSizableContainer');
    if (!list) slPrime();   // at start, whatever the mode: opening the rail later then reloads nothing
    if (list) {
      const w = Math.round(list.getBoundingClientRect().width);
      if (w > 0) root.style.setProperty('--gd-list-w', w + 'px');
    }
    const o = shared();
    if (mode === 'rail' && o) slRail(o);
  };

  const tick = () => {
    mountLayer();
    if (signIn()) return;
    try { storeList(); } catch (e) { /* the list beside the store is a bonus */ }
    const want = wantedArt();
    if (want !== KEEP) applyArt(want);
    try { buildHome(); } catch (e) { /* the home header is a bonus, never break the client over it */ }
    syncPlay();
  };

  // React swaps the page in one mutation burst — react to that instead of waiting
  // for the next poll, so the colour turns over as fast as the page does.
  let queued = 0;
  const soon = () => {
    if (queued) return;
    queued = requestAnimationFrame(() => { queued = 0; tick(); });
  };
  const watch = () => {
    const target = document.querySelector('.MainPanel') || document.body;
    if (!target) return;
    new MutationObserver(soon).observe(target, { childList: true, subtree: true });
  };

  setInterval(tick, 1000);                 // fallback for anything the observer misses
  if (document.body) { tick(); watch(); }
  else addEventListener('DOMContentLoaded', () => { tick(); watch(); });
})();
