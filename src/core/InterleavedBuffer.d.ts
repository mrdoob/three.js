import { InterleavedBufferAttribute } from './InterleavedBufferAttribute';
import { Usage } from '../constants';

/**
 * @see {@link https://github.com/mrdoob/three.js/blob/master/src/core/InterleavedBuffer.js|src/core/InterleavedBuffer.js}
 */
export class InterleavedBuffer {

	constructor( array: ArrayLike<number>, stride: number );

	array: ArrayLike<number>;
	stride: number;
	usage: Usage;
	updateRange: { offset: number; count: number };
	version: number;
	length: number;
	count: number;
	needsUpdate: boolean;
	uuid: string;

	setUsage( usage: Usage ): InterleavedBuffer;
	clone( data: object ): this;
	copy( source: InterleavedBuffer ): this;
	copyAt(
		index1: number,
		attribute: InterleavedBufferAttribute,
		index2: number
	): InterleavedBuffer;
	set( value: ArrayLike<number>, index: number ): InterleavedBuffer;
	toJSON( data: object ): {
		uuid: string,
		buffer: string,
		type: string,
		stride: number
	};

}
