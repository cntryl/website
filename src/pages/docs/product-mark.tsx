import { GaugeIcon, WrenchIcon } from '@askrjs/lucide';
import { logoSrcSet, responsiveLogo } from '../logo';
import type { DocsPortalId } from './types';

// Midge, Fitz, and Cassie ship logo art. Tools and Stress have no mark yet, so
// they use a Lucide icon in the same slot; dropping logo files in and adding an
// id here is the only change needed when art exists.
const productsWithLogos = new Set<DocsPortalId>(['midge', 'fitz', 'cassie']);

// Rendered widths, kept in sync with .product-mark in styles.css so the browser
// can pick a source that covers high-density displays.
const RENDERED_WIDTH = { sm: 24, lg: 112 } as const;

export function ProductMark({
  portalId,
  size = 'sm',
  title,
}: {
  portalId: DocsPortalId;
  size?: 'sm' | 'lg';
  // A hover-only aside, never read by assistive tech (the mark stays
  // aria-hidden) — for the odd person who points a mouse at a cat.
  title?: string;
}) {
  if (productsWithLogos.has(portalId)) {
    const width = RENDERED_WIDTH[size];
    const logo = logoSrcSet(`${portalId}-logo`, size);
    return (
      <img
        class="product-mark"
        data-mark-size={size}
        src={logo.src}
        {...responsiveLogo(`${portalId}-logo`, size, width)}
        alt=""
        aria-hidden="true"
        title={title}
        width={width}
        height={width}
      />
    );
  }
  const iconSize = size === 'lg' ? 40 : 18;
  return (
    <span
      class="product-mark product-mark--icon"
      data-mark-size={size}
      aria-hidden="true"
      title={title}
    >
      {portalId === 'stress' ? (
        <GaugeIcon size={iconSize} aria-hidden="true" />
      ) : (
        <WrenchIcon size={iconSize} aria-hidden="true" />
      )}
    </span>
  );
}
