# Browser logos

Vendored, optimized copies of the browser logos used by the landing marquee.

- Source: https://svgl.app/library/{chrome,edge,brave,opera,firefox,safari}.svg
- Collection: [svgl](https://svgl.app) by pheralb, an MIT-licensed library of
  SVG logos. The marks themselves remain trademarks of their owners (Google,
  Microsoft, Brave Software, Opera, Mozilla, Apple) and are shown only to
  identify the browsers Snug supports.
- Optimized with `svgo --multipass`; no other edits.
- Never hot-link these from svgl.app: the site CSP is `img-src 'self'`
  ([ADR 0011](../../../../../docs/adr/0011-landing-static-site-no-third-party-scripts.md)).
