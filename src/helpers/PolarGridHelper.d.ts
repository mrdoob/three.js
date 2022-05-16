import { LineSegments } from '../objects/LineSegments';
import { ColorRepresentation } from '../utils';

export class PolarGridHelper extends LineSegments {
    /**
     * @param [radius=10]
     * @param [radials=16]
     * @param [circles=8]
     * @param [divisions=64]
     * @param [color1=0x444444]
     * @param [color2=0x888888]
     */
    constructor(
        radius?: number,
        radials?: number,
        circles?: number,
        divisions?: number,
        color1?: ColorRepresentation,
        color2?: ColorRepresentation,
    );

    /**
     * @default 'PolarGridHelper'
     */
    type: string;
}
