export interface HSL {
  h: number;
  s: number;
  l: number;
}

/**
 * Represents a color. See also {@link ColorUtils}.
 *
 * @example
 * var color = new THREE.Color( 0xff0000 );
 *
 * @see <a href="https://github.com/mrdoob/three.js/blob/master/src/math/Color.js">src/math/Color.js</a>
 */
export class Color {
  constructor(color?: Color | string | number);
  constructor(r: number, g: number, b: number);

  /**
   * Red channel value between 0 and 1. Default is 1.
   */
  r: number;

  /**
   * Green channel value between 0 and 1. Default is 1.
   */
  g: number;

  /**
   * Blue channel value between 0 and 1. Default is 1.
   */
  b: number;

  set(color: Color): Color;
  set(color: number): Color;
  set(color: string): Color;
  setScalar(scalar: number): Color;
  setHex(hex: number): Color;

  /**
   * Sets this color from RGB values.
   * @param r Red channel value between 0 and 1.
   * @param g Green channel value between 0 and 1.
   * @param b Blue channel value between 0 and 1.
   */
  setRGB(r: number, g: number, b: number): Color;

  /**
   * Sets this color from HSL values.
   * Based on MochiKit implementation by Bob Ippolito.
   *
   * @param h Hue channel value between 0 and 1.
   * @param s Saturation value channel between 0 and 1.
   * @param l Value channel value between 0 and 1.
   */
  setHSL(h: number, s: number, l: number): Color;

  /**
   * Sets this color from a CSS context style string.
   * @param contextStyle Color in CSS context style format.
   */
  setStyle(style: string): Color;

  /**
   * Clones this color.
   */
  clone(): this;

  /**
   * Copies given color.
   * @param color Color to copy.
   */
  copy(color: Color): this;

  /**
   * Copies given color making conversion from gamma to linear space.
   * @param color Color to copy.
   */
  copyGammaToLinear(color: Color, gammaFactor?: number): Color;

  /**
   * Copies given color making conversion from linear to gamma space.
   * @param color Color to copy.
   */
  copyLinearToGamma(color: Color, gammaFactor?: number): Color;

  /**
   * Converts this color from gamma to linear space.
   */
  convertGammaToLinear(): Color;

  /**
   * Converts this color from linear to gamma space.
   */
  convertLinearToGamma(): Color;

  /**
   * Returns the hexadecimal value of this color.
   */
  getHex(): number;

  /**
   * Returns the string formated hexadecimal value of this color.
   */
  getHexString(): string;

  getHSL(target: HSL): HSL;

  /**
   * Returns the value of this color in CSS context style.
   * Example: rgb(r, g, b)
   */
  getStyle(): string;

  offsetHSL(h: number, s: number, l: number): this;

  add(color: Color): this;
  addColors(color1: Color, color2: Color): this;
  addScalar(s: number): this;
  sub(color: Color): this;
  multiply(color: Color): this;
  multiplyScalar(s: number): this;
  lerp(color: Color, alpha: number): this;
  lerpHSL(color: Color, alpha: number): this;
  equals(color: Color): boolean;
  fromArray(rgb: number[], offset?: number): this;
  toArray(array?: number[], offset?: number): number[];
}
