import type { ComponentType } from 'react'
import { Composition, Folder } from 'remotion'
import { DEFAULT_LOCALE, LOCALES } from './copy'
import { FontGate } from './FontGate'
import { Promo } from './Promo'
import { promoSchema, type SceneProps } from './schema'
import { AutoExportScene } from './scenes/auto-export'
import { CtaScene } from './scenes/cta'
import { ExportScene } from './scenes/export'
import { HookScene } from './scenes/hook'
import { ImportScene } from './scenes/import'
import { LocalScene } from './scenes/local'
import {
  FPS,
  HEIGHT,
  sceneLength,
  TOTAL_FRAMES,
  WIDTH,
  type SceneId,
} from './timing'

const gated =
  (Scene: ComponentType<SceneProps>): ComponentType<SceneProps> =>
  ({ locale }) => (
    <FontGate locale={locale}>
      <Scene locale={locale} />
    </FontGate>
  )

const SCENES: {
  id: SceneId
  name: string
  component: ComponentType<SceneProps>
}[] = [
  { id: 'hook', name: 'Hook', component: gated(HookScene) },
  { id: 'export', name: 'Export', component: gated(ExportScene) },
  { id: 'import', name: 'Import', component: gated(ImportScene) },
  { id: 'autoExport', name: 'AutoExport', component: gated(AutoExportScene) },
  { id: 'local', name: 'Local', component: gated(LocalScene) },
  { id: 'cta', name: 'Cta', component: gated(CtaScene) },
]

const compositionIdFor = (locale: string): string =>
  `Promo-${locale.replace('_', '-')}`

const framing = { fps: FPS, width: WIDTH, height: HEIGHT } as const

export const RemotionRoot = () => (
  <>
    <Composition
      id="Promo"
      component={Promo}
      schema={promoSchema}
      defaultProps={{ locale: DEFAULT_LOCALE }}
      durationInFrames={TOTAL_FRAMES}
      {...framing}
    />
    <Folder name="Scenes">
      {SCENES.map(({ id, name, component }) => (
        <Composition
          key={id}
          id={`Scene-${name}`}
          component={component}
          schema={promoSchema}
          defaultProps={{ locale: DEFAULT_LOCALE }}
          durationInFrames={sceneLength(id)}
          {...framing}
        />
      ))}
    </Folder>
    <Folder name="Locales">
      {LOCALES.map((locale) => (
        <Composition
          key={locale}
          id={compositionIdFor(locale)}
          component={Promo}
          schema={promoSchema}
          defaultProps={{ locale }}
          durationInFrames={TOTAL_FRAMES}
          {...framing}
        />
      ))}
    </Folder>
  </>
)
