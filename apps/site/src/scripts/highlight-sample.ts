import { ExpressiveCode, loadShikiTheme } from 'expressive-code'
import { toHtml } from 'hast-util-to-html'

/**
 * A highlighted sample: the markup of one code block plus the stylesheet that
 * colors it for the light and dark themes.
 */
export interface HighlightedSample {
  html: string
  css: string
}

const engine = new ExpressiveCode({
  themes: await Promise.all([
    loadShikiTheme('github-light'),
    loadShikiTheme('github-dark'),
  ]),
  themeCssSelector: (theme) =>
    theme.type === 'dark' ? '.dark' : ':root:not(.dark)',
  useDarkModeMediaQuery: false,
  frames: false,
  textMarkers: false,
})

/**
 * Highlights a sample at build time with a standalone Expressive Code engine.
 * It renders no frame or copy button, so unlike the Guide's code blocks it adds
 * no script to the page.
 * @param code - The sample source.
 * @param language - A Shiki language id.
 * @returns The block markup and the stylesheet for every block of the engine.
 */
export async function highlightSample(
  code: string,
  language: string,
): Promise<HighlightedSample> {
  const { renderedGroupAst, styles } = await engine.render({ code, language })
  const [baseStyles, themeStyles] = await Promise.all([
    engine.getBaseStyles(),
    engine.getThemeStyles(),
  ])
  return {
    html: toHtml(renderedGroupAst),
    css: [baseStyles, themeStyles, ...styles].join(''),
  }
}
