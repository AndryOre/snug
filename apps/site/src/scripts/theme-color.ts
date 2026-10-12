/**
 * Browser chrome colours for each rendered theme, matching the page
 * background so the address bar blends with the document.
 */
export const THEME_COLORS = { light: '#f1ece4', dark: '#17120a' } as const

/**
 * Pick the colour a `theme-color` meta tag should carry.
 * @param isDark - Whether the page renders the dark theme.
 * @returns The hex colour for that theme.
 */
export function themeColor(isDark: boolean): string {
  return isDark ? THEME_COLORS.dark : THEME_COLORS.light
}
