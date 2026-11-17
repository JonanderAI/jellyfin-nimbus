# Nimbus para Jellyfin

Tema oscuro azul noche con brillo cian, tarjetas con zoom, botones degradados, fondo animado, hero destacado y panel de personalización. Funciona en PC, móvil y TV.

> Probado en Jellyfin Web 10.11 / 12.x (cabecera Material UI). Las apps nativas que no usan Jellyfin Web (Swiftfin, Infuse) no aplican CSS.

## Instalación (una sola vez, se actualiza solo)

Los archivos se sirven desde GitHub Pages, que refresca su caché cada 10 minutos, así que **no hay que cambiar nada cuando se publican mejoras**.

**1. CSS.** En Jellyfin: Panel → General → CSS personalizado:

```css
@import url("https://jonanderai.github.io/jellyfin-nimbus/theme.css");
```

**2. JavaScript (opcional pero recomendado).** El hero del Inicio, las imágenes de las bibliotecas, el texto de episodios, los sonidos y el panel de personalización necesitan JavaScript. Instala el plugin **JavaScript Injector** (necesita el plugin File Transformation) y añade este script:

```js
const s=document.createElement('script');s.src='https://jonanderai.github.io/jellyfin-nimbus/hero.js';document.head.appendChild(s);
```

Después recarga con Ctrl+F5.

## Panel de personalización

El icono de paleta de la barra superior abre un panel con acentos, fuentes, zoom y redondeo de tarjetas, y interruptores para el hero, el fondo animado, las animaciones y los sonidos. Los ajustes se guardan **por navegador y dispositivo** (`localStorage`).

## Variantes opcionales (CSS)

Importa cada una **después** de `theme.css`:

```css
@import url("https://jonanderai.github.io/jellyfin-nimbus/accents/rosa.css");
@import url("https://jonanderai.github.io/jellyfin-nimbus/fonts/magica.css");
@import url("https://jonanderai.github.io/jellyfin-nimbus/rows/wide.css");
```

| Tipo | Archivos |
|---|---|
| Acento | `accents/rosa.css`, `ambar.css`, `menta.css`, `violeta.css` |
| Fuente | `fonts/magica.css` (Outfit), `cine.css` (Cinzel), `tech.css` (Sora), `familiar.css` (Fredoka) |
| Fila | `rows/wide.css` (apaisada), `top.css` (Top numerado), `compact.css` (lista compacta) |

Las filas y los acentos del panel conviven con estos archivos; si usas el panel, no necesitas los de acento ni fuente.

## Personalizar a mano

Variables en `:root`: `--nb-accent`, `--nb-accent-2`, `--nb-accent-rgb` (los tres juntos), `--nb-bg-0`, `--nb-radius`, `--nb-card-zoom`.

## Sonidos

Son tonos suaves sintetizados (sin archivos). Se desactivan en el panel o con `localStorage.setItem('nb-sound','off')`.

## Versiones fijas

Si prefieres congelar una versión, usa jsDelivr con etiqueta, por ejemplo `https://cdn.jsdelivr.net/gh/JonanderAI/jellyfin-nimbus@v1.1.1/theme.css`. Las etiquetas no se actualizan solas.

## Solución de problemas

- No veo cambios: Ctrl+F5. Los navegadores guardan el CSS; GitHub Pages tarda hasta 10 minutos en servir una versión nueva.
- No sale el hero ni el panel: comprueba que el plugin JavaScript Injector está activo y el script guardado.
- Con jsDelivr `@main` la caché puede tardar horas o días: usa GitHub Pages o una etiqueta.

## Créditos

Iconos: Font Awesome 6 Free. Pósters de la maqueta: Blender Foundation (CC BY 3.0).