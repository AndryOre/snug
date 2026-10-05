import { getContent } from '../i18n/content'
import { buildLlmsFullTxt } from '../seo/crawlers'

export function GET() {
  return new Response(buildLlmsFullTxt(getContent('en')), {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  })
}
