import { BufferGeometry } from './BufferGeometry';
import { BufferAttribute } from './BufferAttribute';

/**
 * @see <a href="https://github.com/mrdoob/three.js/blob/master/examples/js/BufferGeometryUtils.js">examples/js/BufferGeometryUtils.js</a>
 */
export namespace BufferGeometryUtils {
  export function mergeBufferGeometries(
    geometries: BufferGeometry[]
  ): BufferGeometry;
  export function computeTangents(geometry: BufferGeometry): null;
  export function mergeBufferAttributes(
    attributes: BufferAttribute[]
  ): BufferAttribute;
}

/**
 * @deprecated
 */
export namespace GeometryUtils {
  /**
   * @deprecated Use {@link Geometry#merge geometry.merge( geometry2, matrix, materialIndexOffset )} instead.
   */
  export function merge(
    geometry1: any,
    geometry2: any,
    materialIndexOffset?: any
  ): any;
  /**
   * @deprecated Use {@link Geometry#center geometry.center()} instead.
   */
  export function center(geometry: any): any;
}

/**
 * @see <a href="https://github.com/mrdoob/three.js/blob/master/src/core/InstancedBufferAttribute.js">src/core/InstancedBufferAttribute.js</a>
 */
export class InstancedBufferAttribute extends BufferAttribute {
  constructor(
    data: ArrayLike<number>,
    itemSize: number,
    meshPerAttribute?: number
  );

  meshPerAttribute: number;
}
