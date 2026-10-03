import { storeCaptions } from '../copy'
import type { SceneProps } from '../schema'
import { Placeholder } from './Placeholder'

export const AutoExportScene = ({ locale }: SceneProps) => (
  <Placeholder
    name="auto-export"
    headline={storeCaptions(locale).autoExport.headline}
    locale={locale}
  />
)
