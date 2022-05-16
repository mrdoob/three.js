import {
    DataTexture,
    Curve,
    Uniform,
    Material,
    InstancedMesh,
    BufferGeometry,
    Mesh,
    Vector3,
} from '../../../src/Three';

export interface SplineUniform {
    spineTexture: Uniform;
    pathOffset: Uniform;
    pathSegment: Uniform;
    spineOffset: Uniform;
    flow: Uniform;
}
export function initSplineTexture(size?: number): DataTexture;

export function updateSplineTexture(texture: DataTexture, splineCurve: Curve<Vector3>, offset?: number): void;

export function getUniforms(splineTexture: DataTexture): SplineUniform;

export function modifyShader(material: Material, uniforms: SplineUniform, numberOfCurves?: number): void;

export class Flow {
    constructor(mesh: Mesh, numberOfCurves?: number);
    curveArray: number[];
    curveLengthArray: number[];
    object3D: Mesh;
    splineTexure: DataTexture;
    uniforms: SplineUniform;
    updateCurve(index: number, curve: Curve<Vector3>): void;
    moveAlongCurve(amount: number): void;
}

export class InstancedFlow extends Flow {
    constructor(count: number, curveCount: number, geometry: BufferGeometry, material: Material);
    object3D: InstancedMesh;
    offsets: number[];
    whichCurve: number[];

    moveIndividualAlongCurve(index: number, offset: number): void;
    setCurve(index: number, curveNo: number): void;
}
