import { BufferGeometry } from './BufferGeometry';
import { BufferAttribute } from './BufferAttribute';

/**
 * see {@link https://github.com/mrdoob/three.js/blob/master/examples/jsm/utils/BufferGeometryUtils.js|examples/jsm/utils/BufferGeometryUtils.js}
 */
export namespace BufferGeometryUtils {
    function mergeBufferGeometries(geometries: BufferGeometry[]): BufferGeometry;
    function computeTangents(geometry: BufferGeometry): null;
    function mergeBufferAttributes(attributes: BufferAttribute[]): BufferAttribute;
}

/**
 * @deprecated
 */
export namespace GeometryUtils {
    /**
     * @deprecated Use {@link Geometry#merge geometry.merge( geometry2, matrix, materialIndexOffset )} instead.
     */
    function merge(geometry1: any, geometry2: any, materialIndexOffset?: any): any;
    /**
     * @deprecated Use {@link Geometry#center geometry.center()} instead.
     */
    function center(geometry: any): any;
}

/**
 * see {@link https://github.com/mrdoob/three.js/blob/master/src/core/InstancedBufferAttribute.js|src/core/InstancedBufferAttribute.js}
 */
export class InstancedBufferAttribute extends BufferAttribute {
    constructor(array: ArrayLike<number>, itemSize: number, normalized?: boolean, meshPerAttribute?: number);

    /**
     * @default 1
     */
    meshPerAttribute: number;
}
