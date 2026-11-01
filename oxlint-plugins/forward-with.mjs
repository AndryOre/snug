/**
 * Wraps `target` in a Proxy over an empty object that forwards every read to
 * `target` (binding functions to it) except for the keys in `overrides`.
 * The Proxy wraps `{}` rather than `target` because Oxlint freezes its
 * context and `sourceCode`, and a Proxy `get` trap may not report a different
 * value for a non-configurable, non-writable property of its target.
 * @param target The object to forward reads to.
 * @param overrides Values returned instead of the target's for those keys.
 * @returns The forwarding Proxy.
 */
export function forwardWith(target, overrides) {
  return new Proxy(
    {},
    {
      get(_, key) {
        if (Object.hasOwn(overrides, key)) {
          return overrides[key]
        }
        const value = Reflect.get(target, key, target)
        return typeof value === 'function' ? value.bind(target) : value
      },
    },
  )
}
