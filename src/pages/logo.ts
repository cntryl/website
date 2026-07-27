// Every logo ships at 64, 128, 256, and 512 square. Small marks never need the
// largest source, so each size band offers only the widths that can win, and
// the browser picks from them using the `sizes` hint at the call site.
const WIDTHS = { sm: [64, 128], lg: [128, 256, 512] } as const;

export function logoSrcSet(name: string, size: 'sm' | 'lg') {
  const widths = WIDTHS[size];
  const path = (width: number) => `/assets/logos/${name}-${width}x${width}.png`;
  return {
    // Browsers that read srcset ignore src, so the fallback is a mid width
    // rather than the largest file.
    src: path(widths[Math.floor(widths.length / 2)]!),
    srcset: widths.map((width) => `${path(width)} ${width}w`).join(', '),
  };
}

// Askr's img prop types cover only src/alt/width/height, so the responsive
// attributes are passed through as a spread.
export function responsiveLogo(
  name: string,
  size: 'sm' | 'lg',
  renderedWidth: number
) {
  return {
    srcset: logoSrcSet(name, size).srcset,
    sizes: `${renderedWidth}px`,
  } as Record<string, string>;
}
