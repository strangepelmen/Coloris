const BUILTIN_PALETTES = [
  {
    name: 'Provence Sunset',
    colors: ['#E8A87C', '#D4A5A5', '#95B8D1', '#F4D03F', '#6C5B7B'],
    mood: 'warm romantic',
  },
  {
    name: 'Minimalism',
    colors: ['#F5F5F0', '#D1D1C6', '#9E9E93', '#5A5A52', '#2C2C28'],
    mood: 'calm clean',
  },
  {
    name: 'Cyberpunk',
    colors: ['#FF2A6D', '#05D9E8', '#8A2BE2', '#00FF41', '#1A1A2E'],
    mood: 'neon vibrant',
  },
  {
    name: 'Nordic Winter',
    colors: ['#D8E2DC', '#F4F1DE', '#E5CCAF', '#C9ADA7', '#9C89B8'],
    mood: 'cold serene',
  },
  {
    name: 'Tropical',
    colors: ['#FF6B6B', '#4ECDC4', '#FFE66D', '#95E1D3', '#F38181'],
    mood: 'bright energetic',
  },
  {
    name: 'Midnight City',
    colors: ['#2C3E50', '#34495E', '#4A6FA5', '#7FB3D8', '#AED6F1'],
    mood: 'dark urban',
  },
  {
    name: 'Autumn Leaves',
    colors: ['#C0392B', '#E67E22', '#F39C12', '#D35400', '#8E44AD'],
    mood: 'warm earthy',
  },
  {
    name: 'Cafe Latte',
    colors: ['#D2B48C', '#C19A6B', '#A0764A', '#6F4E37', '#3E2723'],
    mood: 'cozy warm',
  },
  {
    name: 'Ocean Deep',
    colors: ['#006994', '#0077B6', '#00B4D8', '#90E0EF', '#CAF0F8'],
    mood: 'calm aquatic',
  },
  {
    name: 'Cherry Blossom',
    colors: ['#FFB7C5', '#FF9CB0', '#F8A4B8', '#E8A0BF', '#D291BC'],
    mood: 'soft delicate',
  },
];

export function getRandomPalette() {
  const idx = Math.floor(Math.random() * BUILTIN_PALETTES.length);
  return { ...BUILTIN_PALETTES[idx] };
}

export function getPaletteByName(name) {
  return BUILTIN_PALETTES.find(p => p.name === name) || null;
}

export function getAllPalettes() {
  return BUILTIN_PALETTES;
}
