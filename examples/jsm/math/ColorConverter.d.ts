import {
  Color
} from '../../../src/Three';

export interface HSL {
  h: number;
  s: number;
  l: number;
}

export interface CMYK {
  c: number;
  m: number;
  y: number;
  k: number;
}

export namespace ColorConverter {

  export function setHSV(color: Color, h: number, s: number, v: number): Color;
  export function getHSV(color: Color, target: HSL): HSL;
  export function setCMYK(color: Color, c: number, m: number, y: number, k: number): Color;
  export function getCMYK(color: Color, target: CMYK): CMYK;

}
