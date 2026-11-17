# Nimbus para Jellyfin

Tema oscuro azul noche con brillo cian, tarjetas con zoom, botones degradados y modo TV con foco marcado. PC, móvil y TV.

> Compatible con Jellyfin Web 10.9+ (navegador, Jellyfin Media Player, Android TV / Fire TV). Swiftfin e Infuse no aplican CSS.
> Los selectores están pensados para Jellyfin Web 10.10/10.11; si algo no encaja en tu versión, abre un issue.

## Instalación

1. Sube este repositorio a GitHub como público (por ejemplo `jellyfin-nimbus`).
2. En Jellyfin: **Panel → General → CSS personalizado**.
3. Pega y guarda (cambia `USUARIO`):

```css
@import url("https://cdn.jsdelivr.net/gh/USUARIO/jellyfin-nimbus@main/theme.css");
```

Para fijar versión usa una etiqueta: `@v1.0.0` en lugar de `@main`.
Para forzar la actualización de la caché: `https://purge.jsdelivr.net/gh/USUARIO/jellyfin-nimbus@main/theme.css`

## Variantes opcionales

Importa cada una **después** de `theme.css`:

```css
@import url("https://cdn.jsdelivr.net/gh/USUARIO/jellyfin-nimbus@main/theme.css");
@import url("https://cdn.jsdelivr.net/gh/USUARIO/jellyfin-nimbus@main/accents/rosa.css");
@import url("https://cdn.jsdelivr.net/gh/USUARIO/jellyfin-nimbus@main/fonts/magica.css");
@import url("https://cdn.jsdelivr.net/gh/USUARIO/jellyfin-nimbus@main/rows/wide.css");
```

| Tipo | Archivos |
|---|---|
| Acento | `accents/rosa.css`, `ambar.css`, `menta.css`, `violeta.css` |
| Fuente | `fonts/magica.css` (Outfit), `cine.css` (Cinzel), `tech.css` (Sora), `familiar.css` (Fredoka) |
| Fila | `rows/wide.css` (apaisada), `top.css` (Top numerado), `compact.css` (lista compacta) |

## Personalizar

Variables en `:root`: `--nb-accent`, `--nb-accent-2`, `--nb-accent-rgb` (los tres juntos), `--nb-bg-0`, `--nb-radius`, `--nb-card-zoom`.

## Créditos

Iconos: Font Awesome 6 Free. Pósters de la maqueta: Blender Foundation (CC BY 3.0).
## Hero del Inicio y bibliotecas con imagen aleatoria (opcional)

El banner destacado y las imágenes aleatorias de "Mis medios" necesitan JavaScript: instala el plugin **JavaScript Injector** en Jellyfin y añade:

```js
const s=document.createElement('script');s.src='https://cdn.jsdelivr.net/gh/USUARIO/jellyfin-nimbus@main/hero.js';document.head.appendChild(s);
```
