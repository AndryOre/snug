import { buildSecurityTxt } from '../../seo/security-txt'

export function GET() {
  return new Response(buildSecurityTxt(), {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  })
}
