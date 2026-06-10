export interface ViewDimensions {
  w: number;
  h: number;
}

export function screenToPdf(
  px: number,
  py: number,
  pw: number,
  ph: number,
  viewport: ViewDimensions,
  viewSize: ViewDimensions,
) {
  return {
    pdfX: (px / viewport.w) * viewSize.w,
    pdfY: viewSize.h - (py / viewport.h) * viewSize.h - (ph / viewport.h) * viewSize.h,
    pdfW: (pw / viewport.w) * viewSize.w,
    pdfH: (ph / viewport.h) * viewSize.h,
  };
}
