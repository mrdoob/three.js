import { ColorRepresentation } from '../utils';
import { Color } from './../math/Color';

export interface FogBase {
    name: string;
    color: Color;
    clone(): FogBase;
    toJSON(): any;
}

/**
 * This class contains the parameters that define linear fog, i.e., that grows linearly denser with the distance.
 */
export class Fog implements FogBase {
    constructor(color: ColorRepresentation, near?: number, far?: number);

    /**
     * @default ''
     */
    name: string;

    /**
     * Fog color.
     */
    color: Color;

    /**
     * The minimum distance to start applying fog. Objects that are less than 'near' units from the active camera won't be affected by fog.
     * @default 1
     */
    near: number;

    /**
     * The maximum distance at which fog stops being calculated and applied. Objects that are more than 'far' units away from the active camera won't be affected by fog.
     * @default 1000
     */
    far: number;

    readonly isFog: true;

    clone(): Fog;
    toJSON(): any;
}
