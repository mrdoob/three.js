import { BufferAttribute } from './BufferAttribute';
import { InterleavedBuffer } from './InterleavedBuffer';
import { Matrix4 } from './../math/Matrix4';
import { Matrix } from './../math/Matrix3';
/**
 * see {@link https://github.com/mrdoob/three.js/blob/master/src/core/InterleavedBufferAttribute.js|src/core/InterleavedBufferAttribute.js}
 */
export class InterleavedBufferAttribute {
    constructor(interleavedBuffer: InterleavedBuffer, itemSize: number, offset: number, normalized?: boolean);

    /**
     * @default ''
     */
    name: string;
    data: InterleavedBuffer;
    itemSize: number;
    offset: number;

    /**
     * @default false
     */
    normalized: boolean;

    get count(): number;
    get array(): ArrayLike<number>;
    set needsUpdate(value: boolean);

    readonly isInterleavedBufferAttribute: true;

    applyMatrix4(m: Matrix4): this;
    clone(data?: object): BufferAttribute;
    getX(index: number): number;
    setX(index: number, x: number): this;
    getY(index: number): number;
    setY(index: number, y: number): this;
    getZ(index: number): number;
    setZ(index: number, z: number): this;
    getW(index: number): number;
    setW(index: number, z: number): this;
    setXY(index: number, x: number, y: number): this;
    setXYZ(index: number, x: number, y: number, z: number): this;
    setXYZW(index: number, x: number, y: number, z: number, w: number): this;
    toJSON(data?: object): {
        isInterleavedBufferAttribute: true;
        itemSize: number;
        data: string;
        offset: number;
        normalized: boolean;
    };
    applyNormalMatrix(matrix: Matrix): this;
    transformDirection(matrix: Matrix): this;
}
