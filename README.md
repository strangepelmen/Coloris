# Coloris — Visual Search Engine by Dominant Color

[![Live Demo](https://img.shields.io/badge/demo-live-brightgreen)](https://strangepelmen.github.io/coloris/)
[![GitHub](https://img.shields.io/badge/license-MIT-blue)](LICENSE)

> **Discover images by their soul.** Upload a photo, extract its dominant color palette, and instantly find royalty-free stock photos that match those hues. Build beautiful collages from what you discover.

---

## Features

- **Image Upload** — Drag-and-drop or click-to-browse with color magnifier loupe
- **Pixel-Perfect Extraction** — Every-pixel binning with 6-bit precision, no quantization artifacts
- **Visual Search** — CIEDE2000 perceptual matching against 202 curated images
- **Color Harmonies** — Complementary, analogous, and triad schemes generated from any palette
- **Palette Export** — Download 1200×630 PNG or copy as CSS/JSON/Tailwind
- **Collage Builder** — Select images, choose layouts (grid/polaroid), export as PNG or html2canvas
- **Random Surprise** — One-click random palette from 10 built-in themes with auto-collage
- **Dark Mode** — Warm charcoal theme with smooth View Transition API
- **Smooth Scroll** — Lenis + GSAP ScrollTrigger for buttery animations
- **Custom Cursor** — Desktop hover-reactive indicator

---

## Tech Stack

| Category | Choice |
|---|---|
| Core | HTML5, CSS3, Vanilla JS (ES2020+) |
| Fonts | Playfair Display + Poppins + JetBrains Mono (Google Fonts) |
| Color extraction | Custom exact binning, MMCQ fallback |
| Color science | CIEDE2000 delta-E (perceptual color difference) |
| Image database | 202 curated images with exact hex tags |
| Animations | GSAP + ScrollTrigger + Lenis smooth scroll |
| Collage export | HTML Canvas API + html2canvas |
| Hosting | GitHub Pages |



## Project Structure

```
coloris/                        # All website files
├── index.html                  # Single-page application
├── 404.html                    # SPA redirect
├── css/
│   ├── main.css                # Design system & components (~1900 lines)
│   └── animations.css          # Keyframes, scroll reveals, reduced motion
├── js/
│   ├── main.js                 # App orchestrator, GSAP, Lenis, event bus
│   ├── colorExtractor.js       # Upload, pixel extraction, magnifier
│   ├── unsplashApi.js          # CIEDE2000 search, color filter
│   ├── collageBuilder.js       # Drawer, drag, layouts, export
│   ├── exportPalette.js        # Palette PNG & clipboard helpers
│   ├── imageDatabase.js        # 202 curated images with hex tags
│   └── pexelsApi.js            # Pexels API client (optional fallback)
├── lib/
│   ├── quantize.js             # MMCQ color quantization (standalone)
│   ├── colorUtils.js           # CIEDE2000, RGB↔Lab, hex matching
│   ├── colorHarmony.js         # Complementary, analogous, triad
│   └── paletteLibrary.js       # 10 built-in curated palettes
├── assets/
│   ├── illustrations/          # 7 SVG illustrations
│   └── demo/                   # Sample demo image
├── config.example.js           # API key template
└── .gitignore
```

---

## Credits

- **Design:** Cafe design system by [typeui.sh](https://typeui.sh)
- **Photos:** [Unsplash](https://unsplash.com) via picsum.photos
- **Color Quantization:** MMCQ algorithm (Leptonica port)
- **Animations:** [GSAP](https://gsap.com) by GreenSock
- **Smooth Scroll:** [Lenis](https://lenis.studiofreight.com) by Studio Freight

---

## License

MIT
