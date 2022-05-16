import { Object3D } from './../core/Object3D';
import { Matrix4 } from './../math/Matrix4';
import { Bone } from './../objects/Bone';
import { LineSegments } from './../objects/LineSegments';

export class SkeletonHelper extends LineSegments {
    constructor(object: Object3D);

    /**
     * @default 'SkeletonHelper'
     */
    type: string;

    bones: Bone[];
    root: Object3D;

    readonly isSkeletonHelper: true;

    matrix: Matrix4;

    /**
     * @default false
     */
    matrixAutoUpdate: boolean;

    getBoneList(object: Object3D): Bone[];
    update(): void;
}
