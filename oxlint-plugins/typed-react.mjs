import eslintReact from '@eslint-react/eslint-plugin'
import path from 'node:path'
import ts from 'typescript'

import { forwardWith } from './forward-with.mjs'

/**
 * Compiler programs already built, keyed by the absolute path of the
 * `tsconfig.json` they were created from, so each project is type-checked
 * once per lint run.
 */
const programsByConfigPath = new Map()

/**
 * Parse-time host for `ts.getParsedCommandLineOfConfigFile`. An
 * unrecoverable config diagnostic is rethrown so a broken `tsconfig.json`
 * stops the lint instead of silently producing an empty program.
 */
const parseConfigHost = {
  ...ts.sys,
  onUnRecoverableConfigFileDiagnostic(diagnostic) {
    throw new Error(
      `typed-react: cannot read tsconfig: ${ts.flattenDiagnosticMessageText(diagnostic.messageText, '\n')}`,
    )
  },
}

/**
 * Parses a `tsconfig.json` into its file list, options and project
 * references.
 * @param configPath Absolute path of the `tsconfig.json`.
 * @returns The parsed command line.
 */
function parseConfig(configPath) {
  const parsed = ts.getParsedCommandLineOfConfigFile(
    configPath,
    {},
    parseConfigHost,
  )
  if (!parsed) {
    throw new Error(`typed-react: cannot parse ${configPath}`)
  }
  return parsed
}

/**
 * Builds (or reuses) the compiler program of one `tsconfig.json`.
 * @param configPath Absolute path of the `tsconfig.json`.
 * @returns The program and the parsed config it came from.
 */
function programForConfig(configPath) {
  const cached = programsByConfigPath.get(configPath)
  if (cached) {
    return cached
  }
  const parsed = parseConfig(configPath)
  const program = ts.createProgram({
    rootNames: parsed.fileNames,
    options: { ...parsed.options, noEmit: true },
    projectReferences: parsed.projectReferences,
  })
  const entry = { program, parsed }
  programsByConfigPath.set(configPath, entry)
  return entry
}

/**
 * Resolves a project reference to the path of the `tsconfig.json` it names
 * (a reference may point at a directory or at a config file).
 * @param reference A `projectReferences` entry.
 * @returns Absolute path of the referenced config file.
 */
function referenceConfigPath(reference) {
  return ts.resolveProjectReferencePath(reference)
}

/**
 * Finds the program that contains `fileName`, starting at the nearest
 * `tsconfig.json`. A solution-style config (`files: []` plus `references`)
 * is followed to the referenced project whose `include` covers the file.
 * @param fileName Absolute path of the linted file.
 * @returns The program and its source file for `fileName`.
 * @throws {Error} When no `tsconfig.json` is found or no program covers the file —
 *   a file the shim cannot type must fail the lint rather than be skipped.
 */
function resolveProgram(fileName) {
  const configPath = ts.findConfigFile(
    path.dirname(fileName),
    ts.sys.fileExists,
    'tsconfig.json',
  )
  if (!configPath) {
    throw new Error(
      `typed-react: no tsconfig.json found above ${fileName}; the type-aware rule cannot run on it.`,
    )
  }
  const { program, parsed } = programForConfig(path.resolve(configPath))
  const direct = program.getSourceFile(fileName)
  if (direct) {
    return { program, sourceFile: direct }
  }
  const projectReferences = parsed.projectReferences ?? []
  for (const reference of projectReferences) {
    const referenced = programForConfig(referenceConfigPath(reference))
    const sourceFile = referenced.program.getSourceFile(fileName)
    if (!sourceFile) {
      continue
    }
    return { program: referenced.program, sourceFile }
  }
  throw new Error(
    `typed-react: ${fileName} is not part of the TypeScript program of ${configPath} or of any project it references; add it to a tsconfig "include".`,
  )
}

/**
 * Finds the TypeScript node whose span is exactly `start`..`end`, preferring
 * the deepest match. When none matches exactly, falls back to the widest node
 * that starts at `start` and ends inside the span: an ESTree `Identifier`
 * covers its type annotation (`value: Type`), the TypeScript one does not.
 * Failing that, takes the deepest node enclosing the span: a method's ESTree
 * `FunctionExpression` starts at its parameters, inside the TypeScript
 * `MethodDeclaration` that `@typescript-eslint/parser` maps it to.
 * @param sourceFile The TypeScript source file to search.
 * @param start Start offset of the ESTree node.
 * @param end End offset of the ESTree node.
 * @returns The matching TypeScript node, or `undefined`.
 */
function findTypeScriptNode(sourceFile, start, end) {
  let exact
  let prefix
  let enclosing
  function visit(node) {
    const nodeStart = node.getStart(sourceFile)
    const nodeEnd = node.getEnd()
    if (nodeStart > start || nodeEnd < start) {
      return
    }
    if (nodeStart === start && nodeEnd === end) {
      exact = node
    } else if (
      nodeStart === start &&
      nodeEnd < end &&
      (prefix === undefined || nodeEnd >= prefix.getEnd())
    ) {
      prefix = node
    }
    if (nodeEnd >= end) {
      enclosing = node
    }
    ts.forEachChild(node, visit)
  }
  visit(sourceFile)
  return exact ?? prefix ?? enclosing
}

/**
 * Builds the `parserServices` object `@typescript-eslint/parser` would
 * expose, backed by a program built from the nearest `tsconfig.json`.
 * @param fileName Absolute path of the linted file.
 * @returns Parser services with `getTypeAtLocation` and
 *   `getSymbolAtLocation` as well as the node maps type-aware rules read.
 */
function createParserServices(fileName) {
  const { program, sourceFile } = resolveProgram(fileName)
  const checker = program.getTypeChecker()
  const esTreeNodeToTSNodeMap = {
    get(node) {
      const tsNode = findTypeScriptNode(
        sourceFile,
        node.range[0],
        node.range[1],
      )
      if (!tsNode) {
        throw new Error(
          `typed-react: no TypeScript node for ${node.type} at ${fileName}:${node.range[0]}`,
        )
      }
      return tsNode
    },
  }
  return {
    program,
    hasFullTypeInformation: true,
    esTreeNodeToTSNodeMap,
    tsNodeToESTreeNodeMap: new WeakMap(),
    getTypeAtLocation: (node) =>
      checker.getTypeAtLocation(esTreeNodeToTSNodeMap.get(node)),
    getSymbolAtLocation: (node) =>
      checker.getSymbolAtLocation(esTreeNodeToTSNodeMap.get(node)),
    emitDecoratorMetadata: false,
    experimentalDecorators: false,
    isolatedDeclarations: false,
  }
}

/**
 * Wraps a type-aware ESLint rule so it receives TypeScript `parserServices`
 * on both `context.sourceCode.parserServices` and `context.parserServices`.
 * @param rule The original ESLint rule module.
 * @returns A rule with the same `meta` that runs `rule` with type information.
 */
export function withTypeInformation(rule) {
  return {
    meta: rule.meta,
    create(context) {
      const fileName = context.physicalFilename ?? context.filename
      const parserServices = createParserServices(fileName)
      const sourceCode = forwardWith(context.sourceCode, { parserServices })
      const typedContext = forwardWith(context, {
        sourceCode,
        parserServices,
        getSourceCode: () => sourceCode,
      })
      return rule.create(typedContext)
    },
  }
}

const originalRule = eslintReact.rules['no-leaked-conditional-rendering']

/**
 * Local Oxlint plugin running `@eslint-react/no-leaked-conditional-rendering`
 * — the one type-aware `@eslint-react` rule — with TypeScript 6
 * `parserServices`, because Oxlint's own type-aware path (tsgolint) cannot
 * feed a jsPlugin. Registered as `typed-react` in `oxlint.config.ts`.
 * `import ts from 'typescript'` works only while `typescript` stays 6.x; the
 * 7.x line has no classic JS compiler API.
 */
const typedReactPlugin = {
  meta: { name: 'typed-react' },
  rules: {
    'no-leaked-conditional-rendering': withTypeInformation(originalRule),
  },
}

export default typedReactPlugin
