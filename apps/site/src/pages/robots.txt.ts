import { buildRobotsTxt } from '../seo/crawlers'

export function GET() {
  return new Response(buildRobotsTxt(), {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  })
}
