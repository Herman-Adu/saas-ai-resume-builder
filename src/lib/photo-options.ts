export const photoShapes = ["circle", "squircle", "square"] as const;
export const photoPositions = ["left", "right"] as const;
export const photoSizes = ["small", "medium", "large"] as const;

export type PhotoShape = (typeof photoShapes)[number];
export type PhotoPosition = (typeof photoPositions)[number];
export type PhotoSize = (typeof photoSizes)[number];

export const defaultPhotoShape: PhotoShape = "squircle";
export const defaultPhotoPosition: PhotoPosition = "left";
export const defaultPhotoSize: PhotoSize = "medium";

export function isPhotoShape(value: unknown): value is PhotoShape {
  return photoShapes.some((shape) => shape === value);
}

export function isPhotoPosition(value: unknown): value is PhotoPosition {
  return photoPositions.some((position) => position === value);
}

export function isPhotoSize(value: unknown): value is PhotoSize {
  return photoSizes.some((size) => size === value);
}

// Resumes saved before the photo got its own shape only have the border
// style, so it stays the fallback and those CVs look exactly as they did.
export function parsePhotoShape(
  value: string | null | undefined,
  borderStyle: string | null | undefined,
): PhotoShape {
  if (isPhotoShape(value)) return value;
  if (isPhotoShape(borderStyle)) return borderStyle;
  return defaultPhotoShape;
}

export function parsePhotoPosition(
  value: string | null | undefined,
): PhotoPosition {
  return isPhotoPosition(value) ? value : defaultPhotoPosition;
}

export function parsePhotoSize(value: string | null | undefined): PhotoSize {
  return isPhotoSize(value) ? value : defaultPhotoSize;
}

const radii: Record<PhotoShape, string> = {
  square: "0px",
  circle: "9999px",
  squircle: "10%",
};

const pixels: Record<PhotoSize, number> = {
  small: 72,
  medium: 100,
  large: 132,
};

export function photoRadius(shape: PhotoShape): string {
  return radii[shape];
}

export function photoPixels(size: PhotoSize): number {
  return pixels[size];
}
