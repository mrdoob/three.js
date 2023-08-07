/**
 * see {@link https://github.com/mrdoob/three.js/blob/master/src/core/GLBufferAttribute.js|src/core/GLBufferAttribute.js}
 */

export class GLBufferAttribute {
    constructor(buffer: WebGLBuffer, type: number, itemSize: number, elementSize: 1 | 2 | 4, count: number);

    buffer: WebGLBuffer;
    type: number;
    itemSize: number;
    elementSize: 1 | 2 | 4;
    count: number;
    version: number;

    readonly isGLBufferAttribute: true;

    set needsUpdate(value: boolean);

    setBuffer(buffer: WebGLBuffer): this;
    setType(type: number, elementSize: 1 | 2 | 4): this;
    setItemSize(itemSize: number): this;
    setCount(count: number): this;
}
