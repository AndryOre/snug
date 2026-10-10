import { restrictToMarkTags } from './search-markup'

/**
 * The slice of the browser's `window.trustedTypes` this site uses.
 */
export interface TrustedTypesFactory {
  createPolicy(
    name: string,
    rules: {
      createHTML: (input: string) => string
      createScriptURL: (input: string) => string
    },
  ): unknown
}

const PAGEFIND_WORKER_PATH = '/pagefind/pagefind-worker.js'

/**
 * Lets only Pagefind's own web worker through as a script URL. Pagefind starts
 * it with `new Worker(url)`, which is a Trusted Types script URL sink.
 * @param input - The URL a page script assigns to a script URL sink.
 * @param origin - The origin of the current page.
 * @returns The URL unchanged when it is the same-origin Pagefind worker.
 * @throws {TypeError} For any other script URL, which keeps the sink blocked.
 */
export function restrictToPagefindWorker(
  input: string,
  origin: string,
): string {
  const url = URL.canParse(input, origin) ? new URL(input, origin) : undefined
  if (url?.origin === origin && url.pathname === PAGEFIND_WORKER_PATH) {
    return input
  }
  throw new TypeError(`Blocked script URL "${input}"`)
}

/**
 * Registers the page's `default` Trusted Types policy, which the browser
 * applies to plain strings reaching an HTML or script URL sink under the
 * `require-trusted-types-for 'script'` CSP directive. Pagefind's result list
 * assigns excerpts through `innerHTML` and its search runs in a web worker, so
 * without it both are blocked. The policy lets only `<mark>` tags and the
 * same-origin Pagefind worker through and defines no script callback, so every
 * other sink stays blocked.
 * @param factory - The page's `window.trustedTypes`, absent in browsers
 * without Trusted Types, where no policy is needed.
 * @param origin - The origin of the current page.
 */
export function installSearchTrustedTypesPolicy(
  factory: TrustedTypesFactory | undefined,
  origin: string,
): void {
  factory?.createPolicy('default', {
    createHTML: restrictToMarkTags,
    createScriptURL: (input) => restrictToPagefindWorker(input, origin),
  })
}
