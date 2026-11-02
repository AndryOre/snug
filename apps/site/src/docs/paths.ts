import path from 'node:path'

/**
 * The repository root, resolved from the `apps/site` working directory
 * because bundled prerender chunks have no stable `import.meta` location.
 */
export const REPOSITORY_ROOT = path.resolve(process.cwd(), '../..')

/**
 * Repository-relative folder that holds one subfolder of translated pages per
 * locale, each mirroring the repository path of its English source.
 */
export const TRANSLATIONS_REPOSITORY_PATH = 'apps/site/src/content/translations'

/**
 * Absolute path of the translations folder.
 */
export const TRANSLATIONS_DIRECTORY = path.join(
  REPOSITORY_ROOT,
  TRANSLATIONS_REPOSITORY_PATH,
)

/**
 * Public GitHub repository that non-published files link to.
 */
const GITHUB_REPOSITORY_URL = 'https://github.com/AndryOre/snug'

const GITHUB_BRANCH = 'main'

/**
 * GitHub URL that shows a repository file or folder.
 * @param repositoryPath - Path relative to the repository root, using `/`.
 * @param isDirectory - Whether the path is a folder.
 * @returns The `blob` or `tree` URL on the main branch.
 */
export function githubViewUrl(
  repositoryPath: string,
  isDirectory = false,
): string {
  const kind = isDirectory ? 'tree' : 'blob'
  return `${GITHUB_REPOSITORY_URL}/${kind}/${GITHUB_BRANCH}/${repositoryPath}`
}

/**
 * GitHub URL that opens a repository file in the web editor.
 * @param repositoryPath - Path relative to the repository root, using `/`.
 * @returns The `edit` URL on the main branch.
 */
export function githubEditUrl(repositoryPath: string): string {
  return `${GITHUB_REPOSITORY_URL}/edit/${GITHUB_BRANCH}/${repositoryPath}`
}
