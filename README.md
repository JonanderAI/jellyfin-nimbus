# Nimbus for Jellyfin

A deep-night-blue theme for Jellyfin Web with a cyan glow: zoomable cards, gradient buttons, animated background, featured hero banner and a built-in customization panel. Works on desktop, mobile and TV.

> Tested on Jellyfin Web 10.11 / 12.x (Material UI header). Native apps that do not use Jellyfin Web (Swiftfin, Infuse) ignore custom CSS.

## Install (once, then it updates itself)

Files are served from GitHub Pages, which refreshes its cache every 10 minutes, so **you never need to change anything when improvements are published**.

**1. CSS.** In Jellyfin: Dashboard → General → Custom CSS code:

```css
@import url("https://jonanderai.github.io/jellyfin-nimbus/theme.css");
```

**2. JavaScript (optional but recommended).** The home hero, library images, episode labels, sounds and the customization panel need JavaScript. Install the **JavaScript Injector** plugin (it requires the File Transformation plugin) and add this script:

```js
const s=document.createElement('script');s.src='https://jonanderai.github.io/jellyfin-nimbus/hero.js';document.head.appendChild(s);
```

Then hard-reload with Ctrl+F5.

## Customization panel

The palette icon in the top bar opens a panel with accent colors, fonts, card zoom and corner radius, plus switches for the hero, animated background, animations and sounds. Settings are saved **per browser and device** (`localStorage`).

## Optional variants (CSS)

Import each one **after** `theme.css`:

```css
@import url("https://jonanderai.github.io/jellyfin-nimbus/accents/rosa.css");
@import url("https://jonanderai.github.io/jellyfin-nimbus/fonts/magica.css");
@import url("https://jonanderai.github.io/jellyfin-nimbus/rows/wide.css");
```

| Type | Files |
|---|---|
| Accent | `accents/rosa.css`, `ambar.css`, `menta.css`, `violeta.css` |
| Font | `fonts/magica.css` (Outfit), `cine.css` (Cinzel), `tech.css` (Sora), `familiar.css` (Fredoka) |
| Row | `rows/wide.css` (landscape), `top.css` (numbered Top), `compact.css` (compact list) |

If you use the panel you do not need the accent or font files.

## Manual tweaks

Variables on `:root`: `--nb-accent`, `--nb-accent-2`, `--nb-accent-rgb` (set the three together), `--nb-bg-0`, `--nb-radius`, `--nb-card-zoom`.

## Sounds

Soft synthesized tones (no audio files). Turn them off in the panel or with `localStorage.setItem('nb-sound','off')`.

## Pinned versions

To freeze a version, use jsDelivr with a tag, for example `https://cdn.jsdelivr.net/gh/JonanderAI/jellyfin-nimbus@v1.2.1/theme.css`. Tags never update on their own.

## Troubleshooting

- Changes not showing: press Ctrl+F5. Browsers cache CSS, and GitHub Pages can take up to 10 minutes to serve a new version.
- No hero or panel: make sure the JavaScript Injector plugin is active and the script is saved.
- jsDelivr `@main` can be stale for hours or days: use GitHub Pages or a tag.

## Credits

Icons: Font Awesome 6 Free. Mockup posters: Blender Foundation (CC BY 3.0).