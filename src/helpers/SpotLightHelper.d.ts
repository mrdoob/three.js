import { Light } from './../lights/Light';
import { Matrix4 } from './../math/Matrix4';
import { Object3D } from './../core/Object3D';
import { LineSegments } from '../objects/LineSegments';
import { ColorRepresentation } from '../utils';

export class SpotLightHelper extends Object3D {
    constructor(light: Light, color?: ColorRepresentation);

    light: Light;
    matrix: Matrix4;

    /**
     * @default false
     */
    matrixAutoUpdate: boolean;
    color: ColorRepresentation | undefined;
    cone: LineSegments;

    dispose(): void;
    update(): void;
}
