import { storeCaptions } from '../copy'
import type { SceneProps } from '../schema'
import { Placeholder } from './Placeholder'

export const ExportScene = ({ locale }: SceneProps) => (
  <Placeholder
    name="export"
    headline={storeCaptions(locale).export.headline}
    locale={locale}
  />
)
