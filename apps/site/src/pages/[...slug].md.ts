import type { APIRoute, GetStaticPaths } from 'astro'
import { getCollection } from 'astro:content'

import { buildMarkdownTwin, markdownTwinRoutes } from '../docs/markdown-twin'

export const getStaticPaths = (async () => {
  const entries = await getCollection('docs')
  return markdownTwinRoutes().flatMap(({ slug }) => {
    const entry = entries.find((candidate) => candidate.id === slug)
    if (!entry) return []
    const markdown = buildMarkdownTwin(entry.data.title, entry.body ?? '')
    return [{ params: { slug }, props: { markdown } }]
  })
}) satisfies GetStaticPaths

export const GET: APIRoute = ({ props }) =>
  new Response(String(props.markdown), {
    headers: { 'Content-Type': 'text/markdown; charset=utf-8' },
  })
