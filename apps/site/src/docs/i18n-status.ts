import { loadLocalizedCatalog } from './catalog'
import { formatStatusReport } from './status'

/**
 * Entry point of `bun run i18n:status`. Prints what is outstanding per
 * locale and exits non-zero only when a source or translation cannot be read.
 */
function main(): void {
  try {
    process.stdout.write(formatStatusReport(loadLocalizedCatalog()))
  } catch (error) {
    process.stderr.write(
      `i18n:status failed: ${error instanceof Error ? error.message : String(error)}\n`,
    )
    process.exitCode = 1
  }
}

main()
