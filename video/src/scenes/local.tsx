import { storeCaptions } from '../copy'
import type { SceneProps } from '../schema'
import { Placeholder } from './Placeholder'

export const LocalScene = ({ locale }: SceneProps) => (
  <Placeholder
    name="local"
    headline={storeCaptions(locale).local.headline}
    locale={locale}
  />
)
