export interface LayoutRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface ScreenLayout {
  header: LayoutRect;
  content: LayoutRect;
  footer: LayoutRect;
}

export interface LayoutOptions {
  margin?: number;
  top?: number;
  gap?: number;
  headerHeight?: number;
  footerHeight?: number;
}

export function createScreenLayout(
  width: number,
  height: number,
  options: LayoutOptions = {}
): ScreenLayout {
  const margin = options.margin ?? 16;
  const top = options.top ?? 12;
  const gap = options.gap ?? 12;
  const headerHeight = options.headerHeight ?? 52;
  const footerHeight = options.footerHeight ?? 62;
  const usableWidth = width - margin * 2;

  return {
    header: { x: margin, y: top, width: usableWidth, height: headerHeight },
    content: {
      x: margin,
      y: top + headerHeight + gap,
      width: usableWidth,
      height: height - top - headerHeight - gap * 2 - footerHeight,
    },
    footer: {
      x: margin,
      y: height - margin - footerHeight,
      width: usableWidth,
      height: footerHeight,
    },
  };
}

export function insetRect(rect: LayoutRect, padding: number): LayoutRect {
  return {
    x: rect.x + padding,
    y: rect.y + padding,
    width: rect.width - padding * 2,
    height: rect.height - padding * 2,
  };
}

export function splitRectColumns(rect: LayoutRect, count: number, gap: number): LayoutRect[] {
  const width = Math.floor((rect.width - gap * (count - 1)) / count);

  return Array.from({ length: count }, (_, index) => ({
    x: rect.x + index * (width + gap),
    y: rect.y,
    width,
    height: rect.height,
  }));
}

export function splitRectRows(rect: LayoutRect, count: number, gap: number): LayoutRect[] {
  const height = Math.floor((rect.height - gap * (count - 1)) / count);

  return Array.from({ length: count }, (_, index) => ({
    x: rect.x,
    y: rect.y + index * (height + gap),
    width: rect.width,
    height,
  }));
}
