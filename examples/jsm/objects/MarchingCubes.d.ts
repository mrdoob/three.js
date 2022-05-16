import { BufferGeometry, Material, Mesh, Color } from '../../../src/Three';

export class MarchingCubes extends Mesh {
    constructor(
        resolution: number,
        material: Material,
        enableUvs?: boolean,
        enableColors?: boolean,
        maxPolyCount?: number,
    );

    enableUvs: boolean;
    enableColors: boolean;

    resolution: number;

    // parameters

    isolation: number;

    // size of field, 32 is pushing it in Javascript :)

    size: number;
    size2: number;
    size3: number;
    halfsize: number;

    // deltas

    delta: number;
    yd: number;
    zd: number;

    field: Float32Array;
    normal_cache: Float32Array;
    palette: Float32Array;

    maxCount: number;
    count: number;

    hasPositions: boolean;
    hasNormals: boolean;
    hasColors: boolean;
    hasUvs: boolean;

    positionArray: Float32Array;
    normalArray: Float32Array;

    uvArray: Float32Array;
    colorArray: Float32Array;

    begin(): void;
    end(): void;

    init(resolution: number): void;

    addBall(ballx: number, bally: number, ballz: number, strength: number, subtract: number, colors?: Color): void;

    addPlaneX(strength: number, subtract: number): void;
    addPlaneY(strength: number, subtract: number): void;
    addPlaneZ(strength: number, subtract: number): void;

    setCell(x: number, y: number, z: number, value: number): void;
    getCell(x: number, y: number, z: number): number;

    blur(intensity: number): void;

    reset(): void;
    render(renderCallback: any): void;
    generateGeometry(): BufferGeometry;
    generateBufferGeometry(): BufferGeometry;
}

export const edgeTable: Int32Array[];
export const triTable: Int32Array[];
