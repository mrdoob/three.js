import { Object3D, Sphere, Box3, Mesh, Texture, Vector3 } from '../../../src/Three';

export class OculusHandModel extends Object3D {
    controller: Object3D;
    motionController: Object3D | null;
    envMap: Texture | null;

    mesh: Mesh | null;

    constructor(controller: Object3D);

    updateMatrixWorld(force?: boolean): void;

    getPointerPosition(): Vector3 | null;

    intersectBoxObject(boxObject: Object3D): boolean;

    checkButton(button: Object3D): void;
}
