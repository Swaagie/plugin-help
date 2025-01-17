import indent = require('indent-string')
import stripAnsi = require('strip-ansi')

const width = require('string-width')
const wrap = require('wrap-ansi')

const widestLine = require('widest-line')

export function renderList(input: (string | undefined)[][], opts: {maxWidth: number; multiline?: boolean; stripAnsi?: boolean; spacer?: string}): string {
  if (input.length === 0) {
    return ''
  }
  const renderMultiline = () => {
    let output = ''
    for (let [left, right] of input) {
      if (!left && !right) continue
      if (left) {
        if (opts.stripAnsi) left = stripAnsi(left)
        output += wrap(left.trim(), opts.maxWidth, {hard: true, trim: true})
      }
      if (right) {
        if (opts.stripAnsi) right = stripAnsi(right)
        output += '\n'
        output += indent(wrap(right.trim(), opts.maxWidth - 2, {hard: true, trim: true}), 4)
      }
      output += '\n\n'
    }
    return output.trim()
  }
  if (opts.multiline) return renderMultiline()
  const maxLength = widestLine(input.map(i => i[0]).join('\n'))
  let output = ''
  let spacer = opts.spacer || '\n'
  let cur = ''
  for (const [left, r] of input) {
    let right = r
    if (cur) {
      output += spacer
      output += cur
    }
    cur = left || ''
    if (opts.stripAnsi) cur = stripAnsi(cur)
    if (!right) {
      cur = cur.trim()
      continue
    }
    if (opts.stripAnsi) right = stripAnsi(right)
    right = wrap(right.trim(), opts.maxWidth - (maxLength + 2), {hard: true, trim: true})
    // right = wrap(right.trim(), screen.stdtermwidth - (maxLength + 4), {hard: true, trim: false})
    const [first, ...lines] = right!.split('\n').map(s => s.trim())
    cur += ' '.repeat(maxLength - width(cur) + 2)
    cur += first
    if (lines.length === 0) {
      continue
    }
    // if we start putting too many lines down, render in multiline format
    if (lines.length > 4) return renderMultiline()
    // if spacer is not defined, separate all rows with extra newline
    if (!opts.spacer) spacer = '\n\n'
    cur += '\n'
    cur += indent(lines.join('\n'), maxLength + 2)
  }
  if (cur) {
    output += spacer
    output += cur
  }
  return output.trim()
}
