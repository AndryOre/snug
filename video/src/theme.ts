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
  markGradient: 'linear-gradient(135deg, #FFA230, #FFD37A)',
  radius: '0.625rem',
  blobRadius: '42% 58% 55% 45% / 48% 42% 58% 52%',
} as const

export type Theme = typeof theme
