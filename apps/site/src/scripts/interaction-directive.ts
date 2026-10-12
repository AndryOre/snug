import type { ClientDirective } from 'astro'

import { hydrateOnInteraction } from './hydrate-on-interaction'

/**
 * Astro client directive behind `client:interaction`, registered by
 * `interactionDirective` in `interaction-integration.ts`.
 * @param load - Loads the island's code and resolves to its hydrate function.
 * @param _options - Unused directive options.
 * @param element - The island element.
 */
const interactionDirective: ClientDirective = (load, _options, element) => {
  hydrateOnInteraction(element, load)
}

export default interactionDirective
