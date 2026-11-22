/**
 * Shared design tokens, matching the "Pick 4" warm cream/orange mockup
 * (Claude Artifacts Design Canvas). Every screen pulls colors/radii/shadows
 * from here instead of hardcoding hex values, so the whole app stays in
 * sync with the mockup as it evolves.
 */

export const colors = {
  // backgrounds
  bg: '#FDECDA',
  card: '#ffffff',
  cardAlt: '#FFF1E0',

  // text
  ink: '#3A2A1E',
  inkSoft: '#6B5D4E',
  inkFaint: '#9C8E7E',
  inkMuted: '#B0A89A',

  // brand / CTA
  orange: '#FF9800',
  orangeDeep: '#FF8608',
  orangeLight: '#FFBA43',
  orangeShadow: 'rgba(223,123,35,0.3)',

  // tile / accent families (from the mockup's number grid)
  blue: '#4D9DF5',
  blueDeep: '#2E6FD9',
  blueGradTop: '#7FBBFA',
  blueGradBottom: '#3E8EF7',

  green: '#58C25E',
  greenDeep: '#3D8B40',
  greenGradTop: '#7ED683',
  greenGradBottom: '#4FAE57',

  purple: '#8A78F8',
  purpleLight: '#C9AEFD',
  purpleDeep: '#6E5EF5',

  success: '#4CAD50',
  error: '#E8793A',

  gold: '#FFB005',
  goldLight: '#FFDF5D',
  goldText: '#A96300',

  white: '#ffffff',
  border: '#F1E0C4',
};

export const radii = {
  sm: 12,
  md: 16,
  lg: 18,
  xl: 20,
  pill: 999,
};

export const shadows = {
  card: {
    shadowColor: 'rgba(74,59,46,1)',
    shadowOpacity: 0.08,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  cta: {
    shadowColor: 'rgba(223,123,35,1)',
    shadowOpacity: 0.3,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  soft: {
    shadowColor: 'rgba(74,59,46,1)',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 1,
  },
  // Slightly deeper + wider than `soft` — for surfaces we want to read as
  // physically raised off the background (mode cards, banners), not just
  // lightly separated from it.
  raised: {
    shadowColor: 'rgba(74,59,46,1)',
    shadowOpacity: 0.14,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 7 },
    elevation: 5,
  },
  glowOrange: {
    shadowColor: colors.orange,
    shadowOpacity: 0.35,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 0 },
    elevation: 6,
  },
  glowPurple: {
    shadowColor: colors.purpleDeep,
    shadowOpacity: 0.4,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 6,
  },
};

/**
 * A thin, semi-transparent white-to-nothing gradient, meant to sit as an
 * absolutely-positioned overlay across the top ~45% of a raised surface
 * (button, card, tile). This is the "soft highlight on the upper edge"
 * that reads as a light source from above, without needing new art.
 */
export const topHighlight: [string, string] = ['rgba(255,255,255,0.35)', 'rgba(255,255,255,0)'];

export const fontWeights = {
  regular: '400' as const,
  medium: '500' as const,
  semibold: '600' as const,
  bold: '700' as const,
  heavy: '800' as const,
};

/** The ninja mascot, one image per emotional beat. */
export const mascot = {
  idle: require('../assets/mascot/ninja-idle.png'),
  waving: require('../assets/mascot/ninja-waving.png'),
  thinking: require('../assets/mascot/ninja-thinking.png'),
  confused: require('../assets/mascot/ninja-confused.png'),
  celebrating: require('../assets/mascot/ninja-celebrating.png'),
};
