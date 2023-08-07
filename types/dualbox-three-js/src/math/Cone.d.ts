import { Vector3 } from './Vector3';
import { Box3 } from './Box3';
import { Plane } from './Plane';
import { Matrix4 } from './Matrix4';

export class Cone {
    constructor(v: Vector3?, axis: Vector3?, theta: number?, inf: number?, sup: number?);

    set(v: Vector3, axis: Vector3, theta: number, inf: number?, sup: number?): Cone;
    clone(): Cone;
    copy(cone: Cone): Cone;
    empty(): boolean;
    containsPoint(poin: Vector3): boolean;
    getBoundingBox(target: Box3): Box3;
    equals(cone: Cone): boolean;
}