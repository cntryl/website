// Askr's For is the supported way to render a list. Rendering an array from a
// plain .map() drops items when the array has element siblings in the same
// parent, which is silent in static output because the SSG renders a string and
// only appears on a fresh client mount.
//
// For declares `each` as a mutable array while every catalog here is readonly,
// so this widens the type without copying.
export function list<T>(items: readonly T[]): T[] {
  return items as T[];
}
