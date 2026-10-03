import { storeCaptions } from '../copy'
import type { SceneProps } from '../schema'
import { Placeholder } from './Placeholder'

export const ImportScene = ({ locale }: SceneProps) => (
  <Placeholder
    name="import"
    headline={storeCaptions(locale).import.headline}
    locale={locale}
  />
)
