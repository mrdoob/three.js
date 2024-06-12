import { Vector3 } from 'three';
import { Box3 } from 'three';
import { Plane } from 'three';
import { Matrix4 } from 'three';

/**
 * @deprecated Use three-js-extra-public instead
 */

export class Cone {
    constructor(v?: Vector3, axis?: Vector3, theta?: number, inf?: number, sup?: number);

    set(v: Vector3, axis: Vector3, theta: number, inf?: number, sup?: number): Cone;
    clone(): Cone;
    copy(cone: Cone): Cone;
    empty(): boolean;
    containsPoint(poin: Vector3): boolean;
    getBoundingBox(target: Box3): Box3;
    equals(cone: Cone): boolean;
}