import { Matrix4, Vector3 } from '../../../src/Three';

export interface CSMFrustumVerticies {
    near: Vector3[];
    far: Vector3[];
}

export interface CSMFrustumParameters {
    projectionMatrix?: Matrix4;
    maxFar?: number;
}

export default class CSMFrustum {
    constructor(data?: CSMFrustumParameters);
    vertices: CSMFrustumVerticies;
    setFromProjectionMatrix(projectionMatrix: Matrix4, maxFar: number): CSMFrustumVerticies;
    split(breaks: number[], target: CSMFrustum[]): void;
    toSpace(cameraMatrix: Matrix4, target: CSMFrustum): void;
}
