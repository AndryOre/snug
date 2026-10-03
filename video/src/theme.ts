export const theme = {
  colors: {
    ground: '#17120A',
    card: '#231A10',
    text: '#F3EBDE',
    secondary: '#DCC8A6',
    muted: '#B8A98E',
    accent: '#FFA230',
    markGradientFrom: '#FFA230',
    markGradientTo: '#FFD37A',
  },
  ui: {
    surface: 'oklch(0.226 0.023 69.2)',
    surfaceMuted: 'oklch(0.268 0.026 71.5)',
    sidebar: 'oklch(0.206 0.02 73.3)',
    border: 'oklch(0.943 0.019 80.1 / 12%)',
    borderStrong: 'oklch(0.943 0.019 80.1 / 24%)',
    mutedText: 'oklch(0.74 0.041 82.3)',
    success: 'oklch(0.696 0.17 162.48)',
    bookmarkFile: 'oklch(0.623 0.214 259.815)',
    bookmarkFolder: 'oklch(0.795 0.184 86.047)',
    onAccent: '#17120A',
  },
  markGradient: 'linear-gradient(135deg, #FFA230, #FFD37A)',
  radius: '0.625rem',
  blobRadius: '42% 58% 55% 45% / 48% 42% 58% 52%',
  blobRadiusAlt: '58% 42% 45% 55% / 52% 58% 42% 48%',
} as const

export type Theme = typeof theme
