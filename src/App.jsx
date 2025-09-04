import React, { useState, useEffect, useRef } from "react";

// Helper functions for color conversions
const rgbToHex = (r, g, b) => {
  const toHex = (c) => `0${c.toString(16)}`.slice(-2);
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
};

const rgbToHsl = (r, g, b) => {
  r /= 255;
  g /= 255;
  b /= 255;
  const max = Math.max(r, g, b),
    min = Math.min(r, g, b);
  let h,
    s,
    l = (max + min) / 2;

  if (max === min) {
    h = s = 0;
  } else {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      case b:
        h = (r - g) / d + 4;
        break;
    }
    h /= 6;
  }
  return [h, s, l];
};

const hslToRgb = (h, s, l) => {
  let r, g, b;
  if (s === 0) {
    r = g = b = l;
  } else {
    const hue2rgb = (p, q, t) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1 / 6) return p + (q - p) * 6 * t;
      if (t < 1 / 2) return q;
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
      return p;
    };
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hue2rgb(p, q, h + 1 / 3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1 / 3);
  }
  return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
};

const harmonizeColors = (colors, model) => {
  const models = {
    "70s": {
      l_mult: 0.85,
      s_mult: 0.7,
      l_shift: 0.1,
      s_shift: 0.0,
      l_range: [0.3, 0.7],
      s_range: [0.4, 0.8],
    },
    "80s": {
      l_mult: 1.2,
      s_mult: 1.3,
      l_shift: 0.0,
      s_shift: 0.1,
      l_range: [0.4, 0.9],
      s_range: [0.6, 1.0],
    },
    vibrant: {
      l_mult: 1.0,
      s_mult: 1.4,
      l_shift: 0.0,
      s_shift: 0.2,
      l_range: [0.3, 0.8],
      s_range: [0.7, 1.0],
    },
    neon: {
      l_mult: 1.3,
      s_mult: 1.5,
      l_shift: 0.1,
      s_shift: 0.3,
      l_range: [0.6, 1.0],
      s_range: [0.8, 1.0],
    },
    pastel: {
      l_mult: 1.2,
      s_mult: 0.5,
      l_shift: 0.2,
      s_shift: 0.0,
      l_range: [0.7, 0.95],
      s_range: [0.2, 0.6],
    },
  };

  const params = models[model] || {};

  return colors.map((color) => {
    let [h, s, l] = rgbToHsl(...color);

    if (params.l_mult) l = l * params.l_mult + params.l_shift;
    if (params.s_mult) s = s * params.s_mult + params.s_shift;

    if (params.l_range)
      l = Math.max(params.l_range[0], Math.min(params.l_range[1], l));
    if (params.s_range)
      s = Math.max(params.s_range[0], Math.min(params.s_range[1], s));

    l = Math.min(1.0, Math.max(0.0, l));
    s = Math.min(1.0, Math.max(0.0, s));

    return hslToRgb(h, s, l);
  });
};

// Convert RGB to LAB color space for perceptual distance calculation
const rgbToLab = (r, g, b) => {
  // Convert RGB to XYZ
  let [x, y, z] = [r, g, b].map((c) => {
    c = c / 255;
    c = c > 0.04045 ? Math.pow((c + 0.055) / 1.055, 2.4) : c / 12.92;
    return c * 100;
  });

  // Observer = 2°, Illuminant = D65
  x = x * 0.4124 + y * 0.3576 + z * 0.1805;
  y = x * 0.2126 + y * 0.7152 + z * 0.0722;
  z = x * 0.0193 + y * 0.1192 + z * 0.9505;

  // Convert XYZ to LAB
  [x, y, z] = [x / 95.047, y / 100.0, z / 108.883].map((c) =>
    c > 0.008856 ? Math.pow(c, 1 / 3) : 7.787 * c + 16 / 116
  );

  return [
    116 * y - 16, // L
    500 * (x - y), // A
    200 * (y - z), // B
  ];
};

// Calculate Delta E (CIE76) - perceptual color difference
const deltaE = (color1, color2) => {
  const [l1, a1, b1] = rgbToLab(...color1);
  const [l2, a2, b2] = rgbToLab(...color2);
  return Math.sqrt(
    Math.pow(l2 - l1, 2) + Math.pow(a2 - a1, 2) + Math.pow(b2 - b1, 2)
  );
};

// Filter out visually similar colors
const filterSimilarColors = (colors, threshold = 10) => {
  const filtered = [];
  for (const color of colors) {
    const isSimilar = filtered.some(
      (existingColor) => deltaE(color, existingColor) < threshold
    );

    if (!isSimilar) {
      filtered.push(color);
    }
  }
  return filtered;
};

// New Hint component
const Hint = ({ label, text }) => (
  <div className="relative inline-block group">
    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
      {label}
    </span>
    <span className="ml-1 text-gray-400 cursor-pointer text-xs align-top">
      ?
    </span>
    <div className="absolute left-1/2 transform -translate-x-1/2 -top-12 opacity-0 group-hover:opacity-100 group-hover:-top-16 transition-all duration-300 w-64 p-2 bg-gray-800 text-white text-xs rounded-lg shadow-lg z-50 pointer-events-none">
      <div className="relative">{text}</div>
      <div
        className="absolute w-3 h-3 bg-gray-800 transform rotate-45 -bottom-1 left-1/2 -translate-x-1/2"
        style={{ clipPath: "polygon(0 0, 100% 0, 50% 100%)" }}
      ></div>
    </div>
  </div>
);

const App = () => {
  // State variables
  const [imageSrc, setImageSrc] = useState(null);
  const [palette, setPalette] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [colorsPerHue, setColorsPerHue] = useState(10);
  const [harmonizeModel, setHarmonizeModel] = useState("none");
  const [extractionMethod, setExtractionMethod] = useState("categorical");
  const [dominantColorCount, setDominantColorCount] = useState(3);
  const [isDragging, setIsDragging] = useState(false);
  const [similarityThreshold, setSimilarityThreshold] = useState(10);
  const imageRef = useRef(null);

  // Define color categories for hue-based extraction
  const categories = {
    red: [
      [0.0, 0.0833],
      [0.9167, 1.0],
    ],
    orange: [[0.0833, 0.1667]],
    yellow: [[0.1667, 0.25]],
    green: [[0.25, 0.5]],
    blue: [[0.5, 0.75]],
    purple: [[0.75, 0.9167]],
  };

  // Effect to apply the 'dark' class based on system theme preference
  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

    const applySystemTheme = (e) => {
      document.documentElement.classList.toggle("dark", e.matches);
    };

    applySystemTheme(mediaQuery); // Apply initial theme
    mediaQuery.addEventListener("change", applySystemTheme); // Listen for changes

    return () => mediaQuery.removeEventListener("change", applySystemTheme);
  }, []);

  // Main effect hook to process the image and generate the palette
  useEffect(() => {
    if (!imageSrc) {
      setPalette([]);
      return;
    }

    setIsLoading(true);
    const img = new Image();
    img.crossOrigin = "Anonymous";
    img.onload = () => {
      const tempCanvas = document.createElement("canvas");
      const tempCtx = tempCanvas.getContext("2d");
      const maxDim = 150;
      const ratio = Math.min(maxDim / img.width, maxDim / img.height);
      tempCanvas.width = img.width * ratio;
      tempCanvas.height = img.height * ratio;
      tempCtx.drawImage(img, 0, 0, tempCanvas.width, tempCanvas.height);
      const imageData = tempCtx.getImageData(
        0,
        0,
        tempCanvas.width,
        tempCanvas.height
      );
      const pixels = imageData.data;

      let newPalette = [];
      const allPixels = [];
      for (let i = 0; i < pixels.length; i += 4) {
        allPixels.push([pixels[i], pixels[i + 1], pixels[i + 2]]);
      }

      if (extractionMethod === "categorical") {
        const categoryOrder = [
          "red",
          "orange",
          "yellow",
          "green",
          "blue",
          "purple",
        ];
        categoryOrder.forEach((cat) => {
          const rangePairs = categories[cat];
          const catPixels = allPixels.filter((p) => {
            const [h] = rgbToHsl(...p);
            return rangePairs.some(([low, high]) => h >= low && h < high);
          });
          if (catPixels.length > 0) {
            const dominant = getDominantColor(catPixels);
            const variations = generateColorVariations(dominant, colorsPerHue);
            newPalette.push(...variations);
          }
        });
      } else {
        // Complementary
        const dominantColors = getDominantColors(allPixels, dominantColorCount);
        dominantColors.forEach((color) => {
          newPalette.push(
            ...generateComplementaryPalette(color, Math.floor(colorsPerHue / 2))
          );
        });
      }

      if (harmonizeModel !== "none") {
        newPalette = harmonizeColors(newPalette, harmonizeModel);
      }

      // Filter out colors that are too dark or too light
      const filteredPalette = newPalette.filter((color) => {
        const [h, s, l] = rgbToHsl(...color);
        return l > 0.1 && l < 0.95;
      });

      // Filter out visually similar colors
      const similarityFiltered = filterSimilarColors(
        filteredPalette,
        similarityThreshold
      );

      // Remove duplicate colors
      const uniqueColors = Array.from(
        new Set(similarityFiltered.map(JSON.stringify))
      ).map(JSON.parse);

      setPalette(uniqueColors);
      setIsLoading(false);
    };
    img.src = imageSrc;
  }, [
    imageSrc,
    colorsPerHue,
    harmonizeModel,
    extractionMethod,
    dominantColorCount,
    similarityThreshold,
  ]);

  // Helper for generating complementary palettes
  const generateComplementaryPalette = (baseColor, numVariations) => {
    const [h, s, l] = rgbToHsl(...baseColor);
    const compH = (h + 0.5) % 1.0;
    const [compR, compG, compB] = hslToRgb(compH, s, l);
    const complementaryColor = [compR, compG, compB];
    const baseVariations = generateColorVariations(baseColor, numVariations);
    const compVariations = generateColorVariations(
      complementaryColor,
      numVariations
    );
    return [...baseVariations, ...compVariations];
  };

  // Helper for generating color variations (shades and tints)
  const generateColorVariations = (baseColor, numVariations) => {
    const variations = [];
    const [h, s, l] = rgbToHsl(...baseColor);
    for (let i = 0; i < numVariations; i++) {
      const varL = 0.1 + (0.8 * i) / (numVariations - 1);
      variations.push(hslToRgb(h, s, varL));
    }
    return variations.sort((a, b) => rgbToHsl(...a)[2] - rgbToHsl(...b)[2]);
  };

  // Simple pixel averaging to get a representative color from a group
  const getDominantColor = (pixels) => {
    if (pixels.length === 0) return [0, 0, 0];
    const sum = pixels.reduce(
      (acc, p) => [acc[0] + p[0], acc[1] + p[1], acc[2] + p[2]],
      [0, 0, 0]
    );
    return [
      Math.round(sum[0] / pixels.length),
      Math.round(sum[1] / pixels.length),
      Math.round(sum[2] / pixels.length),
    ];
  };

  // Gets a list of dominant colors for the complementary method
  const getDominantColors = (pixels, count) => {
    // Simplified clustering by sampling and bucketing
    const colorMap = {};
    for (let i = 0; i < pixels.length; i += 10) {
      // Sample every 10th pixel
      const [r, g, b] = pixels[i];
      const hex = rgbToHex(r, g, b);
      colorMap[hex] = (colorMap[hex] || 0) + 1;
    }
    const sorted = Object.entries(colorMap).sort((a, b) => b[1] - a[1]);
    return sorted.slice(0, count).map((entry) => {
      const hex = entry[0].slice(1);
      const r = parseInt(hex.substring(0, 2), 16);
      const g = parseInt(hex.substring(2, 4), 16);
      const b = parseInt(hex.substring(4, 6), 16);
      return [r, g, b];
    });
  };

  // Handle file upload
  const handleFile = (file) => {
    if (file && file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = (e) => setImageSrc(e.target.result);
      reader.readAsDataURL(file);
    }
  };

  const handleImageUpload = (event) => {
    handleFile(event.target.files[0]);
  };

  const handleDragOver = (event) => {
    event.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (event) => {
    event.preventDefault();
    setIsDragging(false);
    const file = event.dataTransfer.files[0];
    handleFile(file);
  };

  // Function to export the palette as a JSON file
  const handleExport = () => {
    if (palette.length === 0) {
      console.log("No palette to export.");
      return;
    }

    const formatColor = (r, g, b) => {
      const toHex = (c) => `0${c.toString(16)}`.slice(-2).toUpperCase();
      // Original format is FF BGR
      return `FF${toHex(b)}${toHex(g)}${toHex(r)}`;
    };

    const flatColors = palette.map(([r, g, b]) => formatColor(r, g, b));
    const jsonOutput = { colors: flatColors };
    const jsonString = JSON.stringify(jsonOutput, null, 2);

    const blob = new Blob([jsonString], { type: "application/json" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = "palette.colorpalette";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4 font-sans text-gray-800 dark:bg-gray-900 dark:text-gray-200 transition-colors duration-300">
      <div className="w-full max-w-4xl p-6 bg-white rounded-xl shadow-lg dark:bg-gray-800 dark:shadow-xl transition-colors duration-300">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            S1 Color Palette Generator v0.1.2
          </h1>
        </div>

        {/* Image Preview and Palette Display Section */}
        <div className="flex flex-col space-y-6">
          <div
            className={`w-full flex flex-col items-center justify-center bg-gray-50 rounded-lg border-2 ${
              isDragging
                ? "border-blue-500"
                : "border-gray-300 dark:border-gray-600"
            } border-dashed p-8 transition-colors duration-200 min-h-[200px] dark:bg-gray-700`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            {imageSrc ? (
              <img
                ref={imageRef}
                src={imageSrc}
                alt="Uploaded"
                className="max-w-full h-auto rounded-lg shadow-md"
              />
            ) : (
              <div className="text-center text-gray-500 dark:text-gray-400 p-4">
                <p className="mb-4">
                  Drag & drop an image here or click a button below
                </p>
                <label className="cursor-pointer bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-full transition-colors duration-200 shadow-md mb-4 inline-block">
                  Choose File
                  <input
                    type="file"
                    onChange={handleImageUpload}
                    className="hidden"
                    accept="image/*"
                  />
                </label>
                <p className="text-xs mt-4">
                  Disclaimer and Privacy Notice: This application operates
                  entirely within your browser. No user data, images, or files
                  are sent to my server. All processing, including palette
                  generation, happens on your local machine.
                </p>
              </div>
            )}
          </div>

          <div className="w-full flex flex-col items-center">
            <h2 className="text-2xl font-semibold mb-4 text-center text-gray-900 dark:text-gray-100">
              Generated Palette
            </h2>

            {/* Palette Controls */}
            <div className="flex flex-wrap justify-center items-center space-y-4 sm:space-y-0 sm:space-x-4 mb-6">
              <div className="flex flex-col w-full sm:w-auto">
                <label
                  htmlFor="harmonize"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                >
                  <Hint
                    label="Harmonization"
                    text="Choose None to keep the colors as they are in the uploaded image. The other options will apply a specific set of rules to harmonize the colors, giving the palette a specific 'feel' (e.g., retro, vibrant, pastel)."
                  />
                </label>
                <select
                  id="harmonize"
                  value={harmonizeModel}
                  onChange={(e) => setHarmonizeModel(e.target.value)}
                  className="p-2 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 w-full bg-white dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600"
                >
                  <option value="none">None</option>
                  <option value="70s">70s</option>
                  <option value="80s">80s</option>
                  <option value="vibrant">Vibrant</option>
                  <option value="neon">Neon</option>
                  <option value="pastel">Pastel</option>
                </select>
              </div>

              <div className="flex flex-col w-full sm:w-auto">
                <label
                  htmlFor="method"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                >
                  <Hint
                    label="Extraction Method"
                    text="This determines how the app finds color clusters in your photo. Categorical creates a palette by sampling from different color families (e.g., reds, blues, greens), while Complementary finds the most dominant colors and then generates a palette with their complements. Feel free to experiment with both to see which one you like best."
                  />
                </label>
                <select
                  id="method"
                  value={extractionMethod}
                  onChange={(e) => setExtractionMethod(e.target.value)}
                  className="p-2 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 w-full bg-white dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600"
                >
                  <option value="categorical">Categorical</option>
                  <option value="complementary">Complementary</option>
                </select>
              </div>

              <div className="flex flex-col w-full sm:w-auto">
                <label
                  htmlFor="colorsPerHue"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                >
                  <Hint
                    label="Colors per group"
                    text="This is the number of colors the app will attempt to generate for each extracted color group. For example, if you choose Categorical, this will be the number of shades and tints generated for each hue."
                  />
                </label>
                <input
                  id="colorsPerHue"
                  type="number"
                  min="2"
                  max="20"
                  value={colorsPerHue}
                  onChange={(e) => setColorsPerHue(Number(e.target.value))}
                  className="p-2 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 w-full text-center bg-white dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600"
                />
              </div>

              <div className="flex flex-col w-full sm:w-auto">
                <label
                  htmlFor="similarityThreshold"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                >
                  <Hint
                    label="Similarity Filter"
                    text="Use this slider to filter out colors that are visually too similar. A lower value (more to the left) will result in a larger palette with more subtle variations, while a higher value (more to the right) will create a smaller palette with more distinct colors."
                  />
                </label>
                <input
                  id="similarityThreshold"
                  type="range"
                  min="0"
                  max="30"
                  value={similarityThreshold}
                  onChange={(e) =>
                    setSimilarityThreshold(Number(e.target.value))
                  }
                  className="w-full h-2 rounded-lg appearance-none cursor-pointer bg-gray-200 dark:bg-gray-700"
                  style={{
                    "--tw-shadow-color": "0 0 0 #fff",
                    "--tw-ring-offset-shadow": "0 0 0 #fff",
                    "--tw-ring-shadow": "0 0 0 #fff",
                    "--webkit-slider-thumb": "bg-blue-600",
                  }}
                />
                <span className="text-xs text-gray-500 dark:text-gray-400 text-center">
                  {similarityThreshold} (0=strict, 30=loose)
                </span>
              </div>
            </div>

            {palette.length > 0 && (
              <div className="text-center mb-6">
                <button
                  onClick={handleExport}
                  className="
                    text-white font-semibold py-2 px-6 rounded-full
                    transition-all duration-300 transform
                    bg-gradient-to-r from-pink-500 to-purple-600
                    hover:from-pink-600 hover:to-purple-700
                    shadow-lg hover:shadow-xl
                    focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800
                    active:scale-95
                    text-shadow-neon
                  "
                >
                  Download Palette file
                </button>
              </div>
            )}

            {isLoading ? (
              <div className="flex justify-center items-center h-40">
                <svg
                  className="animate-spin -ml-1 mr-3 h-8 w-8 text-blue-500"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                <span className="text-gray-600 dark:text-gray-400">
                  Generating palette...
                </span>
              </div>
            ) : (
              <div className="flex flex-wrap justify-center gap-4 p-4 rounded-xl border border-gray-200 dark:border-gray-600 w-full">
                {palette.length > 0 ? (
                  palette.map((color, index) => {
                    const [r, g, b] = color;
                    const hexCode = rgbToHex(r, g, b).toUpperCase();
                    return (
                      <div
                        key={index}
                        className="w-24 h-24 rounded-lg shadow-md flex items-center justify-center"
                        style={{
                          backgroundColor: hexCode,
                          border: "1px solid rgba(255, 255, 255, 0.1",
                        }}
                      ></div>
                    );
                  })
                ) : (
                  <p className="text-gray-500 dark:text-gray-400 text-center">
                    Your palette will appear here.
                  </p>
                )}
              </div>
            )}

            <p className="text-sm mt-4 font-semibold text-gray-800 dark:text-gray-200">
              Usage:
            </p>
            <ul className="mt-2 list-disc list-inside pl-4 space-y-2 text-base text-gray-800 dark:text-gray-200 text-sm">
              <li>
                Generate a palette from image, then download the file to your
                computer.
              </li>
              <li>
                Open Studio One and create a new track palette preset. Give it
                an arbitrary name, such as "CustomPalette1," and make a note of
                the name.
              </li>
              <li>
                Open Studio One Preferences find "User Data Location" in
                Locations tab. Press "..." to open that folder.
              </li>
              <li>Navigate to Presets &gt; User Presets &gt; Color Palettes</li>
              <li>
                Locate the palette preset file you created in Step 2 (e.g.,
                "CustomPalette1.colorpalette").
              </li>
              <li>
                Replace (rename) that file with the downloaded one from Step 1.
              </li>
            </ul>
          </div>
          <span className="text-xs text-gray-600 dark:text-gray-400">
            <p className="mb-2">© 2025 dr_vlat. All rights reserved.</p>
            This is an independent, non-commercial project and is not affiliated
            with, endorsed by, or sponsored by PreSonus Audio Electronics, Inc
            or Fender Musical Instruments Corporation.
            <br />
            PreSonus, Studio One, Fender and macOS are trademarks or registered
            trademarks of their respective owners. Their use in this project is
            for informational and descriptive purposes only.
          </span>
        </div>
      </div>
    </div>
  );
};

export default App;
