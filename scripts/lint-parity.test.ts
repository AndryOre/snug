import { readFileSync } from 'node:fs'
import { describe, expect, test } from 'vitest'

import {
  checkExpectedFixtures,
  checkOxlintShards,
  checkRuleCoverage,
  compareSection,
  diffFindings,
  type Finding,
  fixtureTargetPath,
  normalizeEslintRule,
  normalizeOxlintCode,
  OXLINT_UNCODED_RULE,
  parseAccepted,
  parseEslintJson,
  parseOxlintJson,
  partitionAccepted,
  renderReport,
  summarizeByRule,
  UNUSED_DIRECTIVE_RULE,
} from './lint-parity'

const finding = (file: string, line: number, rule: string): Finding => ({
  file,
  line,
  rule,
})

describe('diffFindings', () => {
  test('splits findings by exact (file, line, rule) identity', () => {
    const diff = diffFindings(
      [finding('a.ts', 1, 'no-var'), finding('a.ts', 2, 'prefer-const')],
      [finding('a.ts', 1, 'no-var'), finding('b.ts', 4, 'no-var')],
    )
    expect(diff).toEqual({
      common: [finding('a.ts', 1, 'no-var')],
      eslintOnly: [finding('a.ts', 2, 'prefer-const')],
      oxlintOnly: [finding('b.ts', 4, 'no-var')],
    })
  })

  test('collapses duplicates and sorts by file, line, then rule', () => {
    const diff = diffFindings(
      [
        finding('b.ts', 1, 'no-var'),
        finding('a.ts', 9, 'z-rule'),
        finding('a.ts', 9, 'a-rule'),
        finding('b.ts', 1, 'no-var'),
      ],
      [],
    )
    expect(diff.eslintOnly).toEqual([
      finding('a.ts', 9, 'a-rule'),
      finding('a.ts', 9, 'z-rule'),
      finding('b.ts', 1, 'no-var'),
    ])
  })

  test('a different line on the same rule is a gap, not a match', () => {
    const diff = diffFindings(
      [finding('a.ts', 3, 'no-var')],
      [finding('a.ts', 4, 'no-var')],
    )
    expect(diff.common).toEqual([])
    expect(diff.eslintOnly).toEqual([finding('a.ts', 3, 'no-var')])
  })
})

describe('partitionAccepted', () => {
  test('splits entries by the corpus path prefix', () => {
    const fixtureEntry = {
      file: 'scripts/probe.ts',
      rule: 'eqeqeq',
      reason: 'r',
    }
    const corpusEntry = {
      file: 'corpus/repo/a.ts',
      rule: 'eqeqeq',
      reason: 'r',
    }
    expect(partitionAccepted([fixtureEntry, corpusEntry])).toEqual({
      fixtures: [fixtureEntry],
      corpus: [corpusEntry],
    })
  })
})

describe('parseAccepted', () => {
  test('accepts entries with a reason and an optional line', () => {
    expect(
      parseAccepted(
        JSON.stringify([
          { file: 'a.ts', rule: 'no-var', reason: 'why' },
          { file: 'b.ts', line: 3, rule: 'no-var', reason: 'why' },
        ]),
      ),
    ).toEqual([
      { file: 'a.ts', rule: 'no-var', reason: 'why' },
      { file: 'b.ts', line: 3, rule: 'no-var', reason: 'why' },
    ])
  })

  test.each([
    ['a non-array document', '{}'],
    ['an entry without a reason', '[{"file":"a.ts","rule":"x"}]'],
    ['a blank reason', '[{"file":"a.ts","rule":"x","reason":"  "}]'],
    ['a non-numeric line', '[{"file":"a","rule":"x","reason":"y","line":"1"}]'],
    ['an entry without a file', '[{"rule":"x","reason":"y"}]'],
  ])('rejects %s', (_label, text) => {
    expect(() => parseAccepted(text)).toThrow(TypeError)
  })
})

describe('compareSection', () => {
  test('a gap with no accepted entry is unexplained and fails the gate', () => {
    const result = compareSection({
      name: 'fixtures',
      baseline: [finding('a.ts', 1, 'no-var')],
      candidate: [],
      accepted: [],
    })
    expect(result.unexplained).toEqual([finding('a.ts', 1, 'no-var')])
    expect(result.exitCode).toBe(1)
  })

  test('an accepted entry explains the gap it matches and passes the gate', () => {
    const result = compareSection({
      name: 'fixtures',
      baseline: [finding('a.ts', 1, 'no-var'), finding('a.ts', 7, 'no-var')],
      candidate: [],
      accepted: [{ file: 'a.ts', rule: 'no-var', reason: 'known upstream' }],
    })
    expect(result.unexplained).toEqual([])
    expect(result.explained).toEqual([
      { ...finding('a.ts', 1, 'no-var'), reason: 'known upstream' },
      { ...finding('a.ts', 7, 'no-var'), reason: 'known upstream' },
    ])
    expect(result.exitCode).toBe(0)
  })

  test('an accepted entry with a line only explains that line', () => {
    const result = compareSection({
      name: 'fixtures',
      baseline: [finding('a.ts', 1, 'no-var'), finding('a.ts', 7, 'no-var')],
      candidate: [],
      accepted: [{ file: 'a.ts', line: 7, rule: 'no-var', reason: 'why' }],
    })
    expect(result.unexplained).toEqual([finding('a.ts', 1, 'no-var')])
  })

  test('accepted entries that match nothing are reported as stale', () => {
    const stale = { file: 'gone.ts', rule: 'no-var', reason: 'why' }
    const result = compareSection({
      name: 'fixtures',
      baseline: [],
      candidate: [],
      accepted: [stale],
    })
    expect(result.stale).toEqual([stale])
    expect(result.exitCode).toBe(0)
  })

  test('the same rule one line apart pairs up as an explained line shift', () => {
    const result = compareSection({
      name: 'fixtures',
      baseline: [finding('a.ts', 3, 'jsdoc/require-param')],
      candidate: [finding('a.ts', 4, 'jsdoc/require-param')],
      accepted: [],
    })
    expect(result.unexplained).toEqual([])
    expect(result.oxlintOnly).toEqual([])
    expect(result.lineShifts).toEqual([
      {
        eslint: finding('a.ts', 3, 'jsdoc/require-param'),
        oxlint: finding('a.ts', 4, 'jsdoc/require-param'),
      },
    ])
  })

  test('a shift pairs each Oxlint finding once, nearest line first', () => {
    const result = compareSection({
      name: 'fixtures',
      baseline: [finding('a.ts', 10, 'no-var'), finding('a.ts', 13, 'no-var')],
      candidate: [finding('a.ts', 12, 'no-var')],
      accepted: [],
    })
    expect(result.lineShifts).toEqual([
      {
        eslint: finding('a.ts', 13, 'no-var'),
        oxlint: finding('a.ts', 12, 'no-var'),
      },
    ])
    expect(result.unexplained).toEqual([finding('a.ts', 10, 'no-var')])
  })

  test('a shift never pairs findings further apart than the window', () => {
    const result = compareSection({
      name: 'fixtures',
      baseline: [finding('a.ts', 1, 'no-var')],
      candidate: [finding('a.ts', 9, 'no-var')],
      accepted: [],
    })
    expect(result.lineShifts).toEqual([])
    expect(result.unexplained).toEqual([finding('a.ts', 1, 'no-var')])
    expect(result.oxlintOnly).toEqual([finding('a.ts', 9, 'no-var')])
  })

  test('a shift never pairs different rules or files', () => {
    const result = compareSection({
      name: 'fixtures',
      baseline: [finding('a.ts', 1, 'no-var'), finding('a.ts', 5, 'x')],
      candidate: [finding('b.ts', 1, 'no-var'), finding('a.ts', 5, 'y')],
      accepted: [],
    })
    expect(result.lineShifts).toEqual([])
    expect(result.unexplained).toHaveLength(2)
  })
})

describe('summarizeByRule', () => {
  test('counts common, gaps, extras and explained findings per rule', () => {
    const result = compareSection({
      name: 'fixtures',
      baseline: [
        finding('a.ts', 1, 'no-var'),
        finding('a.ts', 2, 'no-var'),
        finding('a.ts', 3, 'prefer-const'),
        finding('a.ts', 20, 'local/x'),
      ],
      candidate: [
        finding('a.ts', 1, 'no-var'),
        finding('a.ts', 9, 'unicorn/y'),
        finding('a.ts', 21, 'local/x'),
      ],
      accepted: [{ file: 'a.ts', rule: 'prefer-const', reason: 'why' }],
    })
    expect(summarizeByRule(result)).toEqual([
      {
        rule: 'local/x',
        common: 0,
        eslintOnly: 0,
        oxlintOnly: 0,
        explained: 1,
      },
      { rule: 'no-var', common: 1, eslintOnly: 1, oxlintOnly: 0, explained: 0 },
      {
        rule: 'prefer-const',
        common: 0,
        eslintOnly: 0,
        oxlintOnly: 0,
        explained: 1,
      },
      {
        rule: 'unicorn/y',
        common: 0,
        eslintOnly: 0,
        oxlintOnly: 1,
        explained: 0,
      },
    ])
  })
})

describe('parseEslintJson', () => {
  const root = '/repo'

  test('reads findings with repo-relative paths and normalized ids', () => {
    const text = JSON.stringify([
      {
        filePath: '/repo/src/a.ts',
        messages: [
          { ruleId: 'unicorn-js/prefer-https', line: 4, message: 'x' },
          { ruleId: null, line: 7, message: 'Unused eslint-disable directive' },
          { ruleId: null, line: 8, message: 'File ignored by default.' },
        ],
      },
    ])
    expect(parseEslintJson(text, root, '')).toEqual([
      finding('src/a.ts', 4, 'unicorn/prefer-https'),
      finding('src/a.ts', 7, UNUSED_DIRECTIVE_RULE),
    ])
  })

  test('prefixes paths so corpus files never collide with repo files', () => {
    const text = JSON.stringify([
      { filePath: '/c/x.ts', messages: [{ ruleId: 'no-var', line: 1 }] },
    ])
    expect(parseEslintJson(text, '/c', 'corpus/zustand/')).toEqual([
      finding('corpus/zustand/x.ts', 1, 'no-var'),
    ])
  })

  test('throws on a fatal message so no file silently drops out', () => {
    const text = JSON.stringify([
      {
        filePath: '/repo/a.ts',
        messages: [
          { ruleId: null, line: 1, fatal: true, message: 'Parsing error' },
        ],
      },
    ])
    expect(() => parseEslintJson(text, root, '')).toThrow(/Parsing error/)
  })
})

describe('parseOxlintJson', () => {
  test('reads diagnostics with normalized ids and first-label lines', () => {
    const text = JSON.stringify({
      diagnostics: [
        {
          code: 'typescript(no-explicit-any)',
          filename: 'src/a.ts',
          labels: [{ span: { line: 3 } }],
        },
        {
          code: '',
          message:
            'Unused eslint-disable directive (no problems were reported).',
          filename: '/repo/src/b.ts',
          labels: [{ span: { line: 5 } }],
        },
        { code: 'unicorn(no-null)', filename: 'src/c.ts' },
      ],
    })
    expect(parseOxlintJson(text, '/repo', '')).toEqual([
      finding('src/a.ts', 3, '@typescript-eslint/no-explicit-any'),
      finding('src/b.ts', 5, UNUSED_DIRECTIVE_RULE),
      finding('src/c.ts', 0, 'unicorn/no-null'),
    ])
  })
})

describe('fixtureTargetPath', () => {
  test('drops the .fixture suffix that hides fixtures from the toolchain', () => {
    expect(fixtureTargetPath('apps/x/a.test.ts.fixture')).toBe(
      'apps/x/a.test.ts',
    )
  })

  test('rejects a fixture without the suffix', () => {
    expect(() => fixtureTargetPath('apps/x/a.ts')).toThrow(/\.fixture/)
  })
})

describe('checkRuleCoverage', () => {
  test('an enforced rule no fixture triggers is a harness problem', () => {
    const problems = checkRuleCoverage(
      new Set(['no-var', 'prefer-const']),
      [finding('a.ts', 1, 'no-var')],
      {},
    )
    expect(problems).toEqual([
      'Enforced rule prefer-const is not triggered by any fixture',
    ])
  })

  test('an allow-listed rule passes, but only with a reason', () => {
    expect(
      checkRuleCoverage(new Set(['prefer-const']), [], {
        'prefer-const': 'cannot be triggered because of a reason',
      }),
    ).toEqual([])
    expect(
      checkRuleCoverage(new Set(['prefer-const']), [], { 'prefer-const': ' ' }),
    ).toEqual([
      'Untriggerable rule prefer-const needs a reason',
      'Enforced rule prefer-const is not triggered by any fixture',
    ])
  })

  test('an allow-list entry for a triggered or unenforced rule is stale', () => {
    expect(
      checkRuleCoverage(new Set(['no-var']), [finding('a.ts', 1, 'no-var')], {
        'no-var': 'why',
        gone: 'why',
      }),
    ).toEqual([
      'Untriggerable rule no-var is triggered by a fixture; drop its entry',
      'Untriggerable rule gone is not enforced; drop its entry',
    ])
  })
})

describe('checkExpectedFixtures', () => {
  test('reports expected rules ESLint did not flag and unlisted fixtures', () => {
    const problems = checkExpectedFixtures(
      { 'a.ts': ['no-var', 'prefer-const'] },
      [finding('a.ts', 1, 'no-var')],
      ['a.ts', 'b.ts'],
    )
    expect(problems).toEqual([
      'ESLint did not report prefer-const on fixture a.ts',
      'Fixture b.ts is missing from expected.json',
    ])
  })
})

describe('renderReport', () => {
  test('lists every unexplained gap and flags type-aware rules apart', () => {
    const result = compareSection({
      name: 'fixtures',
      baseline: [
        finding('a.ts', 1, '@typescript-eslint/no-floating-promises'),
        finding('a.ts', 2, 'no-var'),
      ],
      candidate: [finding('a.ts', 2, 'no-var')],
      accepted: [],
    })
    const report = renderReport({
      sections: [result],
      typeAwareRules: new Set(['@typescript-eslint/no-floating-promises']),
      problems: [],
      uncoveredRules: ['unicorn/no-for-loop'],
    })
    expect(report).toContain('UNEXPLAINED ESLint-only findings: 1')
    expect(report).toContain(
      '- `a.ts:1` `@typescript-eslint/no-floating-promises`',
    )
    expect(report).toMatch(/## \(c\) Type-aware[\s\S]*no-floating-promises/)
    expect(report).toContain('`unicorn/no-for-loop`')
    expect(report).toContain('Gate: FAIL')
  })

  test('passes the gate with no gaps and no harness problems', () => {
    const result = compareSection({
      name: 'corpus',
      baseline: [finding('a.ts', 2, 'no-var')],
      candidate: [finding('a.ts', 2, 'no-var')],
      accepted: [],
    })
    const report = renderReport({
      sections: [result],
      typeAwareRules: new Set(),
      problems: [],
      uncoveredRules: [],
    })
    expect(report).toContain('Gate: PASS')
  })

  test('fails the gate on a harness problem even without gaps', () => {
    const report = renderReport({
      sections: [],
      typeAwareRules: new Set(),
      problems: ['ESLint did not report no-var on fixture a.ts'],
      uncoveredRules: [],
    })
    expect(report).toContain('Gate: FAIL')
    expect(report).toContain('ESLint did not report no-var on fixture a.ts')
  })
})

describe('normalizeOxlintCode', () => {
  test.each([
    ['eslint(no-var)', 'no-var'],
    ['eslint(no-unused-vars)', '@typescript-eslint/no-unused-vars'],
    [
      'typescript(no-floating-promises)',
      '@typescript-eslint/no-floating-promises',
    ],
    ['unicorn(no-for-loop)', 'unicorn/no-for-loop'],
    ['unicorn-js(isolated-functions)', 'unicorn/isolated-functions'],
    ['jsx-a11y-js(anchor-has-content)', 'jsx-a11y/anchor-has-content'],
    ['react(rules-of-hooks)', 'react-hooks/rules-of-hooks'],
    ['react(jsx-no-target-blank)', 'react/jsx-no-target-blank'],
    ['react-js(jsx-no-literals)', 'react/jsx-no-literals'],
    ['react-hooks-js(gating)', 'react-hooks/gating'],
    ['jsdoc-js(require-param)', 'jsdoc/require-param'],
    [
      'eslint-comments(require-description)',
      '@eslint-community/eslint-comments/require-description',
    ],
    [
      'typed-react(no-leaked-conditional-rendering)',
      '@eslint-react/no-leaked-conditional-rendering',
    ],
    [
      'typescript-eslint-js(no-unsafe-assignment)',
      '@typescript-eslint/no-unsafe-assignment',
    ],
    ['@eslint-react(no-missing-key)', '@eslint-react/no-missing-key'],
    ['shadcn(no-raw-colors)', 'shadcn/no-raw-colors'],
    ['local(no-non-doc-comments)', 'local/no-non-doc-comments'],
  ])('maps %s to the ESLint id %s', (code, expected) => {
    expect(normalizeOxlintCode(code, '')).toBe(expected)
  })

  test('keeps any other uncoded diagnostic visible under its own id', () => {
    expect(normalizeOxlintCode('', 'Invalid tsconfig')).toBe(
      OXLINT_UNCODED_RULE,
    )
  })

  test('maps an uncoded unused-directive report to the pseudo rule', () => {
    expect(
      normalizeOxlintCode(
        '',
        'Unused eslint-disable directive (no problems were reported).',
      ),
    ).toBe(UNUSED_DIRECTIVE_RULE)
  })
})

describe('normalizeEslintRule', () => {
  test.each([
    ['unicorn-js/prefer-https', 'unicorn/prefer-https'],
    [
      'jsx-a11y-js/role-has-required-aria-props',
      'jsx-a11y/role-has-required-aria-props',
    ],
    [
      '@typescript-eslint/no-explicit-any',
      '@typescript-eslint/no-explicit-any',
    ],
  ])('maps the alias %s to %s', (ruleId, expected) => {
    expect(normalizeEslintRule(ruleId, '')).toBe(expected)
  })

  test('maps an unused directive without a rule id to the pseudo rule', () => {
    expect(
      normalizeEslintRule(
        null,
        "Unused eslint-disable directive (no problems were reported from 'no-var').",
      ),
    ).toBe(UNUSED_DIRECTIVE_RULE)
  })

  test('maps a directive naming an unknown rule to the pseudo rule', () => {
    expect(
      normalizeEslintRule(
        'foo/bar',
        "Definition for rule 'foo/bar' was not found.",
      ),
    ).toBe(UNUSED_DIRECTIVE_RULE)
  })

  test('drops other messages without a rule id', () => {
    expect(
      normalizeEslintRule(null, 'File ignored by default.'),
    ).toBeUndefined()
  })
})

const sharded = (
  shards: Readonly<Record<string, string>>,
): Record<string, string> => ({
  'lint:oxlint': `bun run --parallel --no-exit-on-error ${Object.keys(shards).join(' ')}`,
  ...shards,
})

describe('checkOxlintShards', () => {
  const base = 'oxlint --type-aware --deny-warnings'

  test('shards that lint every file exactly once pass', () => {
    expect(
      checkOxlintShards(
        sharded({
          'lint:oxlint:lib': `${base} apps/extension/lib`,
          'lint:oxlint:extension': `${base} apps/extension --ignore-pattern 'apps/extension/lib/**'`,
          'lint:oxlint:site': `${base} apps/site`,
          'lint:oxlint:rest': `${base} --ignore-pattern 'apps/extension/**' --ignore-pattern 'apps/site/**'`,
        }),
      ),
    ).toEqual([])
  })

  test('a catch-all that does not ignore a path shard lints its files twice', () => {
    expect(
      checkOxlintShards(
        sharded({
          'lint:oxlint:site': `${base} apps/site`,
          'lint:oxlint:rest': base,
        }),
      ),
    ).toEqual([
      'lint:oxlint:rest must ignore exactly apps/site/** (it ignores nothing)',
    ])
  })

  test('a path shard that does not ignore a nested shard lints its files twice', () => {
    expect(
      checkOxlintShards(
        sharded({
          'lint:oxlint:lib': `${base} apps/extension/lib`,
          'lint:oxlint:extension': `${base} apps/extension`,
          'lint:oxlint:rest': `${base} --ignore-pattern 'apps/extension/**'`,
        }),
      ),
    ).toEqual([
      'lint:oxlint:extension must ignore exactly apps/extension/lib/** (it ignores nothing)',
    ])
  })

  test('an ignore that no shard covers drops files from the lint', () => {
    expect(
      checkOxlintShards(
        sharded({
          'lint:oxlint:site': `${base} apps/site`,
          'lint:oxlint:rest': `${base} --ignore-pattern 'apps/site/**' --ignore-pattern 'apps/video/**'`,
        }),
      ),
    ).toEqual([
      'lint:oxlint:rest must ignore exactly apps/site/** (it ignores apps/site/**, apps/video/**)',
    ])
  })

  test('every shard runs the same Oxlint flags, and one shard is the catch-all', () => {
    expect(
      checkOxlintShards(
        sharded({ 'lint:oxlint:site': 'oxlint --deny-warnings apps/site' }),
      ),
    ).toEqual([
      `lint:oxlint:site must start with "${base}"`,
      'lint:oxlint needs exactly one shard without a path (found 0)',
    ])
  })

  test('lint:oxlint must run its shards in parallel through bun', () => {
    expect(checkOxlintShards({ 'lint:oxlint': base })).toEqual([
      'lint:oxlint must be "bun run --parallel --no-exit-on-error" followed by its lint:oxlint:* shards',
    ])
  })

  test('the repo lint:oxlint shards lint every file exactly once', () => {
    const rootScripts = JSON.parse(
      readFileSync(new URL('../package.json', import.meta.url), 'utf8'),
    ) as { scripts: Record<string, string> }
    expect(checkOxlintShards(rootScripts.scripts)).toEqual([])
  })
})
