import { Matrix4, Mesh, Vector3 } from '../../../src/Three';

export class TubePainter {
    constructor();

    mesh: Mesh;

    stroke(position1: Vector3, position2: Vector3, matrix1: Matrix4, matrix2: Matrix4): void;
    updateGeometry(start: number, end: number): void;
}
