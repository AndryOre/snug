import type { Locale } from './locales'

export type VideoCopy = {
  hook: string
  cta: string
}

/**
 * Strings that exist only in the promo video. Everything else is read from
 * `locales/*.json` and `e2e-store/captions.ts`.
 */
export const VIDEO_COPY: Record<Locale, VideoCopy> = {
  en: {
    hook: 'Your bookmarks, in your hands.',
    cta: 'Available on the Chrome Web Store',
  },
  es: {
    hook: 'Tus marcadores, en tus manos.',
    cta: 'Disponible en Chrome Web Store',
  },
  de: {
    hook: 'Deine Lesezeichen, in deiner Hand.',
    cta: 'Im Chrome Web Store erhältlich',
  },
  fr: {
    hook: 'Vos favoris, entre vos mains.',
    cta: 'Disponible sur le Chrome Web Store',
  },
  it: {
    hook: 'I tuoi segnalibri, nelle tue mani.',
    cta: 'Disponibile sul Chrome Web Store',
  },
  ja: {
    hook: 'ブックマークは、あなたの手元に。',
    cta: 'Chrome ウェブストアで公開中',
  },
  ko: {
    hook: '북마크를 내 손안에.',
    cta: 'Chrome 웹 스토어에서 받기',
  },
  pt_BR: {
    hook: 'Seus favoritos, nas suas mãos.',
    cta: 'Disponível na Chrome Web Store',
  },
  ru: {
    hook: 'Ваши закладки — в ваших руках.',
    cta: 'Доступно в Chrome Web Store',
  },
  zh_CN: {
    hook: '你的书签，由你掌控。',
    cta: '已在 Chrome 应用商店上架',
  },
}
