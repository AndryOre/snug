import noNonDocumentComments from './no-non-doc-comments.mjs'

/**
 * This repo's local Oxlint plugin, registered in `oxlint.config.ts` under
 * the `local` namespace (e.g. `local/no-non-doc-comments`).
 */
const localPlugin = {
  meta: { name: 'local' },
  rules: {
    'no-non-doc-comments': noNonDocumentComments,
  },
}

export default localPlugin
