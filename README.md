# Studio One Color Palette Generator

A modern React-based web application designed to generate, harmonize, and export color palettes from images for use in PreSonus Studio One DAW. 

This tool processes images locally in the browser, extracts dominant color families, applies aesthetic models, and exports ready-to-use `.colorpalette` files.

---

## Key Features

* **Advanced Color Extraction**: Extract palettes using **Categorical** (hue-based classification) or **Dominant Colors** (K-Means clustering) extraction methods.
* **8-Category Hue Space Partitioning**: Segment Hues ($0.0$ to $1.0$) into Red, Orange, Yellow, Green, Teal, Blue, Purple, and Magenta groups. This prevents overlapping color classifications and eliminates duplicate visual rows.
* **Smart Noise Filtering**: Implements a 1% minimum pixel threshold to filter out compression artifacts, transition gradients, and tiny accidental pixels from generating rows.
* **Interpolated Row Stretching**: Automatically refilters similarity *within each row* and stretches or interpolates missing colors using smooth HSL ramps (with circular hue wrapping). This guarantees a perfectly aligned, uniform color grid.
* **Aesthetic Harmonization**: Instantly shift palette tones using preset models (70s, 80s, Vibrant, Neon, Pastel, Earthy, Jewel).
* **Photoshop-style Similarity Filter**: Control color diversity via CIELAB DeltaE distance.
* **Private & Local**: Zero data is sent to external servers; all image operations happen on a local HTML5 canvas.

---

## Technical Stack

* **Build Tool**: [Vite](https://vite.dev)
* **Framework**: [React 19](https://react.dev)
* **Styling**: [TailwindCSS v4](https://tailwindcss.com)
* **Deployment**: [Docker](https://www.docker.com) + [Caddy Server](https://caddyserver.com)

---

## Getting Started

### Local Development

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Start the development server**:
   ```bash
   npm run dev
   ```

3. **Build for production**:
   ```bash
   npm run build
   ```

### Docker Deployment

Deploy the pre-configured production environment using Docker Compose:

```bash
docker-compose up -d --build
```

The app will be served via Caddy and configured for `s1.vladbox.org` (editable in the `Caddyfile`).
