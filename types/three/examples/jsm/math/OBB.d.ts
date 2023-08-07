import { Box3, Matrix3, Matrix4, Plane, Ray, Sphere, Vector3 } from '../../../src/Three';

export class OBB {
    center: Vector3;
    halfSize: Vector3;
    rotation: Matrix3;

    constructor(center?: Vector3, halfSize?: Vector3, rotation?: Matrix3);
    set(center: Vector3, halfSize: Vector3, rotation: Matrix3): this;
    copy(obb: OBB): this;
    clone(): this;
    getSize(result: Vector3): Vector3;
    clampPoint(point: Vector3, result: Vector3): Vector3;
    containsPoint(point: Vector3): boolean;
    intersectsBox3(box3: Box3): boolean;
    intersectsSphere(sphere: Sphere): boolean;
    intersectsOBB(obb: OBB, epsilon: number): boolean;
    intersectsPlane(plane: Plane): boolean;
    intersectRay(ray: Ray, result: Vector3): Vector3 | null;
    intersectsRay(ray: Ray): boolean;
    fromBox3(box3: Box3): this;
    equals(obb: OBB): boolean;
    applyMatrix4(matrix: Matrix4): this;
}
