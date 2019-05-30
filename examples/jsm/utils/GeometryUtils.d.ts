import {
  BufferGeometry,
  Face3,
  Geometry,
  Vector3
} from '../../../src/Three';

export namespace GeometryUtils {
  /**
   * @deprecated Use {@link Geometry#merge geometry.merge( geometry2, matrix, materialIndexOffset )} instead.
   */
  export function merge(geometry1: Geometry, geometry2: Geometry, materialIndexOffset?: number): void;
  /**
   * @deprecated Use {@link Geometry#center geometry.center()} instead.
   */
  export function center(geometry: Geometry): Geometry;

  export function randomPointInTriangle(vectorA: Vector3, vectorB: Vector3, vectorC: Vector3): Vector3;
  export function randomPointInFace(face: Face3, geometry: Geometry): Vector3;
  export function randomPointsInGeometry(geometry: Geometry, n: number): Vector3[];
  export function randomPointsInBufferGeometry(geometry: BufferGeometry, n: number): Vector3[];
  export function triangleArea(vectorA: Vector3, vectorB: Vector3, vectorC: Vector3): number;
  export function hilbert2D(center?: Vector3, size?: number, iterations?: number, v0?: number, v1?: number, v2?: number, v3?: number): Vector3[];
  export function hilbert3D(center?: Vector3, size?: number, iterations?: number, v0?: number, v1?: number, v2?: number, v3?: number, v4?: number, v5?: number, v6?: number, v7?: number): Vector3[];
}
