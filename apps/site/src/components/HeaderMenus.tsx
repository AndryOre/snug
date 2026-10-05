import LanguageSwitcher, {
  type LanguageSwitcherProperties,
} from './LanguageSwitcher'
import ThemeMenu, { type ThemeMenuCopy } from './ThemeMenu'

interface HeaderMenusProperties {
  theme: ThemeMenuCopy
  language: LanguageSwitcherProperties
}

/**
 * The header's single island: the theme menu and the language menu side by
 * side, so the header hydrates once.
 * @param props - Each menu's own props, kept grouped rather than flattened.
 * @param props.theme - Copy for the theme menu.
 * @param props.language - Props for the language menu.
 * @returns Both menus in one row.
 */
export default function HeaderMenus({
  theme,
  language,
}: HeaderMenusProperties) {
  return (
    <div className="flex min-w-0 items-center gap-1">
      <ThemeMenu copy={theme} />
      <LanguageSwitcher {...language} />
    </div>
  )
}
