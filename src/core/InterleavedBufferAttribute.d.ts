import { InterleavedBuffer } from './InterleavedBuffer';
/**
 * @see <a href="https://github.com/mrdoob/three.js/blob/master/src/core/InterleavedBufferAttribute.js">src/core/InterleavedBufferAttribute.js</a>
 */
export class InterleavedBufferAttribute {

	constructor(
		interleavedBuffer: InterleavedBuffer,
		itemSize: number,
		offset: number,
		normalized?: boolean
	);

	uuid: string;
	data: InterleavedBuffer;
	itemSize: number;
	offset: number;
	count: number;
	normalized: boolean;
	array: any[];

	getX( index: number ): number;
	setX( index: number, x: number ): InterleavedBufferAttribute;
	getY( index: number ): number;
	setY( index: number, y: number ): InterleavedBufferAttribute;
	getZ( index: number ): number;
	setZ( index: number, z: number ): InterleavedBufferAttribute;
	getW( index: number ): number;
	setW( index: number, z: number ): InterleavedBufferAttribute;
	setXY( index: number, x: number, y: number ): InterleavedBufferAttribute;
	setXYZ(
		index: number,
		x: number,
		y: number,
		z: number
	): InterleavedBufferAttribute;
	setXYZW(
		index: number,
		x: number,
		y: number,
		z: number,
		w: number
	): InterleavedBufferAttribute;
	/**
   * @deprecated Use {@link InterleavedBufferAttribute#count .count} instead.
   */
	length: number;

}
