import { Color } from '../../../src/Three';

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
    function setHSV(color: Color, h: number, s: number, v: number): Color;
    function getHSV(color: Color, target: HSL): HSL;
    function setCMYK(color: Color, c: number, m: number, y: number, k: number): Color;
    function getCMYK(color: Color, target: CMYK): CMYK;
}
