import { VIDEO_COPY } from '../copy'
import type { SceneProps } from '../schema'
import { Placeholder } from './Placeholder'

export const CtaScene = ({ locale }: SceneProps) => (
  <Placeholder name="cta" headline={VIDEO_COPY[locale].cta} locale={locale} />
)
