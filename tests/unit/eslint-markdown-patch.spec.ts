import markdown from '@eslint/markdown'
import { Linter } from 'eslint'
import { describe, expect, it } from 'vitest'

/**
 * Guards `patches/@eslint__markdown@8.0.3.patch`. Both halves of that patch fix
 * a crash or a hang that takes down the entire lint run, and neither is in any
 * published release, so nothing else will catch a regression here.
 *
 * See the comment above `patchedDependencies` in `pnpm-workspace.yaml` and
 * https://github.com/blavity/goesto/issues/47.
 */

/**
 * The first three rules reach AST nodes through `sourceCode.getRange()`, and
 * every one of them aborts the run when a node arrives without a position.
 *
 * `no-bare-urls` is here for a different reason. The other three build their
 * report locations with `sourceCode.getLocFromIndex()`, so they only ever
 * consume the backfilled *offset* — they cannot observe whether the backfilled
 * line and column are right. `no-bare-urls` reports the node itself, so ESLint
 * derives the location from `node.position` directly, which is what makes the
 * line arithmetic testable. (It is also the rule in
 * https://github.com/eslint/markdown/issues/710.)
 */
const config: Linter.Config[] = [
  {
    files: ['**/*.md'],
    plugins: { markdown },
    language: 'markdown/gfm',
    rules: {
      'markdown/no-invalid-label-refs': 'error',
      'markdown/no-reversed-media-syntax': 'error',
      'markdown/no-space-in-emphasis': 'error',
      'markdown/no-bare-urls': 'error',
    },
  },
]

/**
 * Line 9 is the load-bearing one: `[https://example.com]` is a GFM autolink
 * literal inside brackets that failed to resolve as a link reference, which is
 * the construct whose nodes reach the rules with no `position` at all.
 */
const lines = [
  '# T',
  '',
  'Invalid label ref [foo][ ] here.',
  '',
  'Reversed (text)[https://example.com] here.',
  '',
  'Emphasis with * spaces * here.',
  '',
  'Unpositioned region [https://example.com] and then [bar][ ] after it.',
  '',
]

/**
 * Column 57 on line 9 is the `[` of `[ ]`, the same relative offset the rule
 * reports at on line 3 where positions were never missing. Asserting the exact
 * position is the point: a fix that left the backfilled positions approximate,
 * or that silenced the rules instead of positioning their nodes, still stops
 * the crash and would pass a weaker assertion.
 *
 * Line 9 column 22 is the one that pins the line arithmetic. Counting only LF
 * as a line ending puts it at 1:41 under CR-only endings — line 1 with an
 * ever-growing column — while LF and CRLF stay correct.
 */
const expected = [
  { line: 3, column: 24, ruleId: 'markdown/no-invalid-label-refs' },
  { line: 5, column: 10, ruleId: 'markdown/no-reversed-media-syntax' },
  { line: 5, column: 17, ruleId: 'markdown/no-bare-urls' },
  { line: 7, column: 15, ruleId: 'markdown/no-space-in-emphasis' },
  { line: 7, column: 22, ruleId: 'markdown/no-space-in-emphasis' },
  { line: 9, column: 22, ruleId: 'markdown/no-bare-urls' },
  { line: 9, column: 57, ruleId: 'markdown/no-invalid-label-refs' },
]

function lint(text: string) {
  return new Linter().verify(text, config, 'fixture.md')
}

describe('@eslint/markdown patch: mdast position backfill', () => {
  // `lineEndingPattern` in the plugin is /\r\n|[\r\n]/u, so a bare CR ends a
  // line just as LF does and CRLF counts once. All three must agree.
  describe.each([
    ['LF', '\n'],
    ['CRLF', '\r\n'],
    ['CR only', '\r'],
  ])('with %s line endings', (_name, eol) => {
    const messages = lint(lines.join(eol))

    it('does not abort the run', () => {
      // The crash surfaces as a fatal parse-level message rather than a rule
      // report, and its text is "Custom getLoc() ..." — ESLint's error handler
      // calls getLoc() on the same unpositioned node and replaces the original
      // "Custom getRange() ..." message.
      expect(messages.filter(message => message.fatal)).toEqual([])
    })

    it('reports every rule at the exact position', () => {
      expect(messages.map(({ line, column, ruleId }) => ({ line, column, ruleId })))
        .toEqual(expected)
    })
  })
})

describe('@eslint/markdown patch: no-reversed-media-syntax backtracking', () => {
  it('returns promptly on parenthesis-dense prose', () => {
    // An unclosed "(" followed by parenthesised asides and no ")[" anywhere.
    // Cost roughly quadruples per two asides against the unpatched pattern —
    // measured here at 235ms for 22, 895ms for 24, 3607ms for 26 and 14458ms
    // for 28, while an ordinary 13 KB document never finished at all.
    //
    // 26 is deliberate: far enough over the budget that a regression fails on
    // the assertion, and short enough that it still *returns* well inside the
    // 10s test timeout rather than wedging the very run this guards.
    const text = `# T\n\n(see ${'(an aside) '.repeat(26)}end of prose.\n`

    const start = performance.now()
    lint(text)
    const elapsed = performance.now() - start

    // Patched, this same input measures about 0.5ms, so the budget leaves
    // three orders of magnitude for a slow machine and still sits 3.6x under
    // the unpatched cost.
    expect(elapsed).toBeLessThan(1000)
  })
})
