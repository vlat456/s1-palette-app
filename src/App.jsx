/**
 * Creating a color palette is an art, not a science—there’s no single “right” way to do it.
 * I’d start with Categorical mode and an Analogous palette type, setting 10 colors per group for a balanced foundation.
 * If you notice repetitive tints, nudge the Similarity Filter higher until the palette feels distinct.
 * Want more tint variations? Increase the Colors per Group.
 * Don’t be intimidated by terms like Complementary or Triadic—they’re just different ways to relate colors.
 * Experiment freely! Categorical excels for longer, varied tint lists, while Complementary is ideal for precise, concise palettes.
 * Dive in, play with the settings, and craft a palette that feels uniquely yours. Have fun and enjoy!
 */

import React, { useState, useEffect, useRef } from "react";

// Improved color conversion functions
const rgbToHex = (r, g, b) => {
  const toHex = (c) => `0${c.toString(16)}`.slice(-2);
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`.toUpperCase();
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

const rgbToHsv = (r, g, b) => {
  r /= 255;
  g /= 255;
  b /= 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const d = max - min;
  let h,
    s,
    v = max;

  if (max === 0) {
    s = 0;
  } else {
    s = d / max;
  }

  if (max === min) {
    h = 0;
  } else {
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

  return [h, s, v];
};

const hsvToRgb = (h, s, v) => {
  let r, g, b;

  const i = Math.floor(h * 6);
  const f = h * 6 - i;
  const p = v * (1 - s);
  const q = v * (1 - f * s);
  const t = v * (1 - (1 - f) * s);

  switch (i % 6) {
    case 0:
      r = v;
      g = t;
      b = p;
      break;
    case 1:
      r = q;
      g = v;
      b = p;
      break;
    case 2:
      r = p;
      g = v;
      b = t;
      break;
    case 3:
      r = p;
      g = q;
      b = v;
      break;
    case 4:
      r = t;
      g = p;
      b = v;
      break;
    case 5:
      r = v;
      g = p;
      b = q;
      break;
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
    earthy: {
      l_mult: 0.9,
      s_mult: 0.7,
      l_shift: 0.0,
      s_shift: -0.1,
      l_range: [0.2, 0.6],
      s_range: [0.3, 0.7],
    },
    jewel: {
      l_mult: 0.8,
      s_mult: 1.2,
      l_shift: 0.0,
      s_shift: 0.1,
      l_range: [0.3, 0.7],
      s_range: [0.8, 1.0],
    },
    none: {
      l_mult: 1.0,
      s_mult: 1.0,
      l_shift: 0.0,
      s_shift: 0.0,
    },
  };

  const params = models[model] || models.none;

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

const rgbToLab = (r, g, b) => {
  let x = r / 255;
  let y = g / 255;
  let z = b / 255;

  x = x > 0.04045 ? Math.pow((x + 0.055) / 1.055, 2.4) : x / 12.92;
  y = y > 0.04045 ? Math.pow((y + 0.055) / 1.055, 2.4) : y / 12.92;
  z = z > 0.04045 ? Math.pow((z + 0.055) / 1.055, 2.4) : z / 12.92;

  x *= 100;
  y *= 100;
  z *= 100;

  let X = x * 0.4124 + y * 0.3576 + z * 0.1805;
  let Y = x * 0.2126 + y * 0.7152 + z * 0.0722;
  let Z = x * 0.0193 + y * 0.1192 + z * 0.9505;

  X /= 95.047;
  Y /= 100.0;
  Z /= 108.883;

  X = X > 0.008856 ? Math.pow(X, 1 / 3) : 7.787 * X + 16 / 116;
  Y = Y > 0.008856 ? Math.pow(Y, 1 / 3) : 7.787 * Y + 16 / 116;
  Z = Z > 0.008856 ? Math.pow(Z, 1 / 3) : 7.787 * Z + 16 / 116;

  return [
    116 * Y - 16, // L
    500 * (X - Y), // A
    200 * (Y - Z), // B
  ];
};

const deltaE = (color1, color2) => {
  const [L1, a1, b1] = rgbToLab(...color1);
  const [L2, a2, b2] = rgbToLab(...color2);
  return Math.sqrt(
    Math.pow(L2 - L1, 2) + Math.pow(a2 - a1, 2) + Math.pow(b2 - b1, 2)
  );
};

const filterSimilarColors = (colors, threshold = 10) => {
  if (colors.length <= 1) return colors;

  const filtered = [colors[0]];

  for (let i = 1; i < colors.length; i++) {
    const color = colors[i];
    let isSimilar = false;

    for (let j = 0; j < filtered.length; j++) {
      const existingColor = filtered[j];
      const difference = deltaE(color, existingColor);

      if (difference < threshold) {
        isSimilar = true;
        break;
      }
    }

    if (!isSimilar) {
      filtered.push(color);
    }
  }

  return filtered;
};

const getMedianColor = (pixels) => {
  if (pixels.length === 0) return [0, 0, 0];

  const rVals = pixels.map((p) => p[0]).sort((a, b) => a - b);
  const gVals = pixels.map((p) => p[1]).sort((a, b) => a - b);
  const bVals = pixels.map((p) => p[2]).sort((a, b) => a - b);

  const mid = Math.floor(pixels.length / 2);
  return [rVals[mid], gVals[mid], bVals[mid]];
};

const kMeansClustering = (pixels, k, maxIterations = 10, sampleSize = 1000) => {
  if (pixels.length === 0 || k === 0) return [];

  const sampledPixels =
    pixels.length > sampleSize
      ? Array.from(
          { length: sampleSize },
          () => pixels[Math.floor(Math.random() * pixels.length)]
        )
      : pixels;

  let centroids = [
    sampledPixels[Math.floor(Math.random() * sampledPixels.length)],
  ];

  for (let i = 1; i < k; i++) {
    let distances = [];
    let totalDistance = 0;

    for (const pixel of sampledPixels) {
      let minDistance = Infinity;

      for (const centroid of centroids) {
        const distance = deltaE(pixel, centroid);
        minDistance = Math.min(minDistance, distance);
      }

      distances.push(minDistance);
      totalDistance += minDistance;
    }

    let randomValue = Math.random() * totalDistance;
    let cumulativeDistance = 0;

    for (let j = 0; j < distances.length; j++) {
      cumulativeDistance += distances[j];
      if (cumulativeDistance >= randomValue) {
        centroids.push(sampledPixels[j]);
        break;
      }
    }
  }

  const startTime = performance.now();
  const timeoutMs = 5000;

  for (let iter = 0; iter < maxIterations; iter++) {
    if (performance.now() - startTime > timeoutMs) {
      console.warn(
        "kMeansClustering timed out after 5 seconds. Returning current centroids."
      );
      return centroids;
    }

    const clusters = Array.from({ length: k }, () => []);

    for (const pixel of sampledPixels) {
      let minDistance = Infinity;
      let clusterIndex = 0;

      for (let i = 0; i < centroids.length; i++) {
        const distance = deltaE(pixel, centroids[i]);
        if (distance < minDistance) {
          minDistance = distance;
          clusterIndex = i;
        }
      }

      clusters[clusterIndex].push(pixel);
    }

    let changed = false;
    for (let i = 0; i < k; i++) {
      if (clusters[i].length === 0) continue;

      const newCentroid = getMedianColor(clusters[i]);
      const oldCentroid = centroids[i];

      if (deltaE(newCentroid, oldCentroid) > 1) {
        centroids[i] = newCentroid;
        changed = true;
      }
    }

    if (!changed) break;
  }

  return centroids;
};

const getDominantColors = (pixels, count) => {
  if (pixels.length < count) {
    const result = [];
    for (let i = 0; i < count; i++) {
      result.push(
        pixels[Math.floor(Math.random() * pixels.length)] || [0, 0, 0]
      );
    }
    return result;
  }

  return kMeansClustering(pixels, count, 10, 1000);
};

const generateColorVariations = (baseColor, numVariations) => {
  const variations = [];
  const [baseH, baseS, baseL] = rgbToHsl(...baseColor);

  for (let i = 0; i < numVariations; i++) {
    const t = i / (numVariations - 1);
    const varL = 0.15 + 0.7 * t;
    const varH = (baseH + (Math.random() - 0.5) * 0.05) % 1;
    const varS = Math.min(1, Math.max(0, baseS + (Math.random() - 0.5) * 0.1));
    variations.push(hslToRgb(varH, varS, varL));
  }

  return variations.sort((a, b) => {
    const [, , l1] = rgbToHsl(...a);
    const [, , l2] = rgbToHsl(...b);
    return l2 - l1;
  });
};

const generateComplementaryPalette = (baseColor, numVariations) => {
  const [h, s, l] = rgbToHsl(...baseColor);
  const compH = (h + 0.5) % 1.0;

  const baseVariations = generateColorVariations(
    baseColor,
    Math.ceil(numVariations / 2)
  );
  const compVariations = generateColorVariations(
    hslToRgb(compH, s, l),
    Math.floor(numVariations / 2)
  );

  return [...baseVariations, ...compVariations];
};

const generateTriadicPalette = (baseColor, numVariations) => {
  const [h, s, l] = rgbToHsl(...baseColor);
  const triadH1 = (h + 1 / 3) % 1.0;
  const triadH2 = (h + 2 / 3) % 1.0;

  const baseCount = Math.ceil(numVariations / 3);
  const triad1Count = Math.floor((numVariations - baseCount) / 2);
  const triad2Count = numVariations - baseCount - triad1Count;

  const baseVariations = generateColorVariations(baseColor, baseCount);
  const triad1Variations = generateColorVariations(
    hslToRgb(triadH1, s, l),
    triad1Count
  );
  const triad2Variations = generateColorVariations(
    hslToRgb(triadH2, s, l),
    triad2Count
  );

  return [...baseVariations, ...triad1Variations, ...triad2Variations];
};

const generateAnalogousPalette = (baseColor, numVariations) => {
  const [h, s, l] = rgbToHsl(...baseColor);
  const analogousRange = 0.08;

  const variations = [];
  for (let i = 0; i < numVariations; i++) {
    const t = i / (numVariations - 1);
    const varH = (h + analogousRange * (t - 0.5)) % 1;
    const varL = 0.15 + 0.7 * t;
    variations.push(hslToRgb(varH, s, varL));
  }

  return variations.sort((a, b) => {
    const [, , l1] = rgbToHsl(...a);
    const [, , l2] = rgbToHsl(...b);
    return l2 - l1;
  });
};

const generateMonochromaticPalette = (baseColor, numVariations) => {
  const [h, s] = rgbToHsl(...baseColor);

  const variations = [];
  for (let i = 0; i < numVariations; i++) {
    const t = i / (numVariations - 1);
    const varL = 0.15 + 0.7 * t;
    variations.push(hslToRgb(h, s, varL));
  }

  return variations;
};

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
  const [imageSrc, setImageSrc] = useState(null);
  const [palette, setPalette] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [colorsPerHue, setColorsPerHue] = useState(10);
  const [harmonizeModel, setHarmonizeModel] = useState("none");
  const [extractionMethod, setExtractionMethod] = useState("categorical");
  const [dominantColorCount, setDominantColorCount] = useState(3);
  const [isDragging, setIsDragging] = useState(false);
  const [similarityThreshold, setSimilarityThreshold] = useState(15);
  const [paletteType, setPaletteType] = useState("analogous");
  const [showColorValues, setShowColorValues] = useState(false);
  const imageRef = useRef(null);

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

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

    const applySystemTheme = (e) => {
      document.documentElement.classList.toggle("dark", e.matches);
    };

    applySystemTheme(mediaQuery);
    mediaQuery.addEventListener("change", applySystemTheme);

    return () => mediaQuery.removeEventListener("change", applySystemTheme);
  }, []);

  useEffect(() => {
    if (!imageSrc) {
      setPalette([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    const img = new Image();
    img.crossOrigin = "Anonymous";
    img.onload = () => {
      const tempCanvas = document.createElement("canvas");
      const tempCtx = tempCanvas.getContext("2d");
      const maxDim = 100;
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
            const dominant = getMedianColor(catPixels);
            let variations = [];

            switch (paletteType) {
              case "complementary":
                variations = generateComplementaryPalette(
                  dominant,
                  colorsPerHue
                );
                break;
              case "triadic":
                variations = generateTriadicPalette(dominant, colorsPerHue);
                break;
              case "analogous":
                variations = generateAnalogousPalette(dominant, colorsPerHue);
                break;
              case "monochromatic":
                variations = generateMonochromaticPalette(
                  dominant,
                  colorsPerHue
                );
                break;
              default:
                variations = generateColorVariations(dominant, colorsPerHue);
            }

            newPalette.push(...variations);
          }
        });
      } else {
        const dominantColors = getDominantColors(allPixels, dominantColorCount);
        dominantColors.forEach((color) => {
          let variations = [];

          switch (paletteType) {
            case "complementary":
              variations = generateComplementaryPalette(
                color,
                Math.floor(colorsPerHue / dominantColorCount)
              );
              break;
            case "triadic":
              variations = generateTriadicPalette(
                color,
                Math.floor(colorsPerHue / dominantColorCount)
              );
              break;
            case "analogous":
              variations = generateAnalogousPalette(
                color,
                Math.floor(colorsPerHue / dominantColorCount)
              );
              break;
            case "monochromatic":
              variations = generateMonochromaticPalette(
                color,
                Math.floor(colorsPerHue / dominantColorCount)
              );
              break;
            default:
              variations = generateColorVariations(
                color,
                Math.floor(colorsPerHue / dominantColorCount)
              );
          }

          newPalette.push(...variations);
        });
      }

      if (harmonizeModel !== "none") {
        newPalette = harmonizeColors(newPalette, harmonizeModel);
      }

      const filteredPalette = newPalette.filter((color) => {
        const [h, s, l] = rgbToHsl(...color);
        return l > 0.1 && l < 0.95 && s > 0.1;
      });

      const similarityFiltered = filterSimilarColors(
        filteredPalette,
        similarityThreshold
      );

      const uniqueColors = Array.from(
        new Set(similarityFiltered.map(JSON.stringify))
      ).map(JSON.parse);

      setPalette(uniqueColors);
      setIsLoading(false);
    };
    img.onerror = () => {
      console.error("Failed to load image");
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
    paletteType,
  ]);

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

  const handleExport = () => {
    if (palette.length === 0) {
      console.log("No palette to export.");
      return;
    }

    const formatColor = (r, g, b) => {
      const toHex = (c) => `0${c.toString(16)}`.slice(-2).toUpperCase();
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

  const copyToClipboard = (color) => {
    const hexCode = rgbToHex(...color);
    navigator.clipboard.writeText(hexCode).then(() => {
      const button = document.getElementById(`color-${hexCode}`);
      if (button) {
        const originalText = button.textContent;
        button.textContent = "Copied!";
        setTimeout(() => {
          button.textContent = originalText;
        }, 1500);
      }
    });
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4 font-sans text-gray-800 dark:bg-gray-900 dark:text-gray-200 transition-colors duration-300">
      <div className="w-full max-w-6xl p-6 bg-white rounded-xl shadow-lg dark:bg-gray-800 dark:shadow-xl transition-colors duration-300">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            S1 Color Palette Generator v0.2.1
          </h1>
        </div>

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
                className="max-w-full h-auto rounded-lg shadow-md max-h-64"
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
            <div className=" w-full rounded-xl p-4 flex border border-gray-200  dark:border-gray-600 flex-wrap justify-center items-start space-y-4 sm:space-y-0 sm:space-x-4 mb-4">
              <div class="text-center w-full text-sm text-gray-600 dark:text-gray-300 mb-6">
                I’d start with <strong>Categorical</strong> mode and an{" "}
                <strong>Analogous</strong> palette type, setting{" "}
                <strong>10 colors per group</strong>. Too many similar shades?
                Slide the <strong>Similarity Filter</strong> higher until your
                palette feels distinct. Too few colors? Slide the{" "}
                <strong>Similarity Filter</strong> lower. Want more color
                variety? Bump up the <strong>Colors per Group</strong>. Want to
                apply a different vibe? Select a different harmonization mode.
                Don’t let terms like Complementary or Triadic scare you—they’re
                just ways to mix colors.
                <strong> Categorical</strong> usually creates long, vibrant tint
                lists, while <strong>Complementary</strong> crafts short, sharp
                palettes. Dive in, play with the settings, have fun and enjoy!
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

              {extractionMethod === "complementary" && (
                <>
                  <div className="hidden sm:flex items-center text-2xl font-bold bg-gradient-to-r from-gray-500 to-gray-600 dark:from-gray-400 dark:to-gray-500 text-transparent bg-clip-text drop-shadow-sm">
                    →
                  </div>
                  <div className="flex flex-col w-full sm:w-auto">
                    <label
                      htmlFor="dominantColorCount"
                      className="block text-sm font-medium sovereignty-gray-700 dark:text-gray-300 mb-2"
                    >
                      <Hint
                        label="Dominant Colors"
                        text="Set how many dominant colors to extract from the image. Higher values will create more diverse palettes but may take longer to process."
                      />
                    </label>
                    <input
                      id="dominantColorCount"
                      type="range"
                      min="1"
                      max="16"
                      value={dominantColorCount}
                      onChange={(e) =>
                        setDominantColorCount(Number(e.target.value))
                      }
                      className="w-full h-2 rounded-lg appearance-none cursor-pointer bg-gray-200 dark:bg-gray-700"
                      style={{
                        "--tw-shadow-color": "0 0 0 #fff",
                        "--tw-ring-offset-shadow": "0 0 0 #fff",
                        "--tw-ring-shadow": "0 0 0 #fff",
                        "--webkit-slider-thumb": "bg-blue-600",
                      }}
                    />
                    <span className="text-xs mt-3 text-gray-500 dark:text-gray-400 text-center">
                      {dominantColorCount} colors
                    </span>
                  </div>
                </>
              )}

              <div className="hidden sm:flex items-center text-2xl font-bold bg-gradient-to-r from-gray-500 to-gray-600 dark:from-gray-400 dark:to-gray-500 text-transparent bg-clip-text drop-shadow-sm">
                →
              </div>

              <div className="flex flex-col w-full sm:w-auto">
                <label
                  htmlFor="paletteType"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                >
                  <Hint
                    label="Palette Type"
                    text="Choose the color harmony scheme for your palette. Complementary uses opposite colors, Triadic uses three evenly spaced colors, Analogous uses adjacent colors, and Monochromatic uses variations of a single hue."
                  />
                </label>
                <select
                  id="paletteType"
                  value={paletteType}
                  onChange={(e) => setPaletteType(e.target.value)}
                  className="p-2 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 w-full bg-white dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600"
                >
                  <option value="complementary">Complementary</option>
                  <option value="triadic">Triadic</option>
                  <option value="analogous">Analogous</option>
                  <option value="monochromatic">Monochromatic</option>
                  <option value="variations">Simple Variations</option>
                </select>
              </div>

              <div className="hidden sm:flex items-center text-2xl font-bold bg-gradient-to-r from-gray-500 to-gray-600 dark:from-gray-400 dark:to-gray-500 text-transparent bg-clip-text drop-shadow-sm">
                →
              </div>

              <div className="flex flex-col w-full sm:w-auto">
                <label
                  htmlFor="colorsPerHue"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                >
                  <Hint
                    label="Colors per group"
                    text="Use this slider to set the number of colors generated for each extracted color group. For example, if you choose Categorical, this will be the number of shades and tints generated for each hue (3 to 20)."
                  />
                </label>
                <input
                  id="colorsPerHue"
                  type="range"
                  min="3"
                  max="20"
                  value={colorsPerHue}
                  onChange={(e) => setColorsPerHue(Number(e.target.value))}
                  className="w-full h-2 rounded-lg appearance-none cursor-pointer bg-gray-200 dark:bg-gray-700"
                  style={{
                    "--tw-shadow-color": "0 0 0 #fff",
                    "--tw-ring-offset-shadow": "0 0 0 #fff",
                    "--tw-ring-shadow": "0 0 0 #fff",
                    "--webkit-slider-thumb": "bg-blue-600",
                  }}
                />
                <span className="text-xs mt-3 text-gray-500 dark:text-gray-400 text-center">
                  {colorsPerHue} colors
                </span>
              </div>

              <div className="hidden sm:flex items-center text-2xl font-bold bg-gradient-to-r from-gray-500 to-gray-600 dark:from-gray-400 dark:to-gray-500 text-transparent bg-clip-text drop-shadow-sm">
                →
              </div>

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
                  <option value="earthy">Earthy</option>
                  <option value="jewel">Jewel Tones</option>
                </select>
              </div>

              <div className="hidden sm:flex items-center text-2xl font-bold bg-gradient-to-r from-gray-500 to-gray-600 dark:from-gray-400 dark:to-gray-500 text-transparent bg-clip-text drop-shadow-sm">
                →
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
                <span className="mt-3 text-xs text-gray-500 dark:text-gray-400 text-center">
                  {similarityThreshold} (0=strict, 30=loose)
                </span>
              </div>
            </div>

            <h2 className="text-2xl font-semibold mb-4 text-center text-gray-900 dark:text-gray-100">
              Generated Palette
            </h2>

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
                    d="M4 12a8 8 0 018-8V0C5.373e 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                <span className="text-gray-600 dark:text-gray-400">
                  Generating palette...
                </span>
              </div>
            ) : (
              <div className="w-full">
                <div className="flex flex-wrap justify-center gap-2 p-4 rounded-xl border border-gray-200 dark:border-gray-600 w-full">
                  {palette.length > 0 ? (
                    palette.map((color, index) => {
                      const [r, g, b] = color;
                      const hexCode = rgbToHex(r, g, b);
                      const textColor =
                        r * 0.299 + g * 0.587 + b * 0.114 > 150
                          ? "#000000"
                          : "#FFFFFF";

                      return (
                        <div
                          key={index}
                          className="relative group rounded-lg overflow-hidden shadow-md"
                          style={{
                            width: "100px",
                            height: "100px",
                            backgroundColor: hexCode,
                            border: "1px solid rgba(255, 255, 255, 0.1)",
                          }}
                        >
                          {showColorValues && (
                            <div
                              className="absolute bottom-0 left-0 right-0 p-1 text-xs text-center font-mono transition-opacity duration-200"
                              style={{
                                backgroundColor: "rgba(0, 0, 0, 0.6)",
                                color: textColor,
                              }}
                            >
                              {hexCode}
                            </div>
                          )}
                          <button
                            id={`color-${hexCode}`}
                            onClick={() => copyToClipboard(color)}
                            className="absolute top-1 right-1 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover-opacity-100 transition-opacity duration-200"
                          >
                            Copy
                          </button>
                        </div>
                      );
                    })
                  ) : (
                    <p className="text-gray-500 dark:text-gray-400 text-center w-full">
                      Your palette will appear here.
                    </p>
                  )}
                </div>
                <div className="flex justify-end mt-4">
                  <div className="flex items-center">
                    <input
                      id="showColorValues"
                      type="checkbox"
                      checked={showColorValues}
                      onChange={(e) => setShowColorValues(e.target.checked)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label
                      htmlFor="showColorValues"
                      className="ml-2 block text-sm text-gray-700 dark:text-gray-300"
                    >
                      Show color values
                    </label>
                  </div>
                </div>
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
            <p className="mb-2">
              © 2025 dr_vlat. This project is licensed under the MIT License.
            </p>
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
