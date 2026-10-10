/**
 * Outcome of one Copy Markdown attempt.
 */
export type CopyMarkdownResult = 'copied' | 'failed'

/**
 * How long the Copied and error labels stay before the button resets.
 */
export const COPY_FEEDBACK_MILLISECONDS = 2000

/**
 * Fetches a page's Markdown twin and writes it to the clipboard.
 * @param twinHref - Site path of the `.md` twin.
 * @param fetchTwin - Fetch implementation.
 * @param writeText - Clipboard write, rejecting when the clipboard is blocked.
 * @returns `copied` once the text is on the clipboard, `failed` on any error.
 */
export async function copyMarkdownTwin(
  twinHref: string,
  fetchTwin: typeof fetch,
  writeText: (text: string) => Promise<void>,
): Promise<CopyMarkdownResult> {
  try {
    const response = await fetchTwin(twinHref)
    if (!response.ok) return 'failed'
    await writeText(await response.text())
    return 'copied'
  } catch {
    return 'failed'
  }
}
