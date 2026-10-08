import { describe, expect, it } from 'vitest'

import de from '../../../extension/locales/de.json'
import en from '../../../extension/locales/en.json'
import es from '../../../extension/locales/es.json'
import fr from '../../../extension/locales/fr.json'
import it_ from '../../../extension/locales/it.json'
import ja from '../../../extension/locales/ja.json'
import ko from '../../../extension/locales/ko.json'
import ptBR from '../../../extension/locales/pt_BR.json'
import ru from '../../../extension/locales/ru.json'
import zhCN from '../../../extension/locales/zh_CN.json'
import { splitWords } from './split-words'

type LocaleFile = { extensionManifestName: { message: string } }

const title = (locale: LocaleFile) => locale.extensionManifestName.message

describe('splitWords', () => {
  it('splits an ampersand into its own word (en)', () => {
    expect(splitWords(title(en), 'en')).toEqual([
      'Snug:',
      'Bookmark',
      'Export,',
      'Import',
      '&',
      'Backup',
    ])
  })

  it('keeps the space before a colon (fr)', () => {
    const words = splitWords(title(fr), 'fr')
    expect(words.slice(0, 3)).toEqual(['Snug :', 'export', 'et'])
    expect(words.at(-1)).toBe('local')
  })

  it('keeps a spaced en dash as its own word (de)', () => {
    expect(splitWords(title(de), 'de')).toEqual([
      'Snug',
      '–',
      'Lesezeichen',
      'exportieren,',
      'importieren',
      'und',
      'sichern',
    ])
  })

  it('attaches a full-width colon (zh_CN)', () => {
    expect(splitWords(title(zhCN), 'zh_CN')[0]).toBe('Snug：')
  })

  it('attaches a comma that has no space before it', () => {
    expect(splitWords('Export, Import', 'en')).toEqual(['Export,', 'Import'])
  })

  it('joins closing and sentence punctuation after a space', () => {
    expect(splitWords('Really ?! Yes ; no', 'en')).toEqual([
      'Really ?!',
      'Yes ;',
      'no',
    ])
  })

  it.each([
    ['es', es],
    ['it', it_],
    ['ja', ja],
    ['ko', ko],
    ['pt_BR', ptBR],
    ['ru', ru],
  ] as const)(
    'keeps the first word and colon together (%s)',
    (locale, data) => {
      const words = splitWords(title(data), locale)
      expect(words.length).toBeGreaterThan(2)
      expect(words.join('')).toBe(title(data).replaceAll(/\s+/g, ''))
    },
  )

  it('keeps pt_BR and ru spaced dashes as their own word', () => {
    expect(splitWords(title(ptBR), 'pt_BR').slice(0, 2)).toEqual(['Snug', '—'])
    expect(splitWords(title(ru), 'ru').slice(0, 2)).toEqual(['Snug', '—'])
  })
})
