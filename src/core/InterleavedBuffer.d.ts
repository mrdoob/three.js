import { InterleavedBufferAttribute } from './InterleavedBufferAttribute';

/**
 * @see <a href="https://github.com/mrdoob/three.js/blob/master/src/core/InterleavedBuffer.js">src/core/InterleavedBuffer.js</a>
 */
export class InterleavedBuffer {

	constructor( array: ArrayLike<number>, stride: number );

  array: ArrayLike<number>;
  stride: number;
  dynamic: boolean;
  updateRange: { offset: number; count: number };
  version: number;
  length: number;
  count: number;
  needsUpdate: boolean;

  setArray( array?: ArrayBufferView ): void;
  setDynamic( dynamic: boolean ): InterleavedBuffer;
  clone(): this;
  copy( source: InterleavedBuffer ): this;
  copyAt(
    index1: number,
    attribute: InterleavedBufferAttribute,
    index2: number
  ): InterleavedBuffer;
  set( value: ArrayLike<number>, index: number ): InterleavedBuffer;

}
