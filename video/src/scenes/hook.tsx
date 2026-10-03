import { VIDEO_COPY } from '../copy'
import type { SceneProps } from '../schema'
import { Placeholder } from './Placeholder'

export const HookScene = ({ locale }: SceneProps) => (
  <Placeholder name="hook" headline={VIDEO_COPY[locale].hook} locale={locale} />
)
