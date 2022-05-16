import { Vector3 } from './../math/Vector3';
import { Line } from './../objects/Line';
import { Mesh } from './../objects/Mesh';
import { Object3D } from './../core/Object3D';
import { ColorRepresentation } from '../utils';

// Extras / Helpers /////////////////////////////////////////////////////////////////////

export class ArrowHelper extends Object3D {
    /**
     * @param [dir] Direction from origin. Must be a unit vector.
     * @param [origin] Point at which the arrow starts.
     * @param [length] Length of the arrow.
     * @param [color] Hexadecimal value to define color.
     * @param [headLength] The length of the head of the arrow.
     * @param [headWidth] The width of the head of the arrow.
     */
    constructor(
        dir?: Vector3,
        origin?: Vector3,
        length?: number,
        color?: ColorRepresentation,
        headLength?: number,
        headWidth?: number,
    );

    /**
     * @default 'ArrowHelper'
     */
    type: string;

    /**
     * Contains the line part of the arrowHelper.
     */
    line: Line;

    /**
     * Contains the cone part of the arrowHelper.
     */
    cone: Mesh;

    /**
     * @param dir The desired direction. Must be a unit vector.
     */
    setDirection(dir: Vector3): void;

    /**
     * @param length The desired length.
     * @param [headLength] The length of the head of the arrow.
     * @param [headWidth] The width of the head of the arrow.
     */
    setLength(length: number, headLength?: number, headWidth?: number): void;

    /**
     * @param color The desired color.
     */
    setColor(color: ColorRepresentation): void;
}
