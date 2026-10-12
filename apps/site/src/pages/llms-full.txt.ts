import { getContent } from '../i18n/content'
import { comparisonLlmsFullSections } from '../seo/comparison-pages'
import { buildLlmsFullTxt } from '../seo/crawlers'
import { guideLlmsFullSections } from '../seo/documentation-pages'
import { howToLlmsFullSections } from '../seo/how-to-pages'

export function GET() {
  return new Response(
    buildLlmsFullTxt(getContent('en'), [
      ...howToLlmsFullSections(),
      ...comparisonLlmsFullSections(),
      ...guideLlmsFullSections(),
    ]),
    { headers: { 'Content-Type': 'text/plain; charset=utf-8' } },
  )
}
