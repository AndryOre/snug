import 'astro'

declare module 'astro' {
  interface AstroClientDirectives {
    'client:interaction'?: boolean
  }
}
