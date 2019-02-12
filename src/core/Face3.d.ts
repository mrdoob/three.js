import { Vector3 } from './../math/Vector3';
import { Color } from './../math/Color';

export interface Event {
  type: string;
  target?: any;
  [attachment: string]: any;
}

/**
 * Triangle face.
 *
 * # Example
 *     var normal = new THREE.Vector3( 0, 1, 0 );
 *     var color = new THREE.Color( 0xffaa00 );
 *     var face = new THREE.Face3( 0, 1, 2, normal, color, 0 );
 *
 * @source https://github.com/mrdoob/three.js/blob/master/src/core/Face3.js
 */
export class Face3 {
  /**
   * @param a Vertex A index.
   * @param b Vertex B index.
   * @param c Vertex C index.
   * @param normal Face normal or array of vertex normals.
   * @param color Face color or array of vertex colors.
   * @param materialIndex Material index.
   */
  constructor(
    a: number,
    b: number,
    c: number,
    normal?: Vector3,
    color?: Color,
    materialIndex?: number
  );
  constructor(
    a: number,
    b: number,
    c: number,
    normal?: Vector3,
    vertexColors?: Color[],
    materialIndex?: number
  );
  constructor(
    a: number,
    b: number,
    c: number,
    vertexNormals?: Vector3[],
    color?: Color,
    materialIndex?: number
  );
  constructor(
    a: number,
    b: number,
    c: number,
    vertexNormals?: Vector3[],
    vertexColors?: Color[],
    materialIndex?: number
  );

  /**
   * Vertex A index.
   */
  a: number;

  /**
   * Vertex B index.
   */
  b: number;

  /**
   * Vertex C index.
   */
  c: number;

  /**
   * Face normal.
   */
  normal: Vector3;

  /**
   * Array of 4 vertex normals.
   */
  vertexNormals: Vector3[];

  /**
   * Face color.
   */
  color: Color;

  /**
   * Array of 4 vertex normals.
   */
  vertexColors: Color[];

  /**
   * Material index (points to {@link Geometry.materials}).
   */
  materialIndex: number;

  clone(): this;
  copy(source: Face3): this;
}
