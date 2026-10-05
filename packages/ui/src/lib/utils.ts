import { createCn } from 'cn/config'

/**
 * Class-name merger that knows the custom `--text-*` font sizes declared in
 * `globals.css`, so `text-eyebrow` is not mistaken for a text color and dropped
 * when a color class follows it.
 */
export const cn = createCn({
  extend: {
    classGroups: {
      'font-size': [
        {
          text: [
            'display',
            'display-sm',
            'headline',
            'lead',
            'eyebrow',
            'code',
          ],
        },
      ],
    },
  },
})
