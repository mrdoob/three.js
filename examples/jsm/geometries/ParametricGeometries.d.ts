import {
  Curve,
  Vector3
} from '../../../src/Three';

export namespace ParametricGeometries  {
  export function klein(v: number, u: number, target: Vector3): Vector3;
  export function plane(width: number, height: number, target: Vector3): Vector3;
  export function mobius(u: number, t: number, target: Vector3): Vector3;
  export function mobius3d(u: number, t: number, target: Vector3): Vector3;

  export class TubeGeometry {
    constructor(path: Curve<Vector3>, segments?: number, radius?: number, segmentsRadius?: number, closed?: boolean, debug?: boolean);
  }

  export class TorusKnotGeometry {
    constructor(radius?: number, tube?: number, segmentsT?: number, segmentsR?: number, p?: number, q?: number);
  }

  export class SphereGeometry {
    constructor(size: number, u: number, v);
  }

  export class PlaneGeometry {
    constructor(width: number, depth: number, segmentsWidth: number, segmentsDepth: number);
  }
}
