import { normalizeUrl } from './duplicates'
import { shouldClearMobileRoot } from './importers/mobile-root'
import type { ParsedImportFile } from './importers/parse-import'
import {
  findSplitRootTypes,
  type RootChildNode,
} from './importers/resolve-roots'
import { isAllowedBookmarkUrl } from './importers/url-validation'
import { selectClearedRoots } from './replace-diff'
import { collectExistingUrls } from './skip-duplicates'
import type { ImportMode, ParsedBookmark } from './types'

/**
 * Why a bookmark is a Duplicate: its URL is already in the browser, or an
 * earlier bookmark of the batch (file order, then tree order) has it.
 */
type DuplicateReason = 'existing' | 'earlier-in-batch'

/**
 * What the import does with a bookmark.
 */
type ImportItemState =
  { status: 'new' } | { status: 'duplicate'; reason: DuplicateReason }

/**
 * A bookmark of the display tree. `id` is a synthetic path id, see
 * {@link ImportPlan}.
 */
export interface PlanBookmark {
  kind: 'bookmark'
  id: string
  title: string
  url: string
  state: ImportItemState
}

/**
 * A folder, or a file's top-level node, of the display tree.
 */
interface PlanFolder {
  kind: 'folder'
  id: string
  title: string
  children: PlanNode[]
}

export type PlanNode = PlanBookmark | PlanFolder

/**
 * A live bookmark a Restore-replace deletes.
 */
interface RemovedBookmark {
  title: string
  url: string
  folderPath: string[]
}

/**
 * Totals of an {@link ImportPlan}. `new` and `duplicate` cover the bookmarks
 * the importer would consider (valid URLs only).
 */
interface ImportPlanCounts {
  new: number
  duplicate: number
  removed: number
}

/**
 * What an import would do, computed without writing anything. Node ids are
 * path ids: `f<fileIndex>` for a file and `/<childIndex>` appended per level
 * of that file's parsed tree (`f1/0/2`). They are stable for a given input
 * and are the ids {@link pruneFilesToChecked} accepts. With two or more files
 * the display `tree` has one folder per file, with a single file it is that
 * file's own tree.
 */
export interface ImportPlan {
  tree: PlanNode[]
  removed: RemovedBookmark[]
  counts: ImportPlanCounts
}

/**
 * The live node shape the plan reads.
 */
interface PlanLiveNode extends RootChildNode {
  title?: string
  url?: string
  children?: PlanLiveNode[]
}

/**
 * Inputs of {@link buildImportPlan}.
 */
export interface ImportPlanInput {
  files: readonly { name?: string; file: ParsedImportFile }[]
  liveTree: readonly PlanLiveNode[]
  mode: ImportMode
  skipDuplicates: boolean
}

function fileId(fileIndex: number): string {
  return `f${fileIndex}`
}

function collectRemoved(
  nodes: readonly PlanLiveNode[],
  folderPath: string[],
  into: RemovedBookmark[],
): void {
  for (const node of nodes) {
    if (node.url !== undefined) {
      into.push({ title: node.title ?? '', url: node.url, folderPath })
    } else if (node.children) {
      const nextPath = node.title ? [...folderPath, node.title] : folderPath
      collectRemoved(node.children, nextPath, into)
    }
  }
}

function isFolderOnly(file: ParsedImportFile): boolean {
  return (
    file.format === 'csv' || (file.format === 'xbel' && !file.hasLocationData)
  )
}

function listRemoved(
  input: ImportPlanInput,
  liveRoots: PlanLiveNode[],
): RemovedBookmark[] {
  const locationFiles = input.files.filter(({ file }) => !isFolderOnly(file))
  if (input.mode !== 'restore-replace' || locationFiles.length === 0) return []
  const tree = locationFiles.flatMap(({ file }) => file.tree)
  const splitRootTypes = findSplitRootTypes(tree)
  const cleared = selectClearedRoots(liveRoots, {
    clearsMobileRoot: tree.some(
      (node) => node.isMobileBookmarks && shouldClearMobileRoot(node),
    ),
    ...(splitRootTypes.length > 0 && { splitRootTypes }),
  })
  const removed: RemovedBookmark[] = []
  for (const root of cleared) {
    collectRemoved([root], [], removed)
  }
  return removed
}

/**
 * Builds the import plan: a display tree of every bookmark the import would
 * handle, each marked `new` or `duplicate` with the same URL normalization and
 * first-wins rule as Skip duplicates, plus the live bookmarks a
 * Restore-replace deletes and the counts. Nothing is marked duplicate when
 * Skip duplicates is off or in Restore-replace (its targets are cleared
 * first). Nodes without an allowed URL are left out, as the importers skip
 * them. Pure: no input is mutated.
 * @param input The parsed files in batch order, the live bookmarks tree, the
 * import mode and the Skip duplicates option.
 * @returns The display tree, the removed list and the counts.
 */
export function buildImportPlan(input: ImportPlanInput): ImportPlan {
  const [liveRoot] = input.liveTree
  const liveRoots = [...(liveRoot?.children ?? [])]
  const shouldCheckDuplicates =
    input.skipDuplicates && input.mode !== 'restore-replace'
  const existing = shouldCheckDuplicates
    ? collectExistingUrls([...input.liveTree])
    : new Set<string>()
  const seen = new Set<string>()
  const counts: ImportPlanCounts = { new: 0, duplicate: 0, removed: 0 }

  const classify = (url: string): ImportItemState => {
    if (!shouldCheckDuplicates) return { status: 'new' }
    const key = normalizeUrl(url)
    if (existing.has(key)) return { status: 'duplicate', reason: 'existing' }
    if (seen.has(key)) {
      return { status: 'duplicate', reason: 'earlier-in-batch' }
    }
    seen.add(key)
    return { status: 'new' }
  }

  const build = (nodes: ParsedBookmark[], parentId: string): PlanNode[] => {
    const planNodes: PlanNode[] = []
    for (const [index, node] of nodes.entries()) {
      const id = `${parentId}/${index}`
      if (node.url === undefined) {
        planNodes.push({
          kind: 'folder',
          id,
          title: node.title,
          children: build(node.children ?? [], id),
        })
      } else if (isAllowedBookmarkUrl(node.url)) {
        const state = classify(node.url)
        counts[state.status] += 1
        planNodes.push({
          kind: 'bookmark',
          id,
          title: node.title,
          url: node.url,
          state,
        })
      }
    }
    return planNodes
  }

  const perFile = input.files.map(({ file }, fileIndex) =>
    build(file.tree, fileId(fileIndex)),
  )
  const tree =
    input.files.length >= 2
      ? input.files.map(({ name }, fileIndex): PlanFolder => ({
          kind: 'folder',
          id: fileId(fileIndex),
          title: name ?? '',
          children: perFile[fileIndex] ?? [],
        }))
      : (perFile[0] ?? [])

  const removed = listRemoved(input, liveRoots)
  counts.removed = removed.length
  return { tree, removed, counts }
}

/**
 * Prunes parsed files to the checked bookmarks (Import selection): keeps a
 * bookmark only when its path id is in `checkedIds`, drops folders left empty,
 * and keeps every other field of the surviving folders (root flags,
 * `folderType`, `syncing`, `dateAdded`). Files left with no bookmarks are
 * kept with an empty tree so file order and indexes stay stable. No input is
 * mutated.
 * @param files The parsed files, in the batch order the plan was built from.
 * @param checkedIds Path ids of the checked bookmarks.
 * @returns The files with pruned trees.
 */
export function pruneFilesToChecked<F extends { tree: ParsedBookmark[] }>(
  files: readonly F[],
  checkedIds: ReadonlySet<string>,
): F[] {
  const prune = (
    nodes: ParsedBookmark[],
    parentId: string,
  ): ParsedBookmark[] => {
    const kept: ParsedBookmark[] = []
    for (const [index, node] of nodes.entries()) {
      const id = `${parentId}/${index}`
      if (node.url === undefined) {
        const children = prune(node.children ?? [], id)
        if (children.length > 0) kept.push({ ...node, children })
      } else if (checkedIds.has(id)) {
        kept.push(node)
      }
    }
    return kept
  }
  return files.map((file, fileIndex) => ({
    ...file,
    tree: prune(file.tree, fileId(fileIndex)),
  }))
}

/**
 * Lists the path ids of the duplicate bookmarks the import still has to see
 * so it can skip and count them. A duplicate of a bookmark already in the
 * browser is always listed. A duplicate of an earlier bookmark of the batch is
 * listed only while that earlier copy is checked, so unchecking it never
 * imports the later copy in its place.
 * @param nodes The plan's display tree.
 * @param checkedIds The path ids the user left checked.
 * @returns The ids of the duplicate bookmarks, in tree order.
 */
export function collectDuplicateIds(
  nodes: readonly PlanNode[],
  checkedIds: ReadonlySet<string>,
): string[] {
  const checkedUrls = new Set<string>()
  const collectCheckedUrls = (level: readonly PlanNode[]): void => {
    for (const node of level) {
      if (node.kind === 'folder') collectCheckedUrls(node.children)
      else if (node.state.status === 'new' && checkedIds.has(node.id)) {
        checkedUrls.add(normalizeUrl(node.url))
      }
    }
  }
  collectCheckedUrls(nodes)

  const collect = (level: readonly PlanNode[]): string[] =>
    level.flatMap((node) => {
      if (node.kind === 'folder') return collect(node.children)
      if (node.state.status !== 'duplicate') return []
      const isListed =
        node.state.reason === 'existing' ||
        checkedUrls.has(normalizeUrl(node.url))
      return isListed ? [node.id] : []
    })
  return collect(nodes)
}

/**
 * Counts the duplicates that follow the Import selection. With
 * `skipDuplicates` on it is the length of {@link collectDuplicateIds}: what the
 * import will actually skip. With it off, duplicates are checkable, so it is
 * how many checked duplicates would be skipped if the switch were turned on: a
 * checked existing duplicate always counts, a checked in-batch duplicate only
 * while its earlier copy is checked too.
 * @param nodes The plan's display tree.
 * @param checkedIds The path ids the user left checked.
 * @param isSkippingDuplicates Whether Skip duplicates is on.
 * @returns The duplicate count for the current selection.
 */
export function countSelectedDuplicates(
  nodes: readonly PlanNode[],
  checkedIds: ReadonlySet<string>,
  isSkippingDuplicates: boolean,
): number {
  const listed = collectDuplicateIds(nodes, checkedIds)
  return isSkippingDuplicates
    ? listed.length
    : listed.filter((id) => checkedIds.has(id)).length
}
