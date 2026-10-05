import { getPageMeta } from '../i18n/content'
import { buildLlmsTxt } from '../seo/crawlers'

export function GET() {
  return new Response(buildLlmsTxt(getPageMeta('en').description), {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  })
}
