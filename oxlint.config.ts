import { defineConfig } from 'oxlint'
import type { DummyRuleMap, OxlintGlobals, OxlintOverride } from 'oxlint'

// @ts-expect-error -- WXT generates this module without type declarations
import wxtAutoImports from './apps/extension/.wxt/eslint-auto-imports.mjs'

/**
 * Punctuation/symbol-only JSX text that `react/jsx-no-literals` (the one
 * `eslint-plugin-react` rule still used; `@eslint-react` has no equivalent)
 * would otherwise flag as copy — none of these carry translatable meaning.
 */
const JSX_NO_LITERALS_ALLOWED_STRINGS = [
  '/',
  /**
   * The exported HTML file's fixed extension — a technical suffix, not
   * translatable copy.
   */
  '.html',
  '—',
]

/**
 * Per-component exceptions to `shadcn/no-restyle`, each encoding one real,
 * bounded design decision rather than disabling the rule outright.
 *
 * - `Input`: the popup/dialog UI has no responsive breakpoints, so every
 *   `Input` locks in the `md:` text-sm size instead of also carrying the
 *   mobile-only text-base. A few inputs also overlay a leading icon and
 *   need matching start padding to keep typed text clear of it.
 * - `Label`: the time-picker's Hours/Minutes/Period captions intentionally
 *   use a smaller, muted treatment instead of Label's default typography —
 *   there is no dedicated caption variant for this yet.
 * - `CardTitle`/`CardDescription`: the settings and auto-export pages render a
 *   deliberately compact title/description scale (bolder + smaller than
 *   Card's own defaults).
 * - `Button`, `DropdownMenuRadioItem`, `AccordionTrigger`: the light-theme
 *   focus ring must reach 3:1, so the site's `focus-ring-solid` utility
 *   replaces the registry's translucent `ring-ring/50`. The FAQ trigger also
 *   takes `accordion-icon-sync` so its icon turns on the panel's 200ms curve.
 */
const shadcnNoRestyleContracts = [
  {
    pattern: '^Input$',
    allow: ['layout', 'text-sm', 'pl-8'],
  },
  {
    pattern: '^Label$',
    allow: ['layout', 'text-xs', 'text-muted-foreground'],
  },
  {
    pattern: '^Card$',
    allow: ['layout', 'ring-primary/50', 'ring-destructive/40'],
  },
  {
    pattern: '^CardTitle$',
    allow: [
      'layout',
      'text-sm',
      'font-semibold',
      'text-2xl',
      'leading-tight',
      'hyphens-auto',
    ],
  },
  {
    pattern: '^Badge$',
    allow: ['layout', 'font-mono'],
  },
  {
    pattern: '^Button$',
    allow: ['layout', 'focus-ring-solid'],
  },
  {
    pattern: '^DropdownMenuRadioItem$',
    allow: ['layout', 'focus-ring-solid'],
  },
  {
    pattern: '^AccordionTrigger$',
    allow: ['layout', 'focus-ring-solid', 'accordion-icon-sync'],
  },
  {
    pattern: '^CardFooter$',
    allow: ['layout', 'border-t-0', 'bg-transparent', 'pt-0'],
  },
  {
    pattern: '^CardDescription$',
    allow: ['layout', 'text-xs', 'text-base'],
  },
]

/**
 * Shape of the globals the generated WXT module exposes to ESLint.
 */
interface WxtAutoImports {
  languageOptions: { globals: Record<string, boolean> }
}

/**
 * Names of the globals WXT auto-imports, read from the generated
 * `.wxt/eslint-auto-imports.mjs` so they stay in sync with `wxt prepare`.
 */
const wxtGlobals: OxlintGlobals = Object.fromEntries(
  Object.keys((wxtAutoImports as WxtAutoImports).languageOptions.globals).map(
    (name) => [name, 'writable'],
  ),
)

/**
 * `eslint-plugin-jsx-a11y` recommended rules, natively ported.
 */
const jsxA11yRules: DummyRuleMap = {
  'jsx-a11y/alt-text': 'error',
  'jsx-a11y/anchor-is-valid': 'error',
  'jsx-a11y/aria-activedescendant-has-tabindex': 'error',
  'jsx-a11y/aria-props': 'error',
  'jsx-a11y/aria-proptypes': 'error',
  'jsx-a11y/aria-role': 'error',
  'jsx-a11y/aria-unsupported-elements': 'error',
  'jsx-a11y/autocomplete-valid': 'error',
  'jsx-a11y/click-events-have-key-events': 'error',
  'jsx-a11y/heading-has-content': 'error',
  'jsx-a11y/html-has-lang': 'error',
  'jsx-a11y/iframe-has-title': 'error',
  'jsx-a11y/img-redundant-alt': 'error',
  'jsx-a11y/interactive-supports-focus': [
    'error',
    {
      tabbable: [
        'button',
        'checkbox',
        'link',
        'searchbox',
        'spinbutton',
        'switch',
        'textbox',
      ],
    },
  ],
  'jsx-a11y/label-has-associated-control': 'error',
  'jsx-a11y/media-has-caption': 'error',
  'jsx-a11y/mouse-events-have-key-events': 'error',
  'jsx-a11y/no-access-key': 'error',
  'jsx-a11y/no-autofocus': 'error',
  'jsx-a11y/no-distracting-elements': 'error',
  'jsx-a11y/no-interactive-element-to-noninteractive-role': [
    'error',
    { tr: ['none', 'presentation'], canvas: ['img'] },
  ],
  'jsx-a11y/no-noninteractive-element-interactions': [
    'error',
    {
      handlers: [
        'onClick',
        'onError',
        'onLoad',
        'onMouseDown',
        'onMouseUp',
        'onKeyPress',
        'onKeyDown',
        'onKeyUp',
      ],
      alert: ['onKeyUp', 'onKeyDown', 'onKeyPress'],
      body: ['onError', 'onLoad'],
      dialog: ['onKeyUp', 'onKeyDown', 'onKeyPress'],
      iframe: ['onError', 'onLoad'],
      img: ['onError', 'onLoad'],
    },
  ],
  'jsx-a11y/no-noninteractive-element-to-interactive-role': [
    'error',
    {
      ul: [
        'listbox',
        'menu',
        'menubar',
        'radiogroup',
        'tablist',
        'tree',
        'treegrid',
      ],
      ol: [
        'listbox',
        'menu',
        'menubar',
        'radiogroup',
        'tablist',
        'tree',
        'treegrid',
      ],
      li: [
        'menuitem',
        'menuitemradio',
        'menuitemcheckbox',
        'option',
        'row',
        'tab',
        'treeitem',
      ],
      table: ['grid'],
      td: ['gridcell'],
      fieldset: ['radiogroup', 'presentation'],
    },
  ],
  'jsx-a11y/no-noninteractive-tabindex': [
    'error',
    { tags: [], roles: ['tabpanel'], allowExpressionValues: true },
  ],
  'jsx-a11y/no-redundant-roles': 'error',
  'jsx-a11y/no-static-element-interactions': [
    'error',
    {
      allowExpressionValues: true,
      handlers: [
        'onClick',
        'onMouseDown',
        'onMouseUp',
        'onKeyPress',
        'onKeyDown',
        'onKeyUp',
      ],
    },
  ],
  'jsx-a11y/role-supports-aria-props': 'error',
  'jsx-a11y/scope': 'error',
  'jsx-a11y/tabindex-no-positive': 'error',
}

/**
 * `eslint-plugin-jsx-a11y` rules whose native port diverges from the original
 * on `render`-prop anchors and `treeitem` roles, run as the original ESLint
 * rules through the `jsx-a11y-js` jsPlugin.
 */
const jsxA11yOriginalRules: DummyRuleMap = {
  'jsx-a11y-js/anchor-has-content': 'error',
  'jsx-a11y-js/role-has-required-aria-props': 'error',
}

/**
 * `eslint-plugin-unicorn` recommended rules that Oxlint ports natively, with this repo's overrides.
 */
const unicornNativeRules: DummyRuleMap = {
  'unicorn/catch-error-name': 'error',
  'unicorn/consistent-assert': 'error',
  'unicorn/consistent-date-clone': 'error',
  'unicorn/consistent-empty-array-spread': 'error',
  'unicorn/consistent-existence-index-check': 'error',
  'unicorn/consistent-template-literal-escape': 'error',
  'unicorn/error-message': 'error',
  'unicorn/escape-case': 'error',
  'unicorn/explicit-timer-delay': 'error',
  'unicorn/filename-case': [
    'error',
    {
      cases: { kebabCase: true, pascalCase: true },
      ignore: [String.raw`^\[.+\]`, String.raw`^\(.+\)`],
    },
  ],
  'unicorn/import-style': 'error',
  'unicorn/max-nested-calls': 'error',
  'unicorn/new-for-builtins': 'error',
  'unicorn/no-abusive-eslint-disable': 'error',
  'unicorn/no-accessor-recursion': 'error',
  'unicorn/no-anonymous-default-export': 'error',
  'unicorn/no-array-fill-with-reference-type': 'error',
  'unicorn/no-array-method-this-argument': 'error',
  'unicorn/no-array-reduce': ['error', { allowSimpleOperations: false }],
  'unicorn/no-array-reverse': 'error',
  'unicorn/no-array-sort': 'error',
  'unicorn/no-await-expression-member': 'error',
  'unicorn/no-await-in-promise-methods': 'error',
  'unicorn/no-confusing-array-with': 'error',
  'unicorn/no-console-spaces': 'error',
  'unicorn/no-empty-file': 'error',
  'unicorn/no-immediate-mutation': 'error',
  'unicorn/no-instanceof-builtins': 'error',
  'unicorn/no-invalid-fetch-options': 'error',
  'unicorn/no-invalid-remove-event-listener': 'error',
  'unicorn/no-lonely-if': 'error',
  'unicorn/no-magic-array-flat-depth': 'error',
  'unicorn/no-negated-condition': 'error',
  'unicorn/no-negation-in-equality-check': 'error',
  'unicorn/no-new-array': 'error',
  'unicorn/no-new-buffer': 'error',
  'unicorn/no-object-as-default-parameter': 'error',
  'unicorn/no-process-exit': 'error',
  'unicorn/no-single-promise-in-promise-methods': 'error',
  'unicorn/no-static-only-class': 'error',
  'unicorn/no-thenable': 'error',
  'unicorn/no-this-assignment': 'error',
  'unicorn/no-typeof-undefined': 'error',
  'unicorn/no-unnecessary-array-flat-depth': 'error',
  'unicorn/no-unnecessary-array-splice-count': 'error',
  'unicorn/no-unnecessary-await': 'error',
  'unicorn/no-unnecessary-slice-end': 'error',
  'unicorn/no-unreadable-array-destructuring': 'error',
  'unicorn/no-unreadable-iife': 'error',
  'unicorn/no-useless-collection-argument': 'error',
  'unicorn/no-useless-error-capture-stack-trace': 'error',
  'unicorn/no-useless-fallback-in-spread': 'error',
  'unicorn/no-useless-length-check': 'error',
  'unicorn/no-useless-promise-resolve-reject': 'error',
  'unicorn/no-useless-spread': 'error',
  'unicorn/no-useless-switch-case': 'error',
  'unicorn/no-zero-fractions': 'error',
  'unicorn/numeric-separators-style': 'error',
  'unicorn/prefer-add-event-listener': 'error',
  'unicorn/prefer-array-find': 'error',
  'unicorn/prefer-array-flat': 'error',
  'unicorn/prefer-array-flat-map': 'error',
  'unicorn/prefer-array-index-of': 'error',
  'unicorn/prefer-array-some': 'error',
  'unicorn/prefer-at': 'error',
  'unicorn/prefer-bigint-literals': 'error',
  'unicorn/prefer-blob-reading-methods': 'error',
  'unicorn/prefer-class-fields': 'error',
  'unicorn/prefer-classlist-toggle': 'error',
  'unicorn/prefer-code-point': 'error',
  'unicorn/prefer-date-now': 'error',
  'unicorn/prefer-default-parameters': 'error',
  'unicorn/prefer-dom-node-append': 'error',
  'unicorn/prefer-dom-node-remove': 'error',
  'unicorn/prefer-event-target': 'error',
  'unicorn/prefer-export-from': 'error',
  'unicorn/prefer-includes': 'error',
  'unicorn/prefer-keyboard-event-key': 'error',
  'unicorn/prefer-logical-operator-over-ternary': 'error',
  'unicorn/prefer-math-min-max': 'error',
  'unicorn/prefer-math-trunc': 'error',
  'unicorn/prefer-modern-dom-apis': 'error',
  'unicorn/prefer-modern-math-apis': 'error',
  'unicorn/prefer-module': 'error',
  'unicorn/prefer-native-coercion-functions': 'error',
  'unicorn/prefer-negative-index': 'error',
  'unicorn/prefer-node-protocol': 'error',
  'unicorn/prefer-number-coercion': 'error',
  'unicorn/prefer-object-from-entries': 'error',
  'unicorn/prefer-optional-catch-binding': 'error',
  'unicorn/prefer-prototype-methods': 'error',
  'unicorn/prefer-reflect-apply': 'error',
  'unicorn/prefer-regexp-test': 'error',
  'unicorn/prefer-response-static-json': 'error',
  'unicorn/prefer-set-has': 'error',
  'unicorn/prefer-set-size': 'error',
  'unicorn/prefer-single-call': 'error',
  'unicorn/prefer-spread': 'error',
  'unicorn/prefer-string-slice': 'error',
  'unicorn/prefer-string-trim-start-end': 'error',
  'unicorn/prefer-structured-clone': 'error',
  'unicorn/prefer-top-level-await': 'error',
  'unicorn/prefer-type-error': 'error',
  'unicorn/relative-url-style': 'error',
  'unicorn/require-array-join-separator': 'error',
  'unicorn/require-module-attributes': 'error',
  'unicorn/require-module-specifiers': 'error',
  'unicorn/require-number-to-fixed-digits-argument': 'error',
  'unicorn/switch-case-braces': 'error',
  'unicorn/switch-case-break-position': 'error',
  'unicorn/text-encoding-identifier-case': 'error',
  'unicorn/throw-new-error': 'error',
}

/**
 * `eslint-plugin-unicorn` rules with no native Oxlint port, run as the original ESLint rules through the `unicorn-js` jsPlugin.
 */
const unicornOriginalRules: DummyRuleMap = {
  'unicorn-js/explicit-length-check': 'error',
  'unicorn-js/no-useless-undefined': 'error',
  'unicorn-js/consistent-function-scoping': 'error',
  'unicorn-js/prefer-global-this': 'error',
  'unicorn-js/no-document-cookie': 'error',
  'unicorn-js/no-array-callback-reference': 'error',
  'unicorn-js/prefer-ternary': 'error',
  'unicorn-js/prefer-dom-node-text-content': 'error',
  'unicorn-js/prefer-query-selector': 'error',
  'unicorn-js/prefer-string-raw': 'error',
  'unicorn-js/prefer-string-replace-all': 'error',
  'unicorn-js/prefer-string-starts-ends-with': 'error',
  'unicorn-js/prefer-number-properties': 'error',
  'unicorn-js/consistent-class-member-order': 'error',
  'unicorn-js/no-accidental-bitwise-operator': 'error',
  'unicorn-js/no-boolean-sort-comparator': 'error',
  'unicorn-js/no-chained-comparison': 'error',
  'unicorn-js/no-collection-bracket-access': 'error',
  'unicorn-js/no-constant-zero-expression': 'error',
  'unicorn-js/no-double-comparison': 'error',
  'unicorn-js/no-for-loop': 'error',
  'unicorn-js/no-invalid-argument-count': 'error',
  'unicorn-js/no-invalid-character-comparison': 'error',
  'unicorn-js/no-misrefactored-assignment': 'error',
  'unicorn-js/no-named-default': 'error',
  'unicorn-js/no-non-function-verb-prefix': 'error',
  'unicorn-js/no-nonstandard-builtin-properties': 'error',
  'unicorn-js/no-shorthand-property-overrides': 'error',
  'unicorn-js/no-transition-all': 'error',
  'unicorn-js/no-undeclared-class-members': 'error',
  'unicorn-js/no-unnecessary-boolean-comparison': 'error',
  'unicorn-js/no-unsafe-promise-all-settled-values': 'error',
  'unicorn-js/no-useless-coercion': 'error',
  'unicorn-js/no-useless-concat': 'error',
  'unicorn-js/no-useless-iterator-to-array': 'error',
  'unicorn-js/no-useless-template-literals': 'error',
  'unicorn-js/prefer-math-constants': 'error',
  'unicorn-js/require-array-sort-compare': 'error',
  'unicorn-js/require-proxy-trap-boolean-return': 'error',
  'unicorn-js/better-dom-traversing': 'error',
  'unicorn-js/class-reference-in-static-methods': 'error',
  'unicorn-js/consistent-boolean-name': 'error',
  'unicorn-js/consistent-compound-words': 'error',
  'unicorn-js/consistent-conditional-object-spread': 'error',
  'unicorn-js/consistent-export-decorator-position': 'error',
  'unicorn-js/consistent-json-file-read': 'error',
  'unicorn-js/consistent-optional-chaining': 'error',
  'unicorn-js/consistent-tuple-labels': 'error',
  'unicorn-js/default-export-style': 'error',
  'unicorn-js/dom-node-dataset': 'error',
  'unicorn-js/expiring-todo-comments': 'error',
  'unicorn-js/isolated-functions': 'error',
  'unicorn-js/logical-assignment-operators': 'error',
  'unicorn-js/name-replacements': [
    'error',
    { allowList: { utils: true, docs: true, doc: true } },
  ],
  'unicorn-js/no-array-concat-in-loop': 'error',
  'unicorn-js/no-array-from-fill': 'error',
  'unicorn-js/no-array-sort-for-min-max': 'error',
  'unicorn-js/no-array-splice': 'error',
  'unicorn-js/no-async-iterator-callback': 'error',
  'unicorn-js/no-async-promise-finally': 'error',
  'unicorn-js/no-blob-to-file': 'error',
  'unicorn-js/no-break-in-nested-loop': 'error',
  'unicorn-js/no-canvas-to-image': 'error',
  'unicorn-js/no-computed-property-existence-check': 'error',
  'unicorn-js/no-confusing-array-splice': 'error',
  'unicorn-js/no-declarations-before-early-exit': 'error',
  'unicorn-js/no-duplicate-if-branches': 'error',
  'unicorn-js/no-duplicate-logical-operands': 'error',
  'unicorn-js/no-duplicate-loops': 'error',
  'unicorn-js/no-duplicate-set-values': 'error',
  'unicorn-js/no-error-property-assignment': 'error',
  'unicorn-js/no-exports-in-scripts': 'error',
  'unicorn-js/no-for-each': 'error',
  'unicorn-js/no-global-object-property-assignment': 'error',
  'unicorn-js/no-impossible-length-comparison': 'error',
  'unicorn-js/no-incorrect-query-selector': 'error',
  'unicorn-js/no-incorrect-template-string-interpolation': 'error',
  'unicorn-js/no-invalid-well-known-symbol-methods': 'error',
  'unicorn-js/no-late-current-target-access': 'error',
  'unicorn-js/no-late-event-control': 'error',
  'unicorn-js/no-loop-iterable-mutation': 'error',
  'unicorn-js/no-mismatched-map-key': 'error',
  'unicorn-js/no-multiple-promise-resolver-calls': 'error',
  'unicorn-js/no-negated-array-predicate': 'error',
  'unicorn-js/no-negated-comparison': 'error',
  'unicorn-js/no-object-methods-with-collections': 'error',
  'unicorn-js/no-optional-chaining-on-undeclared-variable': 'error',
  'unicorn-js/no-redundant-comparison': 'error',
  'unicorn-js/no-return-array-push': 'error',
  'unicorn-js/no-selector-as-dom-name': 'error',
  'unicorn-js/no-subtraction-comparison': 'error',
  'unicorn-js/no-this-outside-of-class': 'error',
  'unicorn-js/no-top-level-assignment-in-function': 'error',
  'unicorn-js/no-top-level-side-effects': 'error',
  'unicorn-js/no-uncalled-method': 'error',
  'unicorn-js/no-unnecessary-array-flat-map': 'error',
  'unicorn-js/no-unnecessary-fetch-options': 'error',
  'unicorn-js/no-unnecessary-global-this': 'error',
  'unicorn-js/no-unnecessary-nested-ternary': 'error',
  'unicorn-js/no-unnecessary-polyfills': 'error',
  'unicorn-js/no-unnecessary-splice': 'error',
  'unicorn-js/no-unnecessary-string-trim': 'error',
  'unicorn-js/no-unreadable-for-of-expression': 'error',
  'unicorn-js/no-unreadable-object-destructuring': 'error',
  'unicorn-js/no-unsafe-buffer-conversion': 'error',
  'unicorn-js/no-unsafe-property-key': 'error',
  'unicorn-js/no-unsafe-sqlite-interpolation': 'error',
  'unicorn-js/no-unsafe-string-replacement': 'error',
  'unicorn-js/no-unused-builtin-method-return': 'error',
  'unicorn-js/no-unused-iterator-helper': 'error',
  'unicorn-js/no-useless-boolean-cast': 'error',
  'unicorn-js/no-useless-compound-assignment': 'error',
  'unicorn-js/no-useless-continue': 'error',
  'unicorn-js/no-useless-delete-check': 'error',
  'unicorn-js/no-useless-else': 'error',
  'unicorn-js/no-useless-logical-operand': 'error',
  'unicorn-js/no-useless-override': 'error',
  'unicorn-js/no-useless-re-export': 'error',
  'unicorn-js/no-useless-recursion': 'error',
  'unicorn-js/no-useless-set-construction': 'error',
  'unicorn-js/no-using-resource-escape': 'error',
  'unicorn-js/no-xor-as-exponentiation': 'error',
  'unicorn-js/operator-assignment': 'error',
  'unicorn-js/prefer-abort-signal-any': 'error',
  'unicorn-js/prefer-abort-signal-timeout': 'error',
  'unicorn-js/prefer-add-event-listener-options': 'error',
  'unicorn-js/prefer-aggregate-error': 'error',
  'unicorn-js/prefer-array-from-async': 'error',
  'unicorn-js/prefer-array-from-map': 'error',
  'unicorn-js/prefer-array-from-range': 'error',
  'unicorn-js/prefer-array-iterable-methods': 'error',
  'unicorn-js/prefer-array-last-methods': 'error',
  'unicorn-js/prefer-array-slice': 'error',
  'unicorn-js/prefer-await': 'error',
  'unicorn-js/prefer-block-statement-over-iife': 'error',
  'unicorn-js/prefer-boolean-return': 'error',
  'unicorn-js/prefer-combined-guards': 'error',
  'unicorn-js/prefer-continue': 'error',
  'unicorn-js/prefer-direct-iteration': 'error',
  'unicorn-js/prefer-dom-node-html-methods': 'error',
  'unicorn-js/prefer-dom-node-replace-children': 'error',
  'unicorn-js/prefer-early-return': 'error',
  'unicorn-js/prefer-else-if': 'error',
  'unicorn-js/prefer-flat-math-min-max': 'error',
  'unicorn-js/prefer-get-or-insert-computed': 'error',
  'unicorn-js/prefer-global-number-constants': 'error',
  'unicorn-js/prefer-group-by': 'error',
  'unicorn-js/prefer-has-check': 'error',
  'unicorn-js/prefer-hoisting-branch-code': 'error',
  'unicorn-js/prefer-https': 'error',
  'unicorn-js/prefer-identifier-import-export-specifiers': 'error',
  'unicorn-js/prefer-includes-over-repeated-comparisons': 'error',
  'unicorn-js/prefer-iterable-in-constructor': 'error',
  'unicorn-js/prefer-iterator-helpers': 'error',
  'unicorn-js/prefer-iterator-to-array': 'error',
  'unicorn-js/prefer-iterator-to-array-at-end': 'error',
  'unicorn-js/prefer-iterator-zip': 'error',
  'unicorn-js/prefer-location-assign': 'error',
  'unicorn-js/prefer-map-from-entries': 'error',
  'unicorn-js/prefer-math-abs': 'error',
  'unicorn-js/prefer-minimal-ternary': 'error',
  'unicorn-js/prefer-number-is-safe-integer': 'error',
  'unicorn-js/prefer-object-define-properties': 'error',
  'unicorn-js/prefer-object-destructuring-defaults': 'error',
  'unicorn-js/prefer-object-iterable-methods': 'error',
  'unicorn-js/prefer-observer-apis': 'error',
  'unicorn-js/prefer-path2d': 'error',
  'unicorn-js/prefer-private-class-fields': 'error',
  'unicorn-js/prefer-promise-try': 'error',
  'unicorn-js/prefer-promise-with-resolvers': 'error',
  'unicorn-js/prefer-queue-microtask': 'error',
  'unicorn-js/prefer-scoped-selector': 'error',
  'unicorn-js/prefer-set-methods': 'error',
  'unicorn-js/prefer-simple-condition-first': 'error',
  'unicorn-js/prefer-simple-sort-comparator': 'error',
  'unicorn-js/prefer-simplified-conditions': 'error',
  'unicorn-js/prefer-single-array-predicate': 'error',
  'unicorn-js/prefer-single-object-destructuring': 'error',
  'unicorn-js/prefer-single-replace': 'error',
  'unicorn-js/prefer-smaller-scope': 'error',
  'unicorn-js/prefer-split-limit': 'error',
  'unicorn-js/prefer-string-match-all': 'error',
  'unicorn-js/prefer-string-pad-start-end': 'error',
  'unicorn-js/prefer-string-repeat': 'error',
  'unicorn-js/prefer-switch': 'error',
  'unicorn-js/prefer-temporal-conversion': 'error',
  'unicorn-js/prefer-then-catch': 'error',
  'unicorn-js/prefer-toggle-attribute': 'error',
  'unicorn-js/prefer-type-literal-last': 'error',
  'unicorn-js/prefer-unary-minus': 'error',
  'unicorn-js/prefer-unicode-code-point-escapes': 'error',
  'unicorn-js/prefer-url-can-parse': 'error',
  'unicorn-js/prefer-url-href': 'error',
  'unicorn-js/prefer-url-search-parameters': 'error',
  'unicorn-js/prefer-while-loop-condition': 'error',
  'unicorn-js/require-css-escape': 'error',
  'unicorn-js/require-passive-events': 'error',
  'unicorn-js/single-line-block-comment-style': 'error',
}

/**
 * `eslint-plugin-react-hooks` `recommended-latest` rules, natively ported under the `react` plugin, except `config` and `gating`, which have no native port and run as the original rules through the `react-hooks-js` jsPlugin.
 */
const reactHooksRules: DummyRuleMap = {
  'react-hooks-js/config': 'error',
  'react-hooks-js/gating': 'error',
  'react/rules-of-hooks': 'error',
  'react/exhaustive-deps': 'warn',
  'react/static-components': 'error',
  'react/use-memo': 'error',
  'react/void-use-memo': 'error',
  'react/preserve-manual-memoization': 'error',
  'react/incompatible-library': 'warn',
  'react/immutability': 'error',
  'react/globals': 'error',
  'react/refs': 'error',
  'react/set-state-in-effect': 'error',
  'react/error-boundaries': 'error',
  'react/purity': 'error',
  'react/set-state-in-render': 'error',
  'react/unsupported-syntax': 'warn',
}

/**
 * `typescript-eslint` `recommendedTypeChecked` plus the explicit options of the former ESLint config. Type-aware rules run on tsgolint. `no-unused-vars` spells out ESLint's defaults, which have no ignore patterns: Oxlint's own defaults skip `_`-prefixed names.
 */
const typescriptRules: DummyRuleMap = {
  'no-array-constructor': 'error',
  'no-implied-eval': 'off',
  'no-unused-expressions': 'error',
  'no-unused-vars': [
    'error',
    {
      argsIgnorePattern: '^$',
      caughtErrorsIgnorePattern: '^$',
      destructuredArrayIgnorePattern: '^$',
      varsIgnorePattern: '^$',
    },
  ],
  'no-throw-literal': 'off',
  'prefer-promise-reject-errors': 'off',
  'require-await': 'off',
  'typescript/await-thenable': 'error',
  'typescript/ban-ts-comment': 'error',
  'typescript/no-array-delete': 'error',
  'typescript/no-base-to-string': 'error',
  'typescript/no-duplicate-enum-values': 'error',
  'typescript/no-duplicate-type-constituents': 'error',
  'typescript/no-empty-object-type': 'error',
  'typescript/no-explicit-any': 'error',
  'typescript/no-extra-non-null-assertion': 'error',
  'typescript/no-floating-promises': 'error',
  'typescript/no-for-in-array': 'error',
  'typescript/no-implied-eval': 'error',
  'typescript/no-misused-new': 'error',
  'typescript/no-misused-promises': [
    'error',
    { checksVoidReturn: { attributes: false } },
  ],
  'typescript/no-namespace': 'error',
  'typescript/no-non-null-asserted-optional-chain': 'error',
  'typescript/no-redundant-type-constituents': 'error',
  'typescript/no-require-imports': 'error',
  'typescript/no-this-alias': 'error',
  'typescript/no-unnecessary-type-assertion': 'error',
  'typescript/no-unnecessary-type-constraint': 'error',
  'typescript/no-unsafe-argument': 'error',
  'typescript/no-unsafe-assignment': 'error',
  'typescript/no-unsafe-call': 'error',
  'typescript/no-unsafe-declaration-merging': 'error',
  'typescript/no-unsafe-enum-comparison': 'error',
  'typescript/no-unsafe-function-type': 'error',
  'typescript/no-unsafe-member-access': 'error',
  'typescript/no-unsafe-return': 'error',
  'typescript/no-unsafe-unary-minus': 'error',
  'typescript/no-wrapper-object-types': 'error',
  'typescript/only-throw-error': [
    'error',
    {
      allow: [
        { from: 'package', package: '@tanstack/router-core', name: 'Redirect' },
      ],
    },
  ],
  'typescript/prefer-as-const': 'error',
  'typescript/prefer-namespace-keyword': 'error',
  'typescript/prefer-promise-reject-errors': 'error',
  'typescript/require-await': 'error',
  'typescript/restrict-plus-operands': 'error',
  'typescript/restrict-template-expressions': 'error',
  'typescript/triple-slash-reference': 'error',
  'typescript/unbound-method': 'error',
  'typescript/consistent-type-imports': 'error',
  'typescript/no-deprecated': 'warn',
  'no-var': 'error',
  'prefer-const': 'error',
  'prefer-rest-params': 'error',
  'prefer-spread': 'error',
}

/**
 * `@vitest/eslint-plugin` recommended rules.
 */
const vitestRules: DummyRuleMap = {
  'vitest/expect-expect': 'error',
  'vitest/no-commented-out-tests': 'error',
  'vitest/no-conditional-expect': 'error',
  'vitest/no-disabled-tests': 'warn',
  'vitest/no-focused-tests': 'error',
  'vitest/no-identical-title': 'error',
  'vitest/no-import-node-test': 'error',
  'vitest/no-interpolation-in-snapshots': 'error',
  'vitest/no-mocks-import': 'error',
  'vitest/no-standalone-expect': 'error',
  'vitest/no-unneeded-async-expect-function': 'error',
  'vitest/prefer-called-exactly-once-with': 'error',
  'vitest/require-local-test-context-for-concurrent-snapshots': 'error',
  'vitest/valid-describe-callback': 'error',
  'vitest/valid-expect': 'error',
  'vitest/valid-expect-in-promise': 'error',
  'vitest/valid-title': 'error',
}

/**
 * `eslint-plugin-jsdoc` rules that Oxlint ports natively.
 */
const jsdocNativeRules: DummyRuleMap = {
  'jsdoc/check-access': 'error',
  'jsdoc/check-property-names': 'error',
  'jsdoc/check-tag-names': ['error', { typed: true }],
  'jsdoc/empty-tags': 'error',
  'jsdoc/implements-on-classes': 'error',
  'jsdoc/no-blank-blocks': 'off',
  'jsdoc/require-param-description': 'error',
  'jsdoc/require-param-name': 'error',
  'jsdoc/require-param-type': 'off',
  'jsdoc/require-property': 'error',
  'jsdoc/require-property-description': 'error',
  'jsdoc/require-property-name': 'error',
  'jsdoc/require-property-type': 'off',
  'jsdoc/require-returns-description': 'error',
  'jsdoc/require-returns-type': 'off',
  'jsdoc/require-throws-description': 'off',
  'jsdoc/require-throws-type': 'error',
  'jsdoc/require-yields': 'error',
  'jsdoc/require-yields-description': 'off',
  'jsdoc/require-yields-type': 'error',
}

/**
 * `eslint-plugin-jsdoc` rules with no native port, run as the original rules through the `jsdoc-js` jsPlugin. `no-defaults` has a native port, but it only checks `@param` defaults and misses the `@default` tag the original reports, so the original runs instead.
 */
const jsdocOriginalRules: DummyRuleMap = {
  'jsdoc-js/no-defaults': 'error',
  'jsdoc-js/require-param': 'error',
  'jsdoc-js/require-returns': 'error',
  'jsdoc-js/check-alignment': 'error',
  'jsdoc-js/check-param-names': 'error',
  'jsdoc-js/check-types': 'error',
  'jsdoc-js/check-values': 'error',
  'jsdoc-js/escape-inline-tags': 'error',
  'jsdoc-js/informative-docs': 'error',
  'jsdoc-js/multiline-blocks': 'error',
  'jsdoc-js/no-multi-asterisks': 'error',
  'jsdoc-js/no-types': 'error',
  'jsdoc-js/reject-any-type': 'error',
  'jsdoc-js/reject-function-type': 'error',
  'jsdoc-js/require-next-type': 'error',
  'jsdoc-js/require-returns-check': 'error',
  'jsdoc-js/require-yields-check': 'error',
  'jsdoc-js/tag-lines': 'error',
  'jsdoc-js/ts-no-empty-object-type': 'error',
  'jsdoc-js/valid-types': 'error',
}

/**
 * `@eslint-community/eslint-plugin-eslint-comments` recommended rules plus `require-description`, run through the local `eslint-comments` plugin (the upstream jsPlugin crashes on forced report locations, cf. oxc#23330).
 */
const eslintCommentsRules: DummyRuleMap = {
  'eslint-comments/disable-enable-pair': 'error',
  'eslint-comments/no-aggregating-enable': 'error',
  'eslint-comments/no-duplicate-disable': 'error',
  'eslint-comments/no-unlimited-disable': 'error',
  'eslint-comments/no-unused-enable': 'error',
  'eslint-comments/require-description': 'error',
}

/**
 * `@eslint-react` `recommended-type-checked` rules, run as the original ESLint rules through the jsPlugin. `no-leaked-conditional-rendering` is the one type-aware rule and runs through the `typed-react` shim instead.
 */
const eslintReactRules: DummyRuleMap = {
  '@eslint-react/error-boundaries': 'error',
  '@eslint-react/exhaustive-deps': 'warn',
  '@eslint-react/no-access-state-in-setstate': 'error',
  '@eslint-react/no-array-index-key': 'warn',
  '@eslint-react/no-children-count': 'warn',
  '@eslint-react/no-children-for-each': 'warn',
  '@eslint-react/no-children-map': 'warn',
  '@eslint-react/no-children-only': 'warn',
  '@eslint-react/no-children-to-array': 'warn',
  '@eslint-react/no-clone-element': 'warn',
  '@eslint-react/no-component-will-mount': 'error',
  '@eslint-react/no-component-will-receive-props': 'error',
  '@eslint-react/no-component-will-update': 'error',
  '@eslint-react/no-context-provider': 'warn',
  '@eslint-react/no-create-ref': 'error',
  '@eslint-react/no-direct-mutation-state': 'error',
  '@eslint-react/no-forward-ref': 'warn',
  '@eslint-react/no-missing-key': 'error',
  '@eslint-react/no-nested-component-definitions': 'error',
  '@eslint-react/no-nested-lazy-component-declarations': 'error',
  '@eslint-react/no-set-state-in-component-did-mount': 'warn',
  '@eslint-react/no-set-state-in-component-did-update': 'warn',
  '@eslint-react/no-set-state-in-component-will-update': 'warn',
  '@eslint-react/no-unnecessary-use-prefix': 'warn',
  '@eslint-react/no-unsafe-component-will-mount': 'warn',
  '@eslint-react/no-unsafe-component-will-receive-props': 'warn',
  '@eslint-react/no-unsafe-component-will-update': 'warn',
  '@eslint-react/no-unused-class-component-members': 'warn',
  '@eslint-react/no-use-context': 'warn',
  '@eslint-react/purity': 'warn',
  '@eslint-react/rules-of-hooks': 'error',
  '@eslint-react/set-state-in-effect': 'warn',
  '@eslint-react/set-state-in-render': 'error',
  '@eslint-react/static-components': 'error',
  '@eslint-react/unsupported-syntax': 'error',
  '@eslint-react/use-memo': 'error',
  '@eslint-react/use-state': [
    'warn',
    {
      enforceAssignment: true,
      enforceLazyInitialization: true,
      enforceSetterName: true,
    },
  ],
  '@eslint-react/jsx-no-children-prop': 'warn',
  '@eslint-react/jsx-no-children-prop-with-children': 'error',
  '@eslint-react/jsx-no-comment-textnodes': 'warn',
  '@eslint-react/jsx-no-key-after-spread': 'error',
  '@eslint-react/jsx-no-leaked-dollar': 'warn',
  '@eslint-react/jsx-no-leaked-semicolon': 'warn',
  '@eslint-react/jsx-no-namespace': 'error',
  '@eslint-react/rsc-function-definition': 'error',
  '@eslint-react/dom-no-dangerously-set-innerhtml': 'warn',
  '@eslint-react/dom-no-dangerously-set-innerhtml-with-children': 'error',
  '@eslint-react/dom-no-find-dom-node': 'error',
  '@eslint-react/dom-no-flush-sync': 'error',
  '@eslint-react/dom-no-hydrate': 'error',
  '@eslint-react/dom-no-render': 'error',
  '@eslint-react/dom-no-render-return-value': 'error',
  '@eslint-react/dom-no-script-url': 'warn',
  '@eslint-react/dom-no-unsafe-iframe-sandbox': 'warn',
  '@eslint-react/dom-no-use-form-state': 'error',
  '@eslint-react/dom-no-void-elements-with-children': 'error',
  '@eslint-react/web-api-no-leaked-event-listener': 'warn',
  '@eslint-react/web-api-no-leaked-fetch': 'warn',
  '@eslint-react/web-api-no-leaked-intersection-observer': 'warn',
  '@eslint-react/web-api-no-leaked-interval': 'warn',
  '@eslint-react/web-api-no-leaked-resize-observer': 'warn',
  '@eslint-react/web-api-no-leaked-timeout': 'warn',
  '@eslint-react/naming-convention-context-name': 'warn',
  '@eslint-react/naming-convention-id-name': 'warn',
  '@eslint-react/naming-convention-ref-name': 'off',
}

/**
 * Every `shadcn/*` rule, enabled with the repo's `no-restyle` contracts.
 */
const shadcnRules: DummyRuleMap = {
  'shadcn/no-restyle': [
    'error',
    { allow: ['layout'], contracts: shadcnNoRestyleContracts },
  ],
  'shadcn/no-raw-colors': 'error',
  'shadcn/no-arbitrary-values': 'error',
  'shadcn/no-inline-styles': 'error',
  'shadcn/no-unknown-classes': 'error',
  'shadcn/require-static-classes': 'error',
}

/**
 * Every `shadcn/*` rule switched off, for code that is not built from
 * shadcn/ui components.
 */
const shadcnRulesOff: DummyRuleMap = {
  'shadcn/no-restyle': 'off',
  'shadcn/no-raw-colors': 'off',
  'shadcn/no-arbitrary-values': 'off',
  'shadcn/no-inline-styles': 'off',
  'shadcn/no-unknown-classes': 'off',
  'shadcn/require-static-classes': 'off',
}

/**
 * The comment-policy rules (local `no-non-doc-comments`, the `jsdoc` rules
 * plus `jsdoc/informative-docs`, and the `eslint-comments` recommended rules
 * plus `require-description`) — banning non-doc comments and uninformative or
 * undescribed directive comments. `require-jsdoc` stays off: this repo
 * documents only non-obvious exports.
 */
const commentPolicyRules: DummyRuleMap = {
  ...jsdocNativeRules,
  ...jsdocOriginalRules,
  ...eslintCommentsRules,
  'local/no-non-doc-comments': 'error',
}

/**
 * Names of every rule in a rule map, mapped to `off`.
 * @param rules The rule map to switch off.
 * @returns The same rule names, all `off`.
 */
function switchOff(rules: DummyRuleMap): DummyRuleMap {
  return Object.fromEntries(Object.keys(rules).map((name) => [name, 'off']))
}

/**
 * Overrides applied in order; later entries win. Oxlint overrides have no
 * `ignores`, so every exemption is expressed by turning rules `off` in an
 * override that matches the exempt files, placed after the override that
 * enables them.
 */
const overrides: OxlintOverride[] = [
  {
    files: ['**/*.{ts,tsx}'],
    plugins: ['typescript'],
    jsPlugins: [
      '@eslint-react/eslint-plugin',
      { name: 'typed-react', specifier: './oxlint-plugins/typed-react.mjs' },
    ],
    rules: {
      ...typescriptRules,
      ...eslintReactRules,
      '@eslint-react/no-leaked-conditional-rendering': 'off',
      'typed-react/no-leaked-conditional-rendering': 'error',
    },
  },
  {
    files: ['**/*.astro'],
    rules: {
      'unicorn-js/name-replacements': [
        'error',
        {
          allowList: {
            utils: true,
            docs: true,
            doc: true,
            props: true,
            Props: true,
          },
        },
      ],
      'react/jsx-no-target-blank': 'error',
    },
  },
  {
    files: ['**/*.{js,jsx,ts,tsx,astro}'],
    jsPlugins: [{ name: 'shadcn', specifier: '@shadcn/lint' }],
    rules: shadcnRules,
  },
  {
    files: ['**/*.tsx'],
    rules: {
      'react-js/jsx-no-literals': [
        'error',
        {
          noStrings: true,
          ignoreProps: true,
          allowedStrings: JSX_NO_LITERALS_ALLOWED_STRINGS,
        },
      ],
    },
  },
  {
    files: ['**/*.test.ts'],
    plugins: ['vitest'],
    rules: vitestRules,
  },
  {
    /**
     * Test doubles and helpers must keep the async signature of the API
     * they stand in for (`vi.fn(async () => 1)`, `fakeBrowser.*`, a fake
     * `FileSystemDirectoryHandle`), and `await act(async () => ...)` needs
     * the async form to flush effects. They rarely contain an `await`, so
     * `require-await` is off for tests and test helpers only.
     */
    files: ['**/*.test.{ts,tsx}', 'apps/extension/lib/testing/**'],
    plugins: ['typescript'],
    rules: { 'typescript/require-await': 'off' },
  },
  {
    /**
     * Playwright fixtures (`e2e/fixtures.ts`) take a `use` callback per the
     * `@playwright/test` fixture API — an unrelated naming collision with
     * React's `use` hook that `react-hooks/rules-of-hooks` otherwise flags
     * as a misplaced hook call.
     */
    files: ['**/e2e/**'],
    jsPlugins: ['@eslint-react/eslint-plugin'],
    rules: {
      'react/rules-of-hooks': 'off',
      '@eslint-react/rules-of-hooks': 'off',
    },
  },
  {
    files: ['**/*.{ts,tsx,mjs,astro}'],
    plugins: ['jsdoc'],
    jsPlugins: [
      {
        name: 'eslint-comments',
        specifier: './oxlint-plugins/eslint-comments.mjs',
      },
      { name: 'jsdoc-js', specifier: 'eslint-plugin-jsdoc' },
      { name: 'local', specifier: './oxlint-plugins/index.mjs' },
    ],
    rules: commentPolicyRules,
  },
  {
    /**
     * `apps/video/**` is linted with the full rule set except the groups
     * that do not fit Remotion composition code: every `shadcn/*` rule is
     * off because Remotion renders frames from inline styles, raw colors and
     * arbitrary values rather than shadcn/ui components, and
     * `@eslint-react/no-array-index-key` (scenes render fixed lists by frame
     * index), `jsdoc/require-param`, `jsdoc/require-returns`,
     * `unicorn/name-replacements` and `unicorn/consistent-boolean-name` are
     * off because parameter docs and naming conventions are out of scope for
     * composition code.
     */
    files: ['apps/video/**'],
    plugins: ['jsdoc'],
    jsPlugins: [
      { name: 'shadcn', specifier: '@shadcn/lint' },
      '@eslint-react/eslint-plugin',
      { name: 'jsdoc-js', specifier: 'eslint-plugin-jsdoc' },
    ],
    rules: {
      ...shadcnRulesOff,
      '@eslint-react/no-array-index-key': 'off',
      'jsdoc-js/require-param': 'off',
      'jsdoc-js/require-returns': 'off',
      'unicorn-js/name-replacements': 'off',
      'unicorn-js/consistent-boolean-name': 'off',
    },
  },
  {
    /**
     * `packages/ui/**` is the shadcn/ui registry code itself — a generated
     * layer re-synced from the registry and untouched by hand. It is exempt
     * from the React 19 modernization and render-safety rules its output
     * does not follow, from the `shadcn/no-restyle`,
     * `shadcn/no-arbitrary-values` and `shadcn/require-static-classes`
     * rules, from `react/jsx-no-literals`, and permanently from the
     * comment-policy rule groups.
     */
    files: ['packages/ui/**'],
    plugins: ['jsdoc'],
    jsPlugins: [
      { name: 'shadcn', specifier: '@shadcn/lint' },
      '@eslint-react/eslint-plugin',
      { name: 'typed-react', specifier: './oxlint-plugins/typed-react.mjs' },
      {
        name: 'eslint-comments',
        specifier: './oxlint-plugins/eslint-comments.mjs',
      },
      { name: 'jsdoc-js', specifier: 'eslint-plugin-jsdoc' },
      { name: 'local', specifier: './oxlint-plugins/index.mjs' },
    ],
    rules: {
      '@eslint-react/no-array-index-key': 'off',
      '@eslint-react/no-context-provider': 'off',
      '@eslint-react/no-use-context': 'off',
      '@eslint-react/use-state': 'off',
      'typed-react/no-leaked-conditional-rendering': 'off',
      'shadcn/no-restyle': 'off',
      'shadcn/no-arbitrary-values': 'off',
      'shadcn/require-static-classes': 'off',
      'react-js/jsx-no-literals': 'off',
      ...switchOff(commentPolicyRules),
    },
  },
]

export default defineConfig({
  plugins: ['react', 'jsx-a11y', 'unicorn'],
  categories: { correctness: 'off' },
  options: {
    typeAware: true,
    reportUnusedDisableDirectives: 'error',
  },
  env: { builtin: true, es2026: true },
  globals: wxtGlobals,
  settings: {
    'react-x': {
      version: 'detect',
      importSource: 'react',
      polymorphicPropName: 'as',
    },
  },
  jsPlugins: [
    { name: 'unicorn-js', specifier: 'eslint-plugin-unicorn' },
    { name: 'jsx-a11y-js', specifier: 'eslint-plugin-jsx-a11y' },
    { name: 'react-js', specifier: 'eslint-plugin-react' },
    { name: 'react-hooks-js', specifier: 'eslint-plugin-react-hooks' },
  ],
  ignorePatterns: [
    '**/.output/**',
    '**/.wxt/**',
    '**/.astro/**',
    'apps/site/dist/**',
    '**/coverage/**',
    '.claude/skills/**',
    '.claude/worktrees/**',
  ],
  rules: {
    ...jsxA11yRules,
    ...unicornNativeRules,
    ...unicornOriginalRules,
    ...jsxA11yOriginalRules,
    ...reactHooksRules,
  },
  overrides,
})
