export function rgbToHsl(r, g, b) {
  r /= 255; g /= 255; b /= 255;
  const mx = Math.max(r, g, b), mn = Math.min(r, g, b);
  let h, s, l = (mx + mn) / 2;
  if (mx === mn) { h = s = 0; } else {
    const d = mx - mn;
    s = l > 0.5 ? d / (2 - mx - mn) : d / (mx + mn);
    if (mx === r) h = (g - b) / d + (g < b ? 6 : 0);
    else if (mx === g) h = (b - r) / d + 2;
    else h = (r - g) / d + 4;
    h /= 6;
  }
  return { h: h * 360, s: s * 100, l: l * 100 };
}

export function hslToRgb(h, s, l) {
  h /= 360; s /= 100; l /= 100;
  let r, g, b;
  if (s === 0) { r = g = b = l; } else {
    const hue2rgb = (p, q, t) => {
      if (t < 0) t += 1; if (t > 1) t -= 1;
      if (t < 1/6) return p + (q - p) * 6 * t;
      if (t < 1/2) return q;
      if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
      return p;
    };
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hue2rgb(p, q, h + 1/3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1/3);
  }
  return { r: Math.round(r * 255), g: Math.round(g * 255), b: Math.round(b * 255) };
}

function hexToRgb(hex) {
  const c = hex.replace('#', '');
  return {
    r: parseInt(c.slice(0, 2), 16) || 0,
    g: parseInt(c.slice(2, 4), 16) || 0,
    b: parseInt(c.slice(4, 6), 16) || 0,
  };
}

function rgbToHex(r, g, b) {
  const toHex = (c) => Math.max(0, Math.min(255, Math.round(c))).toString(16).padStart(2, '0');
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`.toUpperCase();
}

export function getComplementary(hex) {
  const { h, s, l } = rgbToHsl(hexToRgb(hex).r, hexToRgb(hex).g, hexToRgb(hex).b);
  const { r, g, b } = hslToRgb((h + 180) % 360, s, l);
  return rgbToHex(r, g, b);
}

export function getAnalogous(hex, count = 3) {
  const { h, s, l } = rgbToHsl(hexToRgb(hex).r, hexToRgb(hex).g, hexToRgb(hex).b);
  const step = 30;
  const colors = [];
  for (let i = 0; i < count; i++) {
    const nh = (h + step * (i - Math.floor(count / 2)) + 360) % 360;
    const { r, g, b } = hslToRgb(nh, s, l * 0.85);
    colors.push(rgbToHex(r, g, b));
  }
  return colors;
}

export function getTriad(hex) {
  const { h, s, l } = rgbToHsl(hexToRgb(hex).r, hexToRgb(hex).g, hexToRgb(hex).b);
  const t1 = hslToRgb((h + 120) % 360, s, l);
  const t2 = hslToRgb((h + 240) % 360, s, l);
  return [rgbToHex(t1.r, t1.g, t1.b), rgbToHex(t2.r, t2.g, t2.b)];
}

export function desaturate(hex, amount = 0.8) {
  const { h, s, l } = rgbToHsl(hexToRgb(hex).r, hexToRgb(hex).g, hexToRgb(hex).b);
  const { r, g, b } = hslToRgb(h, s * (1 - amount), l);
  return rgbToHex(r, g, b);
}

export function harmonizePalette(colors) {
  if (!colors || colors.length === 0) return null;
  const main = colors[0].hex || colors[0];
  return {
    complementary: getComplementary(main),
    analogous: getAnalogous(main, 3),
    triad: getTriad(main),
  };
}
