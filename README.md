# S1 Color Palette Generator

A React-based web application for generating color palettes from images, tailored for use with PreSonus Studio One. The tool extracts colors from uploaded images, applies harmonization models, and exports palettes in a `.colorpalette` format compatible with Studio One.

## Features

- **Image-Based Color Extraction**: Upload an image to extract a color palette using either categorical or complementary methods.
- **Harmonization Models**: Apply predefined color harmonization styles (70s, 80s, Vibrant, Neon, Pastel) to adjust the palette's aesthetic.
- **Customizable Parameters**:
  - Adjust the number of colors per hue group.
  - Control the similarity threshold to filter out visually similar colors.
  - Choose between categorical or complementary color extraction methods.
- **Drag-and-Drop Support**: Upload images via file selection or drag-and-drop.
- **Export Functionality**: Export the generated palette as a `.colorpalette` file for use in Studio One.
- **Local Processing**: All image processing and palette generation occur in the browser, ensuring no user data is sent to a server.
