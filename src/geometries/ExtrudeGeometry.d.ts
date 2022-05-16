import { Curve } from './../extras/core/Curve';
import { Vector2 } from './../math/Vector2';
import { Vector3 } from './../math/Vector3';
import { Shape } from './../extras/core/Shape';
import { BufferGeometry } from './../core/BufferGeometry';

export interface ExtrudeGeometryOptions {
    /**
     * @default 12
     */
    curveSegments?: number | undefined;
    /**
     * @default 1
     */
    steps?: number | undefined;
    /**
     * @default 100
     */
    depth?: number | undefined;
    /**
     * @default true
     */
    bevelEnabled?: boolean | undefined;
    /**
     * @default 6
     */
    bevelThickness?: number | undefined;
    bevelSize?: number | undefined;
    /**
     * @default 0
     */
    bevelOffset?: number | undefined;
    /**
     * @default 3
     */
    bevelSegments?: number | undefined;
    extrudePath?: Curve<Vector3> | undefined;
    UVGenerator?: UVGenerator | undefined;
}

export interface UVGenerator {
    generateTopUV(
        geometry: ExtrudeGeometry,
        vertices: number[],
        indexA: number,
        indexB: number,
        indexC: number,
    ): Vector2[];
    generateSideWallUV(
        geometry: ExtrudeGeometry,
        vertices: number[],
        indexA: number,
        indexB: number,
        indexC: number,
        indexD: number,
    ): Vector2[];
}

export class ExtrudeGeometry extends BufferGeometry {
    constructor(shapes?: Shape | Shape[], options?: ExtrudeGeometryOptions);

    /**
     * @default 'ExtrudeGeometry'
     */
    type: string;

    addShapeList(shapes: Shape[], options?: any): void;
    addShape(shape: Shape, options?: any): void;

    static fromJSON(data: any): ExtrudeGeometry;
}

export { ExtrudeGeometry as ExtrudeBufferGeometry };
